import CodeMirror from '@uiw/react-codemirror';
import {javascript} from '@codemirror/lang-javascript';
import {
    Fade,
    LinearProgress,
} from '@mui/material';
import Box from '@mui/material/Box';

export function Result({code, resultReady}) {
    const extensions = [
        javascript({
            jsx: true,
            typescript: true,
        }),
    ];
    
    return (
        <div>
            <Fade
                in={!resultReady}
                style={{
                    transitionDelay: resultReady ? '800ms' : '0ms',
                }}
                unmountOnExit
            >
                <Box sx={{width: '100%'}}>
                    <LinearProgress color="inherit" variant="indeterminate"/>
                </Box>
            </Fade>
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

