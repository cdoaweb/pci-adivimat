import { type FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  type ErroresValidacion,
  type RegisterRequest,
  esValido,
  validarRegistro,
} from '@adivimat/shared';

import { api, mensajeDeError } from '../lib/api';

function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [username, setUsername] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [errores, setErrores] = useState<ErroresValidacion<RegisterRequest>>({});
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setErrores({});
    setError('');
  }, [email, password, password2, username, adminCode]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    /* Mismas reglas que aplica el backend, importadas de @adivimat/shared, en
       lugar de la lista de comprobaciones a mano que habia antes. */
    const resultado = validarRegistro({ username, email, password, adminCode });
    if (!esValido(resultado)) {
      setErrores(resultado);
      return;
    }

    /* La confirmacion de contrasena es solo de este formulario, asi que no
       forma parte del contrato compartido. */
    if (password !== password2) {
      setErrores({ password: 'Las contrasenas no coinciden' });
      return;
    }

    try {
      await api.post('/api/auth/register', { email, password, username, adminCode });
      navigate('/login');
    } catch (err) {
      setError(mensajeDeError(err, 'Error al registrar el usuario'));
    }
  };

  return (
    <div className="register-form-container">
      <form className="register-form" onSubmit={handleSubmit} noValidate>
        <h2>Crear cuenta de administrador</h2>

        <div className="form-control">
          <label htmlFor="username">Nombre de usuario</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            aria-invalid={Boolean(errores.username)}
            aria-describedby={errores.username ? 'error-username' : undefined}
          />
          {errores.username && (
            <div className="form-error" id="error-username">
              {errores.username}
            </div>
          )}
        </div>

        <div className="form-control">
          <label htmlFor="email">Correo electronico</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(errores.email)}
            aria-describedby={errores.email ? 'error-email' : undefined}
          />
          {errores.email && (
            <div className="form-error" id="error-email">
              {errores.email}
            </div>
          )}
        </div>

        <div className="form-control">
          <label htmlFor="password">Contrasena</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={Boolean(errores.password)}
            aria-describedby={errores.password ? 'error-password' : undefined}
          />
          {errores.password && (
            <div className="form-error" id="error-password">
              {errores.password}
            </div>
          )}
        </div>

        <div className="form-control">
          <label htmlFor="password2">Repetir Contrasena</label>
          <input
            type="password"
            id="password2"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
          />
        </div>

        <div className="form-control">
          <label htmlFor="adminCode">Codigo de administrador</label>
          <input
            type="text"
            id="adminCode"
            value={adminCode}
            onChange={(e) => setAdminCode(e.target.value)}
            aria-invalid={Boolean(errores.adminCode)}
            aria-describedby={errores.adminCode ? 'error-adminCode' : undefined}
          />
          {errores.adminCode && (
            <div className="form-error" id="error-adminCode">
              {errores.adminCode}
            </div>
          )}
        </div>

        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}

        <div className="form-control">
          <button type="submit">Registrarse</button>
        </div>
        <div className="link-container">
          <Link to="/login" className="link">
            Ya tienes cuenta? Inicia sesion
          </Link>
        </div>
      </form>
    </div>
  );
}

export default RegisterForm;
