import './App.css';
import Tabs from './Tabs.js';
import MainMenu from './Menu/Menu.js';

function App() {
    return (
        <div className="App">
            <header className="App-header">
                <MainMenu/>
            </header>
            <Tabs/>
        </div>
    );
}

export default App;
