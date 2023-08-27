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
import {FinalTransform} from './FinalTransform.js';
import {Result} from './Result.js';
import {AST} from './AST.js';
import {Source} from './Source/Source.js';

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
            {value === index && <Box
                sx={{
                    p: 3,
                }}
            >
                <Typography component="span">{children}</Typography>
            </Box>}
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

export default function FullWidthTabs(props) {
    const {
        source,
        setSource,
        transform,
        setTransform,
        error,
        setError,
        info,
        setInfo,
        success,
        gistReady,
    } = props;
    
    const [value, setValue] = useState(0);
    const [finalTransform, setFinalTransform] = useState(DefaultTransform);
    const [code, setCode] = useState(DefaultSource);
    const [resultReady, setResultReady] = useState(false);
    
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };
    
    return (
        <Box
            sx={{
                bgcolor: 'background.paper',
            }}
        >
            <AppBar position="static">
                <Tabs
                    value={value}
                    onChange={handleChange}
                    indicatorColor="secondary"
                    textColor="inherit"
                    variant="fullWidth"
                    aria-label="full width tabs example"
                >
                    <Tab label="Transform" {...a11yProps(0)}/>
                    <Tab label="Source" {...a11yProps(1)}/>
                    <Tab label="AST" {...a11yProps(2)}/>
                    <Tab label="Cooked" {...a11yProps(3)}/>
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
                    setFinalTransform={setFinalTransform}
                    gistReady={gistReady}
                    setResultReady={setResultReady}
                />
            </TabPanel>
            <TabPanel value={value} index={1}>
                <Source
                    setResultReady={setResultReady}
                    source={source}
                    transform={transform}
                    setSource={setSource}
                    setError={setError}
                    setTransform={setTransform}
                    setCode={setCode}
                    setInfo={setInfo}
                    setFinalTransform={setFinalTransform}
                />
            </TabPanel>
            <TabPanel value={value} index={1}>
                <Result
                    resultReady={resultReady}
                    code={code}
                />
            </TabPanel>
            <TabPanel value={value} index={2}>
                <AST
                    setError={setError}
                    source={source}
                />
            </TabPanel>
            <TabPanel value={value} index={3}>
                <FinalTransform
                    finalTransform={finalTransform}
                />
            </TabPanel>
            {error && <Alert severity="error">{String(error)}</Alert>}
            {info && <Alert severity="info">{String(info)}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}
        </Box>
    );
}

