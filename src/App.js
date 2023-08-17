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

const run = once(async ({setSource, setTransform}) => {
    if (!global.location.hash)
        return;
    
    const revision = await fetchFromURL();
    const {files} = revision._gist;
    
    setSource(files['source.js'].content);
    setTransform(files['transform.js'].content);
});

function App() {
    const [source, setSource] = useState(DefaultSource);
    
    const defaultTransform = global.location.hash ? '' : DefaultTransform;
    const [transform, setTransform] = useState(defaultTransform);
    const [error, setError] = useState(null);
    const [info, setInfo] = useState(null);
    const [success, setSuccess] = useState(null);
    
    useEffect(() => () => {
        run({
            setTransform,
            setSource,
        });
    }, [setSource, setTransform]);
    
    return (
        <div className="App">
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
            />
        </div>
    );
}

export default App;
