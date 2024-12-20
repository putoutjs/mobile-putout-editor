import {useEffect, useState} from 'react';
import CodeMirror from '@uiw/react-codemirror';
import {json} from '@codemirror/lang-json';
import {vim} from '@replit/codemirror-vim';
import tryToCatch from 'try-to-catch';
import {parseSource} from './trasformer.js';

export function AST({isVim, source, setError}) {
    const [ast, setAST] = useState(`Fasten your seatbelts... 🚀`);
    
    useEffect(() => {
        async function fn() {
            const [error, ast] = await tryToCatch(parseSource, source);
            setAST(ast);
            
            if (error)
                setError(error.message);
        }
        
        fn();
    }, [source, setError]);
    
    const extensions = [
        isVim && vim(),
        json(),
    ].filter(Boolean);
    
    return (
        <CodeMirror
            value={ast}
            height="100%"
            minHeight="100%"
            maxHeight="80vh"
            width="100%"
            readOnly={true}
            theme="dark"
            extensions={extensions}
        />
    );
}
