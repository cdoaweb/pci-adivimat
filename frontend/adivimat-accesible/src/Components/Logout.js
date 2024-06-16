import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { validation } from '../validation/validation';

function Logout() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { logout, login , state: { isAuthenticated, loginError } } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    /*if (isAuthenticated) {
      navigate('/');
    } */   
  }, [isAuthenticated, loginError, navigate]);

  useEffect(() => {
    setError('');
  }, [usernameOrEmail, password]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    localStorage.clear();
    logout();
    navigate('/');
  };

  return (
    <div className="login-form-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Terminar Sesión</h2>
        <div>¿Está realmente seguro?</div>
        <div className='form-control'>          
          <button type="submit">Logout</button>
        </div>
        
      </form>
    </div>
  );
}

export default Logout;
