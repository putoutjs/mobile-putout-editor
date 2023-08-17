import './App.css';
import Tabs from './Tabs.js';
import MainMenu from './Menu/Menu.js';
import {useState} from 'react';
import DefaultSource from './Source/DefaultSource.js';
import DefaultTransform from './Transform/DefaultTransform.js';

function App() {
    const [source, setSource] = useState(DefaultSource);
    const [transform, setTransform] = useState(DefaultTransform);
    
    return (
        <div className="App">
            <header className="App-header">
                <MainMenu
                    setTransform={setTransform}
                />
            </header>
            <Tabs
                source={source}
                setSource={setSource}
                transform={transform}
                setTransform={setTransform}/>
        </div>
    );
}

export default App;
