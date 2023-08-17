import * as React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import ForkRightOutlinedIcon from '@mui/icons-material/ForkRightOutlined';
import IconButton from '@mui/material/IconButton';
import DefaultTransform from '../Transform/DefaultTransform.js';
import {create} from '../Gist/gist.js';
import DefaultSettings from '../Gist/DefaultSettings.js';

export default function MainMenu({source, transform, setTransform, setSuccess}) {
    const [anchorEl, setAnchorEl] = React.useState();
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    
    const handleClose = () => {
        setAnchorEl(null);
    };
    
    const handleNew = () => {
        setTransform(DefaultTransform);
        handleClose();
    };
    
    const handleSave = async () => {
        handleClose();
        
        const result = await create({
            ...DefaultSettings,
            code: source,
            transform,
            filename: 'source.js',
        });
        
        const {id, history} = result._gist;
        const link = `https://putout.cloudcmd.io/#/gist/${id}/${history[0].version}`;
        
        setSuccess(<a href={link}>{link}</a>);
    };
    
    return (
        <div>
            <IconButton
                aria-label="more"
                id="long-button"
                aria-controls={open ? 'long-menu' : undefined}
                aria-expanded={open ? 'true' : undefined}
                aria-haspopup="true"
                onClick={handleClick}
            ><span className="logo">🐊</span></IconButton>
            <span className="menu"><code>Putout Editor</code></span>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
            >
                <MenuItem onClick={handleNew}><InsertDriveFileOutlinedIcon/>New</MenuItem>
                <MenuItem onClick={handleSave}><SaveOutlinedIcon/>Save</MenuItem>
                <MenuItem onClick={handleClose}><ForkRightOutlinedIcon/>Fork</MenuItem>
            </Menu>
        </div>
    );
}

