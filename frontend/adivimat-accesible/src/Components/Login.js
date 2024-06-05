import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { validation } from '../validation/validation';

function LoginForm() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, state: { isAuthenticated, loginError } } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/gestion');
    }
    if (loginError) {
      setError(loginError);
    }
  }, [isAuthenticated, loginError, navigate]);

  useEffect(() => {
    setError('');
  }, [usernameOrEmail, password]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!usernameOrEmail || !password) {
      setError('Por favor, ingrese el nombre de usuario o correo electrónico y la contraseña');
      return;
    }

    login(usernameOrEmail, password);
  };

  return (
    <div className="login-form-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Iniciar Sesión</h2>
        <div className="form-control">
          <label htmlFor="usernameOrEmail">Nombre de usuario o correo electrónico</label>
          <input
            type="text"
            name="usernameOrEmail"
            id="usernameOrEmail"
            value={usernameOrEmail}
            onChange={(e) => { setUsernameOrEmail(e.target.value) }}
          />
        </div>
        <div className="form-control">
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            name="password"
            id="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value) }}
          />
        </div>
        <div className='form-control'>
          {error && <div className='form-error'>Usuario o contraseña incorrecta</div>}
          <button type="submit">Iniciar Sesión</button>
        </div>
        <div className='link-container'>
          <Link to="/register" className='link'>¿No tienes cuenta? Registráte</Link>
        </div>
      </form>
    </div>
  );
}

export default LoginForm;
