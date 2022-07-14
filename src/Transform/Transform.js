import {useCallback} from 'react';

import CodeMirror from '@uiw/react-codemirror';
import {javascript} from '@codemirror/lang-javascript';
import tryCatch from 'try-catch';

import tryToCatch from 'try-to-catch';

import {useEffect} from 'react';

const createTransform = async ({value, setInfo, putout}) => {
    const exports = {};
    const module = {
        exports,
    };
    
    const pluginPutout = (await import('https://esm.sh/@putout/bundle/plugin-putout')).default;
    const pluginDeclare = (await import('https://esm.sh/@putout/plugin-declare-undefined-variables?alias=putout:@putout/bundle')).default;
    const pluginConvertESMToCommonJS = await import('https://esm.sh/@putout/plugin-convert-esm-to-commonjs?alias=putout:@putout/bundle');
    
    const {code} = putout(value, {
        plugins: [
            ['declare', pluginDeclare],
            ['putout', pluginPutout],
            ['convert-esm-to-commonjs', pluginConvertESMToCommonJS],
        ],
    });
    
    setInfo('');
    
    const console = {
        log: (a) => setInfo(a),
    };
    const fn = Function('require', 'module', 'exports', 'console', code);
    const require = () => putout;
    
    fn(require, module, exports, console);
    
    return exports;
};

export function Transform({source, transform, setCode, setTransform, setError, setInfo}) {
    const transformCode = async (value) => {
        const putout = (await import('https://esm.sh/@putout/bundle')).default;
        
        const [errorTransform, pluginTransform] = await tryToCatch(createTransform, {
            value,
            setInfo,
            putout,
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
        setTransform(value);
    };
    
    const deps = [
    
    ];
    const onChange = useCallback(transformCode, [source, setCode, setTransform, setError, setInfo]);
    
    useEffect(() => {
        onChange(transform);
    }, [source, transform, onChange, setCode, setTransform, setError, setInfo]);
    
    return (
        <CodeMirror
            value={transform}
            height="100%"
            minHeight="100%"
            maxHeight="80vh"
            width="100%"
            extensions={[javascript({jsx: true})]}
            onChange={onChange}
        />
    );
}

