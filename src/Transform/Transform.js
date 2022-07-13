import {useCallback} from 'react';

import CodeMirror from '@uiw/react-codemirror';
import {javascript} from '@codemirror/lang-javascript';
import tryCatch from 'try-catch';

import putout from 'https://esm.sh/@putout/bundle@1.1.5?dev';
import * as pluginPutout from 'https://esm.sh/@putout/bundle@1.1.5/plugin-putout?dev';
import pluginDeclare from 'https://esm.sh/@putout/plugin-declare-undefined-variables?alias=putout:@putout/bundle';

const createTransform = (transform) => {
    const exports = {};
    const module = {
        exports,
    };
    const fn = Function('require', 'module', 'exports', transform);
    const require = () => putout;
    
    fn(require, module, exports);
    
    return exports;
};

export function Transform({source, transform, setCode, setTransform, setError}) {
    const onChange = useCallback((value) => {
        const [errorTransform, pluginTransform] = tryCatch(createTransform, value);
        
        if (errorTransform) {
            setError(errorTransform);
            return;
        }
        
        const [error, result] = tryCatch(putout, source, {
            plugins: [
                ['declare', pluginDeclare],
                ['putout', pluginPutout],
                ['transform', pluginTransform],
            ],
        });
        
        setError(error);
        
        if (error)
            return;
        
        const {code} = result;
        
        console.log('::::', code);
        
        setCode(code);
        setTransform(value);
    }, [setCode]);
    
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

