'use strict';

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';
// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', (err) => {
    throw err;
});

// Ensure environment variables are read.
require('../config/env');

const path = require('path');
const fs = require('fs-extra');
const zlib = require('zlib');
const rspack = require('@rspack/core');
const configFactory = require('../config/rspack.config');
const paths = require('../config/paths');

// These sizes are pretty large. We'll warn for bundles exceeding them.
const WARN_AFTER_BUNDLE_GZIP_SIZE = 512 * 1024;
const WARN_AFTER_CHUNK_GZIP_SIZE = 1024 * 1024;

// Warn and crash if required files are missing
if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) process.exit(1);

const argv = process.argv.slice(2);
const writeStatsJson = argv.includes('--stats');

// Generate configuration
const config = configFactory('production');

// Remove all content but keep the directory so that
// if you're in it, you don't end up in Trash
fs.emptyDirSync(paths.appBuild);
// Merge with the public folder
copyPublicFolder();

build()
    .then(({stats, warnings}) => {
        if (warnings.length) {
            console.log('Compiled with warnings.\n');
            console.log(warnings.join('\n\n'));
            console.log('\nSearch for the keywords to learn more about each warning.');
            console.log('To ignore, add // eslint-disable-next-line to the line before.\n');
        } else {
            console.log('Compiled successfully.\n');
        }
        
        console.log('File sizes after gzip:\n');
        printFileSizesAfterBuild(paths.appBuild, stats, WARN_AFTER_BUNDLE_GZIP_SIZE, WARN_AFTER_CHUNK_GZIP_SIZE);
        console.log();
    })
    .catch((err) => {
        if (err?.message)
            console.log(err.message);
        
        process.exit(1);
    });

// Create the production build and print the deployment instructions.
function build() {
    console.log('Creating an optimized production build...');
    
    const compiler = rspack(config);
    
    return new Promise((resolve, reject) => {
        compiler.run((err, stats) => {
            if (err)
                return reject(Error(err.message || err));
            
            const messages = {
                errors: (stats.toJson({
                    all: false,
                    errors: true,
                }).errors || []).map(getMessage),
                warnings: (stats.toJson({
                    all: false,
                    warnings: true,
                }).warnings || []).map(getMessage),
            };
            
            if (messages.errors.length) {
                // Only keep the first error. Others are often indicative
                // of the same problem, but confuse the reader with noise.
                if (messages.errors.length > 1)
                    messages.errors.length = 1;
                
                return reject(Error(messages.errors.join('\n\n')));
            }
            
            if (process.env.CI && (typeof process.env.CI !== 'string' || process.env.CI.toLowerCase() !== 'false') && messages.warnings.length) {
                // Ignore sourcemap warnings in CI builds. See #8227 for more info.
                const filteredWarnings = messages.warnings.filter((w) => !/Failed to parse source map/.test(w));
                
                if (filteredWarnings.length) {
                    console.log('Treating warnings as errors because process.env.CI = true.\n');
                    return reject(Error(filteredWarnings.join('\n\n')));
                }
            }
            
            const writeStats = writeStatsJson
                ? fs.writeJson(paths.appBuild + '/bundle-stats.json', stats.toJson())
                : Promise.resolve();
            
            writeStats.then(() => {
                resolve({
                    stats,
                    warnings: messages.warnings,
                });
            });
        });
    });
}
function checkRequiredFiles(files) {
    return files.every((file) => {
        if (fs.existsSync(file))
            return true;
        
        console.log(`The file ${file} does not exist.`);
        
        return false;
    });
}

function getMessage(item) {
    return String(item?.message || item);
}

function copyPublicFolder() {
    fs.copySync(paths.appPublic, paths.appBuild, {
        dereference: true,
        filter: (file) => file !== paths.appHtml,
    });
}

function printFileSizesAfterBuild(buildFolder, stats, warnAfterBundleGzipSize, warnAfterChunkGzipSize) {
    const sizes = {};
    
    walkDirectory(buildFolder, (file) => {
        sizes[path.relative(buildFolder, file)] = fs.statSync(file).size;
    });
    
    const assets = (stats.toJson({
        all: false,
        assets: true,
    }).assets || [])
        .filter((asset) => !asset.name.endsWith('.map'));
    
    const groups = {
        'JS': [],
        'CSS': [],
        'media': [],
    };
    
    for (const {name} of assets) {
        const group = /\.js$/.test(name) ? 'JS' : /\.css$/.test(name) ? 'CSS' : 'media';
        const size = sizes[name] || 0;
        const gzip = size ? getGzippedSize(fs.readFileSync(path.join(buildFolder, name))) : 0;
        
        groups[group].push({
            name,
            size,
            gzip,
        });
    }
    
    let hasWarned = false;
    
    for (const [group, rows] of Object.entries(groups)) {
        if (!rows.length)
            continue;
        
        console.log(`${group}:`);
        
        for (const row of rows.sort((a, b) => b.size - a.size)) {
            const isBundle = group === 'JS' && /bundle\.js|main\.[a-f0-9]{8}\.js/.test(row.name);
            const warnAfter = isBundle ? warnAfterBundleGzipSize : warnAfterChunkGzipSize;
            
            console.log(`  ${formatSize(row.size)}  ${formatSize(row.gzip)} gzip  ${row.name}`);
            
            if (row.gzip > warnAfter) {
                hasWarned = true;
                console.log(`  ${row.name.replace(/.*\//, '')} (≈${formatSize(row.gzip)} gzip) is larger than the recommended size (${formatSize(warnAfter)}).`);
            }
        }
        
        console.log();
    }
    
    if (hasWarned)
        console.log('Bundle size is larger than the recommended size.\nBundle analysis can be found at https://rspack.dev/guide/optimization/code-splitting.');
}

function walkDirectory(directory, callback) {
    for (const file of fs.readdirSync(directory)) {
        const fullPath = path.join(directory, file);
        
        if (fs.statSync(fullPath).isDirectory())
            walkDirectory(fullPath, callback);
        else
            callback(fullPath);
    }
}

function formatSize(size) {
    if (size >= 1024 ** 3)
        return `${(size / 1024 ** 3).toFixed(2)} GB`;
    
    if (size >= 1024 ** 2)
        return `${(size / 1024 ** 2).toFixed(2)} MB`;
    
    if (size >= 1024)
        return `${(size / 1024).toFixed(2)} KB`;
    
    return `${size} B`;
}

function getGzippedSize(buffer) {
    return zlib.gzipSync(buffer).length;
}
