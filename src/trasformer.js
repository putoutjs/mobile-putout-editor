import tryToCatch from 'try-to-catch';
import tryCatch from 'try-catch';

const {stringify} = JSON;
const isFn = (a) => typeof a === 'function';
const noop = () => {};

export const parseSource = async (value) => {
    const {parse} = await import('https://esm.sh/@putout/engine-parser/babel');
    const {traverse} = await import('https://esm.sh/@putout/bundle@3');
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
        pluginConvertOptionalToLogical,
        pluginMergeDestructuringProperties,
    ] = await Promise.all([
        import('https://esm.sh/@putout/plugin-putout@20.9.1?alias=putout:@putout/bundle&deps=@putout/bundle'),
        import('https://esm.sh/@putout/plugin-declare?alias=putout:@putout/bundle&deps=@putout/bundle'),
        import('https://esm.sh/@putout/plugin-declare-before-reference?alias=putout:@putout/bundle&deps=@putout/bundle'),
        import('https://esm.sh/@putout/plugin-convert-const-to-let?alias=putout:@putout/bundle&deps=@putout/bundle'),
        import('https://esm.sh/@putout/plugin-nodejs/convert-esm-to-commonjs?alias=putout:@putout/bundle&deps=@putout/bundle'),
        import('https://esm.sh/@putout/plugin-convert-optional-to-logical?alias=putout:@putout/bundle&deps=@putout/bundle'),
        import('https://esm.sh/@putout/plugin-merge-destructuring-properties?alias=putout:@putout/bundle&deps=@putout/bundle'),
    ]);
    
    const plugins = [
        ['declare', pluginDeclare.default],
        ['declare-before-reference', pluginDeclareBeforeReference.default],
        ['putout', pluginPutout.default],
        ['convert-const-to-let', pluginConvertConstToLet.default],
        ['convert-esm-to-commonjs', pluginConvertESMToCommonJS],
        ['convert-optional-to-logical', pluginConvertOptionalToLogical],
        ['merge-destructuring-properties', pluginMergeDestructuringProperties],
    ];
    
    const {code} = putout(value, {
        fix: true,
        isTS: true,
        plugins,
    });
    
    // after fix get places
    const {places} = putout(code, {
        fix: false,
        isTS: true,
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
    const require = () => putout;
    
    fn(require, module, exports, console);
    
    return exports;
};

export const createTransformRunner = (type) => async (value, {source, setInfo, setSource, setError, setCode, setTransform, setResultReady = noop, setFinalTransform}) => {
    const putout = (await import('https://esm.sh/@putout/bundle@3')).default;
    
    const [errorTransform, pluginTransform] = await tryToCatch(createTransform, {
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
    
    const [error, result] = tryCatch(putout, source, {
        printer: 'putout',
        isTS: true,
        plugins: [
            ['transform', pluginTransform],
        ],
    });
    
    if (error) {
        setError(error);
        return;
    }
    
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
