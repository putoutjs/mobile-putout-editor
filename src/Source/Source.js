import {useCallback} from 'react';

import CodeMirror from '@uiw/react-codemirror';
import {javascript} from '@codemirror/lang-javascript';
import tryCatch from 'try-catch';

import putout from 'https://esm.sh/@putout/bundle@1.1.5?dev';

export function Source({source, setSource, setError}) {
    const onChange = useCallback((value) => {
        const [error] = tryCatch(putout, value);
        
        setError(error);
        
        if (error)
            return;
        
        setSource(value);
    }, [setError, setSource]);
    
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
