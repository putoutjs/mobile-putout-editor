import CodeMirror from '@uiw/react-codemirror';
import {javascript} from '@codemirror/lang-javascript';
import {vim} from '@replit/codemirror-vim';

export function Cooked({isVim, finalTransform}) {
    const extensions = [
        isVim && vim(),
        javascript({
            jsx: true,
            typescript: true,
        }),
    ].filter(Boolean);
    
    return (
        <CodeMirror
            value={finalTransform}
            readOnly={true}
            theme="dark"
            width="100%"
            maxHeight="80vh"
            height="100%"
            minHeight="100%"
            extensions={extensions}
        />
    );
}
