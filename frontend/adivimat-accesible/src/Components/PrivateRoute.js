import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';


const PrivateRoute = ({ children }) => {
  const { state } = useAuth();
  const { isAuthenticated, user } = state;
  return isAuthenticated && user.isAdmin ? children : <Navigate to='/login' />;
};

export default PrivateRoute;