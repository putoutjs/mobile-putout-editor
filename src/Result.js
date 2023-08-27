import CodeMirror from '@uiw/react-codemirror';
import {javascript} from '@codemirror/lang-javascript';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

export function Result({code, resultReady}) {
    const extensions = [
        javascript({
            jsx: true,
            typescript: true,
        }),
    ];
    
    return (
        <div>
            <Backdrop
                sx={{
                    color: '#fff',
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                }}
                open={!resultReady}
            >
                <CircularProgress color="inherit"/>
            </Backdrop>
            <CodeMirror
                value={code}
                readOnly={true}
                theme="dark"
                width="100%"
                maxHeight="80vh"
                height="100%"
                minHeight="100%"
                extensions={extensions}
            />
        </div>
    );
}

