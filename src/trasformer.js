import path from 'path-browserify';
import tryToCatch from 'try-to-catch';
import tryCatch from 'try-catch';

const {stringify} = JSON;
const isFn = (a) => typeof a === 'function';
const noop = () => {};

export const parseSource = async (value) => {
    const {parse} = await import('https://esm.sh/@putout/engine-parser/babel');
    const {traverse} = await import('https://esm.sh/@putout/bundle');
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
    ] = await Promise.all([
        import('https://esm.sh/@putout/plugin-putout?alias=putout:@putout/bundle&deps=@putout/bundle'),
        import('https://esm.sh/@putout/plugin-declare?alias=putout:@putout/bundle&deps=@putout/bundle'),
        import('https://esm.sh/@putout/plugin-declare-before-reference?alias=putout:@putout/bundle&deps=@putout/bundle'),
        import('https://esm.sh/@putout/plugin-convert-const-to-let?alias=putout:@putout/bundle&deps=@putout/bundle'),
        import('https://esm.sh/@putout/plugin-nodejs/convert-esm-to-commonjs?alias=putout:@putout/bundle&deps=@putout/bundle'),
        import('https://esm.sh/@putout/plugin-optional-chaining?alias=putout:@putout/bundle&deps=@putout/bundle'),
        import('https://esm.sh/@putout/plugin-merge-destructuring-properties?alias=putout:@putout/bundle&deps=@putout/bundle'),
        import('https://esm.sh/@putout/plugin-extract-keywords-from-variables?alias=putout:@putout/bundle&deps=@putout/bundle'),
        import('https://esm.sh/@putout/plugin-types?alias=putout:@putout/bundle&deps=@putout/bundle'),
        import('https://esm.sh/@putout/plugin-maybe?alias=putout:@putout/bundle&deps=@putout/bundle'),
    ]);
    
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
    const {putout} = await import('https://esm.sh/@putout/bundle');
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
        const {lint, plugins} = await import('https://esm.sh/flatlint/with-plugins');
        
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

