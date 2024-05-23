import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Menu, MenuItem } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

function MenuAppBar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
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
          {user ? (
            <>
              {user.userType === 'admin' && (
                <MenuItem onClick={handleMenuClose} component={Link} to="/gestion">Gestión</MenuItem>
              )}
              <MenuItem onClick={handleLogout}>Cerrar Sesión</MenuItem>
            </>
          ) : (
            <MenuItem onClick={handleMenuClose} component={Link} to="/login">Iniciar sesión</MenuItem>
          )}
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

export default MenuAppBar;