import './App.css';
import Tabs from './Tabs.js';
import MainMenu from './Menu/Menu.js';
import {
    useState,
    useEffect,
} from 'react';
import DefaultSource from './Source/DefaultSource.js';
import DefaultTransform from './Transform/DefaultTransform.js';
import {fetchFromURL} from './Gist/gist.js';
import once from 'once';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

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
    
    useEffect(() => () => {
        run({
            setTransform,
            setSource,
            setGistReady,
        });
    });
    
    return (
        <div className="App">
            <Backdrop
                sx={{
                    color: '#fff',
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                }}
                open={!gistReady}
            >
                <CircularProgress color="inherit"/>
            </Backdrop>
            <header className="App-header">
                <MainMenu
                    source={source}
                    transform={transform}
                    setTransform={setTransform}
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
            />
        </div>
    );
}

export default App;
