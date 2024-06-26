import {
    useState,
    useEffect,
    useCallback,
} from 'react';
import {Fade, LinearProgress} from '@mui/material';
import Box from '@mui/material/Box';
import once from 'once';
import './App.css';
import Tabs from './Tabs.js';
import MainMenu from './Menu/Menu.js';
import DefaultSource from './Source/DefaultSource.js';
import DefaultTransform from './Transform/DefaultTransform.js';
import {fetchFromURL} from './Gist/gist.js';

const run = once(async ({setSource, setTransform, setGistReady}) => {
    if (!global.location.hash)
        return;
    
    const revision = await fetchFromURL();
    const {files} = revision._gist;
    
    setSource(files['source.js'].content);
    setTransform(files['transform.js'].content);
    setGistReady(true);
});

function App() {
    const [source, setSource] = useState(DefaultSource);
    const [transform, setTransform] = useState(DefaultTransform);
    const [error, setError] = useState(null);
    const [info, setInfo] = useState(null);
    const [success, setSuccess] = useState(null);
    const [gistReady, setGistReady] = useState(!global.location.hash);
    const [isVim, setIsVim] = useState(false);
    
    const onKeydown = useCallback(() => {
        window.addEventListener('keydown', function on(e) {
            if (e.key === 'Escape') {
                setIsVim(true);
                window.removeEventListener('keydown', on);
            }
        });
    }, [setIsVim]);
    
    useEffect(() => {
        onKeydown(setIsVim);
        run({
            setTransform,
            setSource,
            setGistReady,
        });
    }, [onKeydown]);
    
    return (
        <div className="App">
            <Fade
                in={!gistReady}
                style={{
                    transitionDelay: !gistReady ? '800ms' : '0ms',
                }}
                unmountOnExit
            >
                <Box
                    sx={{
                        width: '100%',
                    }}
                >
                    <LinearProgress color="inherit" variant="indeterminate"/>
                </Box>
            </Fade>
            <header className="App-header">
                <MainMenu
                    source={source}
                    transform={transform}
                    setTransform={setTransform}
                    setSource={setSource}
                    setSuccess={setSuccess}
                />
            </header>
            <Tabs
                source={source}
                setSource={setSource}
                transform={transform}
                setTransform={setTransform}
                error={error}
                info={info}
                setError={setError}
                setInfo={setInfo}
                success={success}
                setSuccess={setSuccess}
                gistReady={gistReady}
                isVim={isVim}
            />
        </div>
    );
}

export default App;
