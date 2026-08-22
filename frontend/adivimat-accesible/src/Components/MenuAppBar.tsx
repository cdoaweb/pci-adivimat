import { type MouseEvent, useState } from 'react';
import { AppBar, Button, Menu, MenuItem, Toolbar, Typography } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthProvider';

function MenuAppBar() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const navigate = useNavigate();

  /* `logout` cuelga del contexto, no de `state`. La version anterior lo
     desestructuraba de `state`, donde nunca estuvo, asi que era undefined y
     pulsar "Cerrar sesion" lanzaba un TypeError. */
  const { state, logout } = useAuth();
  const { isAuthenticated, user } = state;

  const handleMenuClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    /* `logout()` ya limpia token y usuario de localStorage; antes se borraban
       ademas aqui a mano, duplicando la logica. */
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
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={handleMenuClose} component={Link} to="/">
            Inicio
          </MenuItem>
          <MenuItem onClick={handleMenuClose} component={Link} to="/about">
            Acerca de
          </MenuItem>
          {isAuthenticated
            ? [
                /* `user?.isAdmin`: con isAuthenticated en true el usuario deberia
                   existir, pero el tipo admite null y el compilador lo exige. */
                user?.isAdmin ? (
                  <MenuItem key="gestion" onClick={handleMenuClose} component={Link} to="/gestion">
                    Gestion
                  </MenuItem>
                ) : null,
                <MenuItem key="logout" onClick={handleLogout}>
                  Cerrar Sesion
                </MenuItem>,
              ]
            : [
                <MenuItem key="login" onClick={handleMenuClose} component={Link} to="/login">
                  Iniciar sesion
                </MenuItem>,
              ]}
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

export default MenuAppBar;
