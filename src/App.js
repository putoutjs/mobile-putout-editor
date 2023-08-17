import './App.css';
import Tabs from './Tabs.js';
import MainMenu from './Menu/Menu.js';
import {useState} from 'react';
import DefaultSource from './Source/DefaultSource.js';
import DefaultTransform from './Transform/DefaultTransform.js';

function App() {
    const [source, setSource] = useState(DefaultSource);
    const [transform, setTransform] = useState(DefaultTransform);
    const [error, setError] = useState(null);
    const [info, setInfo] = useState(null);
    const [success, setSuccess] = useState(null);
    
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
