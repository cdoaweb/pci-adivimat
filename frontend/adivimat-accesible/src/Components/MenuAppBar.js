import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Menu, MenuItem } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import {LogoutButton} from './LogoutButton';

function MenuAppBar() {
  const [anchorEl, setAnchorEl] = useState(null);
  //const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const { state } = useAuth();
  const { isAuthenticated, user, logout} = state;

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
          {isAuthenticated ? (  
            <>
            {user.isAdmin && (
              <MenuItem onClick={handleMenuClose} component={Link} to="/gestion">Gestión</MenuItem>
            )}
            <MenuItem component={Link} to="/logout" onClick={handleLogout}>Cerrar Sesión</MenuItem>
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
