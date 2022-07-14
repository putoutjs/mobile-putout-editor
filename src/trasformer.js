import tryToCatch from 'try-to-catch';
import tryCatch from 'try-catch';

export const createTransform = async ({type, value, setInfo, setFinalTransform, putout}) => {
    const exports = {};
    const module = {
        exports,
    };
    
    const pluginPutout = (await import('https://esm.sh/@putout/bundle/plugin-putout')).default;
    const pluginDeclare = (await import('https://esm.sh/@putout/plugin-declare-undefined-variables?alias=putout:@putout/bundle')).default;
    const pluginDeclareBeforeReference = (await import('https://esm.sh/@putout/plugin-declare-before-reference?alias=putout:@putout/bundle')).default;
    const pluginConvertConstToLet = (await import('https://esm.sh/@putout/plugin-convert-const-to-let?alias=putout:@putout/bundle')).default;
    const pluginConvertESMToCommonJS = await import('https://esm.sh/@putout/plugin-convert-esm-to-commonjs?alias=putout:@putout/bundle');
    
    const {code} = putout(value, {
        plugins: [
            ['declare', pluginDeclare],
            ['declare-before-reference', pluginDeclareBeforeReference],
            ['putout', pluginPutout],
            ['convert-esm-to-commonjs', pluginConvertESMToCommonJS],
            ['convert-const-to-let', pluginConvertConstToLet],
        ],
    });
    
    setInfo('');
    
    if (type === 'transform')
        setFinalTransform(code);
    
    const console = {
        log: (a) => setInfo(a),
    };
    const fn = Function('require', 'module', 'exports', 'console', code);
    const require = () => putout;
    
    fn(require, module, exports, console);
    
    return exports;
};

export const createTransformRunner = (type) => async (value, {source, setInfo, setError, setCode, setTransform, setFinalTransform}) => {
    const putout = (await import('https://esm.sh/@putout/bundle')).default;
    
    const [errorTransform, pluginTransform] = await tryToCatch(createTransform, {
        type,
        value,
        setInfo,
        putout,
        setFinalTransform,
    });
    
    if (errorTransform) {
        setError(errorTransform);
        return;
    }
    
    const [error, result] = tryCatch(putout, source, {
        plugins: [
            ['transform', pluginTransform],
        ],
    });
    
    setError(error);
    
    if (error)
        return;
    
    const {code} = result;
    setCode(code);
    
    if (type === 'transform') {
        setTransform(value);
        return;
    }
};

