import {useCallback} from 'react';

import CodeMirror from '@uiw/react-codemirror';
import {javascript} from '@codemirror/lang-javascript';

export function Result({code}) {
    return (
        <CodeMirror
            value={code}
            readOnly={true}
            theme="dark"
            width="100%"
            maxHeight="80vh"
            height="100%"
            minHeight="100%"
            extensions={[javascript({jsx: true})]}
        />
    );
}
