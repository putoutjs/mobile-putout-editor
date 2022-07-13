import {useCallback} from 'react';

import CodeMirror from '@uiw/react-codemirror';
import {javascript} from '@codemirror/lang-javascript';
import tryCatch from 'try-catch';

import putout from 'https://esm.sh/@putout/bundle';
import pluginPutout from 'https://esm.sh/@putout/bundle/plugin-putout?dev';
import pluginDeclare from 'https://esm.sh/@putout/plugin-declare-undefined-variables?alias=putout:@putout/bundle';
import pluginConvertESMToCommonJS from 'https://esm.sh/@putout/plugin-convert-esm-to-commonjs?alias=putout:@putout/bundle';

const createTransform = (codeTransform, setInfo) => {
    const exports = {};
    const module = {
        exports,
    };
    
    const {code} = putout(codeTransform, {
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
    const onChange = useCallback((value) => {
        const [errorTransform, pluginTransform] = tryCatch(createTransform, value, setInfo);
        
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
    }, [setCode, setTransform, setError, setInfo]);
    
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

