import path from 'path-browserify';
import {tryToCatch} from 'try-to-catch';
import {tryCatch} from 'try-catch';
import {
    loadBundle,
    loadFlatlint,
    loadPlugins,
} from './putout-loader.js';

const {stringify} = JSON;
const isFn = (a) => typeof a === 'function';
const noop = () => {};

export const parseSource = async (value) => {
    const {parse, traverse} = await loadBundle();
    const ast = parse(value, {
        isTS: true,
    });
    
    traverse(ast, {
        noScope: true,
        enter({node}) {
            delete node.start;
            delete node.end;
            delete node.loc;
            delete node.leadingComments;
            delete node.directives;
        },
    });
    
    const {program} = ast;
    
    delete program.interpreter;
    
    return stringify(program, null, 4);
};

export const createTransform = async ({type, value, setInfo, setError, setFinalTransform, putout}) => {
    const exports = {};
    const module = {
        exports,
    };
    
    const [
        pluginPutout,
        pluginDeclare,
        pluginDeclareBeforeReference,
        pluginConvertConstToLet,
        pluginConvertESMToCommonJS,
        pluginOptionalChaining,
        pluginMergeDestructuringProperties,
        pluginExtractKeywordsFromVariables,
        pluginTypes,
        pluginMaybe,
    ] = await loadPlugins();
    
    const plugins = [
        ['declare', pluginDeclare],
        ['declare-before-reference', pluginDeclareBeforeReference],
        ['putout', pluginPutout],
        ['types', pluginTypes],
        ['maybe', pluginMaybe],
        ['convert-const-to-let', pluginConvertConstToLet],
        ['convert-esm-to-commonjs', pluginConvertESMToCommonJS],
        ['extract-keyword-from-variables', pluginExtractKeywordsFromVariables],
        ['optional-chaining', pluginOptionalChaining],
        ['merge-destructuring-properties', pluginMergeDestructuringProperties],
    ];
    
    const {code, places} = putout(value, {
        fix: true,
        isTS: true,
        rules: {
            'putout/check-replace-code': ['on', {
                once: false,
            }],
        },
        plugins,
    });
    
    if (places.length)
        setError(places[0].message);
    
    setInfo('');
    
    if (type === 'transform')
        setFinalTransform(code);
    
    const console = {
        log: (a) => {
            setInfo(convertToString(a));
        },
    };
    
    const fn = Function('require', 'module', 'exports', 'console', code);
    
    const require = (name) => {
        if (name === 'path' || name === 'node:path')
            return path;
        
        return putout;
    };
    
    fn(require, module, exports, console);
    
    return exports;
};

export const createTransformRunner = (type) => async (value, {source, setInfo, setSource, setError, setCode, setTransform, setResultReady = noop, setFinalTransform}) => {
    const {putout} = await loadBundle();
    let errorTransform;
    let pluginTransform;
    
    [errorTransform, pluginTransform] = await tryToCatch(createTransform, {
        type,
        value,
        setInfo,
        setError,
        putout,
        setFinalTransform,
    });
    
    if (errorTransform) {
        const {lint, plugins} = await loadFlatlint();
        
        [value] = await lint(value, {
            plugins,
        });
        
        [errorTransform, pluginTransform] = await tryToCatch(createTransform, {
            type,
            value,
            setInfo,
            setError,
            putout,
            setFinalTransform,
        });
        
        if (errorTransform) {
            setError(errorTransform);
            
            return;
        }
    }
    
    const [error, result] = tryCatch(putout, source, {
        printer: 'putout',
        isTS: true,
        plugins: [
            ['transform', pluginTransform],
        ],
    });
    
    setError(error);
    
    if (error)
        return;
    
    const {code} = result;
    setCode(code);
    setResultReady(true);
    
    if (type === 'transform') {
        setTransform(value);
        return;
    }
    
    if (type === 'source') {
        setSource(source);
        return;
    }
};

function convertToString(info) {
    if (isFn(info))
        return String(info);
    
    if (info?.node)
        return String(info);
    
    return stringify(info);
}
