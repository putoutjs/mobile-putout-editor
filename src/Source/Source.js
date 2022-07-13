import {useCallback} from 'react';

import CodeMirror from '@uiw/react-codemirror';
import {javascript} from '@codemirror/lang-javascript';
import tryCatch from 'try-catch';

import putout from 'https://esm.sh/@putout/bundle@1.1.5?dev';
import * as pluginPutout from 'https://esm.sh/@putout/bundle@1.1.5/plugin-putout?dev';
import pluginDeclare from 'https://esm.sh/@putout/plugin-declare-undefined-variables?alias=putout:@putout/bundle';

export function Source({source, setSource, setError}) {
    const onChange = useCallback((value) => {
        console.log('value:', value);
        
        const [error, result] = tryCatch(putout, value, {
            plugins: [
                ['declare', pluginDeclare],
                ['putout', pluginPutout],
            ],
        });
        
        setError(error);
        
        if (error)
            return;
        
        const {code} = result;
        
        setSource(value);
    }, [setSource]);
    
    return (
        <CodeMirror
            value={source}
            height="100%"
            minHeight="100%"
            maxHeight="80vh"
            width="100%"
            extensions={[javascript({jsx: true})]}
            onChange={onChange}
        />
    );
}
