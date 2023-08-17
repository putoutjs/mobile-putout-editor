import * as React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import IconButton from '@mui/material/IconButton';
import DefaultTransform from '../Transform/DefaultTransform.js';
import {createSave} from './Save.js';

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
    
    const save = createSave({
        close: handleClose,
        source,
        transform,
        setSuccess,
    });
    
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
                <MenuItem className="MenuItem" onClick={handleNew}><InsertDriveFileOutlinedIcon/>New</MenuItem>
                <MenuItem className="MenuItem" onClick={save}><SaveOutlinedIcon/>Save</MenuItem>
            </Menu>
        </div>
    );
}

