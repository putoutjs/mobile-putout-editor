import {Editor} from './Editor.js';
import {Result} from './Result.js';

import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import {useState} from 'react';

import DefaultSource from './DefaultSource.js';

function TabPanel(props) {
    const {
        children,
        value,
        index,
        ...other
    } = props;
    
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}
            {...other}
        >
            {value === index &&
                <Box sx={{p: 3}}>
                    <Typography component="span">{children}</Typography>
                </Box>
            }
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        'id': `vertical-tab-${index}`,
        'aria-controls': `vertical-tabpanel-${index}`,
    };
}

export default function VerticalTabs() {
    const [value, setValue] = useState(0);
    const [source, setSource] = useState(DefaultSource);
    const [code, setCode] = useState(DefaultSource);
    
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };
    
    return (
        <Box
            sx={{flexGrow: 1, bgcolor: 'background.paper', display: 'flex', height: 224}}
        >
            <Tabs
                orientation="vertical"
                variant="fullWidth"
                value={value}
                onChange={handleChange}
                aria-label="Vertical tabs example"
                sx={{borderRight: 1, borderColor: 'divider'}}
            >
                <Tab label="Transform" {...a11yProps(0)} />
                <Tab label="Result" {...a11yProps(1)} />
                <Tab label="AST" {...a11yProps(2)}/>
            </Tabs>
            <TabPanel value={value} index={0} className="App-tab">
                <Editor
                    source={source}
                    setSource={setSource}
                    setCode={setCode}
                />
            </TabPanel>
            <TabPanel value={value} index={1} className="App-tab">
                <Result
                    code={code}
                />
            </TabPanel>
            <TabPanel value={value} index={2} className="App-tab">
                <Editor />
            </TabPanel>
        </Box>
    );
}

