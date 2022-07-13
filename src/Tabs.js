import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import {Alert} from '@mui/material';
import PropTypes from 'prop-types';
import {useState} from 'react';

import DefaultSource from './Source/DefaultSource.js';
import DefaultTransform from './Transform/DefaultTransform.js';
import {Transform} from './Transform/Transform.js';
import {Result} from './Result.js';
import {Source} from './Source/Source.js';

const {stringify} = JSON;

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
            id={`full-width-tabpanel-${index}`}
            aria-labelledby={`full-width-tab-${index}`}
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
        'id': `full-width-tab-${index}`,
        'aria-controls': `full-width-tabpanel-${index}`,
    };
}

export default function FullWidthTabs() {
    const [value, setValue] = useState(0);
    const [transform, setTransform] = useState(DefaultTransform);
    const [source, setSource] = useState(DefaultSource);
    const [code, setCode] = useState(DefaultSource);
    
    const [error, setError] = useState(null);
    const [info, setInfo] = useState(null);
    
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };
    
    return (
        <Box sx={{bgcolor: 'background.paper'}}>
            <AppBar position="static">
                <Tabs
                    value={value}
                    onChange={handleChange}
                    indicatorColor="secondary"
                    textColor="inherit"
                    variant="fullWidth"
                    aria-label="full width tabs example"
                >
                    <Tab label="Transform" {...a11yProps(0)} />
                    <Tab label="Source" {...a11yProps(1)} />
                    <Tab label="Result" {...a11yProps(2)} />
                </Tabs>
            </AppBar>
            <TabPanel value={value} index={0}>
                <Transform
                    transform={transform}
                    setTransform={setTransform}
                    source={source}
                    setCode={setCode}
                    setError={setError}
                    setInfo={setInfo}
                />
            </TabPanel>
            <TabPanel value={value} index={1}>
                <Source
                    source={source}
                    setSource={setSource}
                    setError={setError}
                />
            </TabPanel>
            <TabPanel value={value} index={2}>
                <Result
                    code={code}
                />
            </TabPanel>
            {error && <Alert severity="error">{String(error)}</Alert> }
            {info && <Alert severity="info">{String(info)}</Alert> }
        </Box>
    );
}

