'use strict';

const fs = require('fs');
const path = require('path');

const rspack = require('@rspack/core');
const {ReactRefreshRspackPlugin} = require('@rspack/plugin-react-refresh');

const paths = require('./paths');
const modules = require('./modules');
const getClientEnvironment = require('./env');
const createEnvironmentHash = require('./webpack/persistentCache/createEnvironmentHash');

// Source maps are resource heavy and can cause out of memory issue for large source files.
const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';

const imageInlineSizeLimit = parseInt(process.env.IMAGE_INLINE_SIZE_LIMIT || '10000', 10);

// style files regexes — used for rspack native CSS type rules
const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const sassRegex = /\.(scss|sass)$/;
const sassModuleRegex = /\.module\.(scss|sass)$/;

module.exports = (webpackEnv) => {
    const isEnvDevelopment = webpackEnv === 'development';
    const isEnvProduction = webpackEnv === 'production';
    
    // We will provide `paths.publicUrlOrPath` to our app
    // as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
    // Omit trailing slash as %PUBLIC_URL%/xyz looks better than %PUBLIC_URL%xyz.
    // Get environment variables to inject into our app.
    const env = getClientEnvironment(paths.publicUrlOrPath.slice(0, -1));
    
    const shouldUseReactRefresh = env.raw.FAST_REFRESH;
    
    return {
        // Rspack noise constrained to errors and warnings
        stats: 'errors-warnings',
        // Enable rspack's native CSS pipeline (replaces css-loader/style-loader/CssExtractRspackPlugin)
        experiments: {
            css: true,
        },
        mode: isEnvProduction ? 'production' : isEnvDevelopment && 'development',
        // Stop compilation early in production
        bail: isEnvProduction,
        devtool: isEnvProduction ? shouldUseSourceMap && 'source-map' : isEnvDevelopment && 'cheap-module-source-map',
        // These are the "entry points" to our application.
        // This means they will be the "root" imports that are included in JS bundle.
        entry: paths.appIndexJs,
        output: {
            // The build folder.
            path: paths.appBuild,
            // Add /* filename */ comments to generated require()s in the output.
            pathinfo: isEnvDevelopment,
            // There will be one main bundle, and one file per asynchronous chunk.
            // In development, it does not produce real files.
            filename: isEnvProduction ? 'static/js/[name].[contenthash:8].js' : isEnvDevelopment && 'static/js/bundle.js',
            // There are also additional JS chunk files if you use code splitting.
            chunkFilename: isEnvProduction ? 'static/js/[name].[contenthash:8].chunk.js' : isEnvDevelopment && 'static/js/[name].chunk.js',
            assetModuleFilename: 'static/media/[name].[hash][ext]',
            // rspack uses `publicPath` to determine where the app is being served from.
            // It requires a trailing slash, or the file assets will get an incorrect path.
            // We inferred the "public path" (such as / or /my-project) from homepage.
            publicPath: paths.publicUrlOrPath,
            // Point sourcemap entries to original disk location (format as URL on Windows)
            devtoolModuleFilenameTemplate: isEnvProduction ? (info) => path
                .relative(paths.appSrc, info.absoluteResourcePath)
                .replace(/\\/g, '/') : isEnvDevelopment && ((info) => path
                .resolve(info.absoluteResourcePath)
                .replace(/\\/g, '/')),
        },
        cache: {
            type: 'persistent',
            version: createEnvironmentHash(env.raw),
            directory: paths.appWebpackCache,
            buildDependencies: [__filename, paths.appPackageJson].filter(Boolean),
        },
        infrastructureLogging: {
            level: 'none',
        },
        optimization: {
            minimize: isEnvProduction,
            minimizer: [
                // This is only used in production mode
                new rspack.SwcJsMinimizerRspackPlugin(),
                new rspack.LightningCssMinimizerRspackPlugin(),
            ],
        },
        resolve: {
            modules: ['node_modules', paths.appNodeModules].concat(modules.additionalModulePaths || []),
            // These are the reasonable defaults supported by the Node ecosystem.
            // We also include JSX as a common component filename extension to support
            // some tools, although we do not recommend using it, see:
            // https://github.com/facebook/create-react-app/issues/290
            // `web` extension prefixes have been added for better support
            alias: {
                'react-native': 'react-native-web',
                // Allows for better profiling with ReactDevTools
                ...modules.webpackAliases || {},
            },
        },
        module: {
            rules: [
                // Process application JS with SWC (fast transform) + React Compiler (babel pass).
                // Loaders run right-to-left: babel-loader runs React Compiler first,
                // then builtin:swc-loader handles JSX/TS transform and sourcemaps.
                {
                    test: /\.(js|mjs|jsx|ts|tsx)$/,
                    include: paths.appSrc,
                    use: [
                        {
                            loader: 'builtin:swc-loader',
                            options: {
                                detectSyntax: 'auto',
                                jsc: {
                                    transform: {
                                        react: {
                                            runtime: 'automatic',
                                            development: isEnvDevelopment,
                                            refresh: isEnvDevelopment && shouldUseReactRefresh,
                                        },
                                    },
                                },
                                sourceMaps: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment,
                            },
                        },
                        {
                            // React Compiler pass — runs before SWC, emits memoized JS.
                            loader: require.resolve('babel-loader'),
                            options: {
                                plugins: [['babel-plugin-react-compiler', {target: '19'}]],
                                // Don't let babel transform syntax — swc handles that.
                                presets: [],
                                babelrc: false,
                                configFile: false,
                            },
                        },
                    ],
                },
                // Rspack native CSS pipeline — no css-loader/style-loader/CssExtractRspackPlugin needed.
                // Plain CSS (global, ICSS composes): type 'css' handles injection in dev
                // and extraction in production automatically via experiments.css.
                {
                    test: cssRegex,
                    exclude: cssModuleRegex,
                    type: 'css',
                    sideEffects: true,
                },
                // CSS Modules: type 'css/module' enables local scoping.
                {
                    test: cssModuleRegex,
                    type: 'css/module',
                },
                // SASS — run sass-loader first, then hand off to rspack native CSS.
                {
                    test: sassRegex,
                    exclude: sassModuleRegex,
                    use: [{
                        loader: require.resolve('sass-loader'),
                        options: {sourceMap: true},
                    }],
                    type: 'css',
                    sideEffects: true,
                },
                // SASS Modules
                {
                    test: sassModuleRegex,
                    use: [{
                        loader: require.resolve('sass-loader'),
                        options: {sourceMap: true},
                    }],
                    type: 'css/module',
                },
                // "url" loader works like "file" loader except that it embeds assets
                // smaller than specified limit in bytes as data URLs to avoid requests.
                // A missing `test` is equivalent to a match.
                {
                    test: [/.avif$/],
                    type: 'asset',
                    mimetype: 'image/avif',
                    parser: {
                        dataUrlCondition: {
                            maxSize: imageInlineSizeLimit,
                        },
                    },
                },
                {
                    test: [/.bmp$/, /.gif$/, /.jpe?g$/, /.png$/],
                    type: 'asset',
                    parser: {
                        dataUrlCondition: {
                            maxSize: imageInlineSizeLimit,
                        },
                    },
                },
{
                    test: /\.svg$/,
                    use: [{
                        loader: require.resolve('@svgr/webpack'),
                        options: {
                            prettier: false,
                            svgo: false,
                            svgoConfig: {
                                plugins: [{
                                    removeViewBox: false,
                                }],
                            },
                            titleProp: true,
                            ref: true,
                        },
                    }, {
                        loader: require.resolve('file-loader'),
                        options: {
                            name: 'static/media/[name].[hash].[ext]',
                        },
                    }],
                    issuer: {
                        and: [/.\.(ts|tsx|js|jsx|md|mdx)$/],
                    },
                },
                // "file" loader makes sure those assets get served by RspackDevServer.
                // When you `import` an asset, you get its (virtual) filename.
                // In production, they would get copied to the `build` folder.
                // This loader doesn't use a "test" so it will catch all modules
                // that fall through the other loaders.
                {
                    // Exclude `js` files to keep "css" loader working as it injects
                    // its runtime that would otherwise be processed through "file" loader.
                    exclude: [/^$/, /\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
                    type: 'asset/resource',
                },
            ],
        },
        plugins: [
            new rspack.HtmlRspackPlugin({
                inject: true,
                template: paths.appHtml,
                minify: isEnvProduction,
                templateParameters: Object.fromEntries(Object.entries(env.raw).filter(([, value]) => typeof value === 'string')),
            }),
            new rspack.DefinePlugin(env.stringified),
            isEnvDevelopment && shouldUseReactRefresh && new ReactRefreshRspackPlugin(),
            new rspack.IgnorePlugin({
                resourceRegExp: /^\.\/locale$/,
                contextRegExp: /moment$/,
            }),
        ].filter(Boolean),
        performance: false,
    };
};