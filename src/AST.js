import {
    useEffect,
    useState,
} from 'react';

import CodeMirror from '@uiw/react-codemirror';
import {json} from '@codemirror/lang-json';

import {parseSource} from './trasformer.js';

export function AST({source}) {
    const [ast, setAST] = useState(`Fasten your seatbelts... 🚀`);
    
    useEffect(() => {
        parseSource(source).then(setAST);
    }, [source]);
    
    return (
        <CodeMirror
            value={ast}
            height="100%"
            minHeight="100%"
            maxHeight="80vh"
            width="100%"
            readOnly={true}
            theme="dark"
            extensions={[json()]}
        />
    );
}

