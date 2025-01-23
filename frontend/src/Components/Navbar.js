import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';
import { Icon, Stack } from '@mui/material';
import ColorPalette from './ColorPalette';

import HomeIcon from '@mui/icons-material/Home';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

const drawerWidth = 240;
const navItems = ['Home', 'Journal', 'Account'];

function Navbar(props) {
    const { window } = props;
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen((prevState) => !prevState);
    };

    const drawer = (
        <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ my: 2 }} color={"secondary"}>
                Research Paper
            </Typography>
            <Divider />
            <List>
                {navItems.map((item) => (
                    <ListItem key={item} disablePadding>
                        <ListItemButton sx={{ textAlign: 'center' }} href={item == "Home" ? "/" : "/" + item.toLowerCase()}>
                            <ListItemText primary={item} sx={{ color: 'secondary.main' }} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    const container = window !== undefined ? () => window().document.body : undefined;
    return (
        <ColorPalette>
            <Box sx={{ display: 'flex', marginTop: "-48px" }}>
                <CssBaseline />
                <AppBar component="nav">
                    <Toolbar sx={{ justifyContent: "space-between" }}>
                        <IconButton
                            color="inherit"
                            aria-label="menu"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2, display: { sm: 'none' } }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <IconButton color='inherit' sx={{ borderRadius: 0, display: { xs: 'none', sm: 'block' } }}>
                            <Icon style={{ height: '5vh', width: '100%', display: 'flex', justifyContent: 'flex-start', alignItems: 'center', flexGrow: 1 }}>
                                <img className='icon' src="/static/images/blockchain_rp.svg" alt="logo" style={{ maxHeight: "5vh" }} />
                            </Icon>
                        </IconButton>
                        <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: { sm: 2, md: 3, lg: 4, xl: 5 } }}>
                            {navItems.map((item) => (
                                <Button key={item} sx={{ color: '#fff', justifyContent: "space-evenly", width: "7rem" }} href={item == "Home" ? "/" : "/" + item.toLowerCase()}>
                                    {item == "Home" ? <HomeIcon sx={{ width: "24px" }} /> : item == "Journal" ? <LibraryBooksIcon sx={{ width: "24px" }} /> : item == "Account" ? <ReceiptLongIcon sx={{ width: "24px" }} /> : <></>}
                                    {item}
                                </Button>
                            ))}
                        </Box>
                    </Toolbar>
                </AppBar>
                <nav>
                    <Drawer
                        container={container}
                        variant="temporary"
                        open={mobileOpen}
                        onClose={handleDrawerToggle}
                        ModalProps={{
                            keepMounted: true,
                        }}
                        sx={{
                            display: { xs: 'block', sm: 'none' },
                            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, backgroundColor: "primary.main" },
                        }}
                    >
                        {drawer}
                    </Drawer>
                </nav>
                <Box component="main" sx={{ p: 3 }}>
                    <Toolbar />
                </Box>
            </Box>
        </ColorPalette>
    );
}

export default Navbar;
