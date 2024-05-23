import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('token');
  const isAdmin = localStorage.getItem('userType') === 'admin';
  return isAuthenticated && isAdmin ? children : <Navigate to='/login' />;
};

export default PrivateRoute;