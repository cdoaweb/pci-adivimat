import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Menu, MenuItem } from '@mui/material';
import { Link } from 'react-router-dom';

function MenuAppBar({ userType }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Adivimat Accesible
        </Typography>
        <Button color="inherit" onClick={handleMenuClick}>
          Menu
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleMenuClose} component={Link} to="/">Inicio</MenuItem>
          <MenuItem onClick={handleMenuClose} component={Link} to="/about">Acerca de</MenuItem>
          {userType === 'admin' && (
            <MenuItem onClick={handleMenuClose} component={Link} to="/gestion">Gestión</MenuItem>
          )}
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

export default MenuAppBar;