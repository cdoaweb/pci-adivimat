import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { validateEmail } from '../validation/validation';
import axios from './utils/axiosConfig';

function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [username, setUsername] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password || !username || !adminCode) {
      setError('Por favor, complete todos los campos');
      return;
    }

    if (password !== password2) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (!validateEmail(email)) {
      setError('El email no es válido');
      return;
    }

    try {
      /* Usa la instancia de axios en lugar de un fetch con la URL escrita a
         mano, para que el destino salga de REACT_APP_API_URL como el resto. */
      await axios.post('/api/auth/register', { email, password, username, adminCode });
      navigate('/login');
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al registrar el usuario');
    }
  };

  useEffect(() => {
    setError('');
  }, [email, password, password2, username, adminCode]);

  return (
    <div className="register-form-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Crear cuenta de administrador</h2>
        <div className="form-control">
          <label htmlFor="username">Nombre de usuario</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="form-control">
          <label htmlFor="email">Correo electrónico</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-control">
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="form-control">
          <label htmlFor="password2">Repetir Contraseña</label>
          <input
            type="password"
            id="password2"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
          />
        </div>
        <div className="form-control">
          <label htmlFor="adminCode">Código de administrador</label>
          <input
            type="text"
            id="adminCode"
            value={adminCode}
            onChange={(e) => setAdminCode(e.target.value)}
          />
        </div>
        {error && <div className="form-error">{error}</div>}
        <div className="form-control">
          <button type="submit">Registrarse</button>
        </div>
        <div className="link-container">
          <Link to="/login" className="link">¿Ya tienes cuenta? Inicia sesión</Link>
        </div>
      </form>
    </div>
  );
}

export default RegisterForm;
