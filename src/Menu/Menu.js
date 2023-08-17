import * as React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import ForkRightOutlinedIcon from '@mui/icons-material/ForkRightOutlined';
import IconButton from '@mui/material/IconButton';

export default function MainMenu() {
    const [anchorEl, setAnchorEl] = React.useState();
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    
    const handleClose = () => {
        setAnchorEl(null);
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
                <MenuItem onClick={handleClose}><InsertDriveFileOutlinedIcon/>New</MenuItem>
                <MenuItem onClick={handleClose}><SaveOutlinedIcon/>Save</MenuItem>
                <MenuItem onClick={handleClose}><ForkRightOutlinedIcon/>Fork</MenuItem>
            </Menu>
        </div>
    );
}

