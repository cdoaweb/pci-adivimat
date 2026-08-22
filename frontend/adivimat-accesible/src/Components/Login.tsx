import { type FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { type ErroresValidacion, type LoginRequest, esValido, validarLogin } from '@adivimat/shared';

import { useAuth } from '../context/AuthProvider';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errores, setErrores] = useState<ErroresValidacion<LoginRequest>>({});
  const {
    login,
    state: { isAuthenticated, loginError },
  } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/gestion');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    setErrores({});
  }, [email, password]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    /* La validacion vive en @adivimat/shared, la misma que aplica el backend.
       Antes se importaba `{ validation }` de validation.js, que solo exporta
       `validateEmail`: era undefined y el import no servia para nada. */
    const resultado = validarLogin({ email, password });
    if (!esValido(resultado)) {
      setErrores(resultado);
      return;
    }

    await login(email, password);
  };

  return (
    <div className="login-form-container">
      <form className="login-form" onSubmit={handleSubmit} noValidate>
        <h2>Iniciar Sesion</h2>
        <div className="form-control">
          <label htmlFor="email">Correo electronico</label>
          <input
            type="email"
            name="email"
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
            name="password"
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
          {/* Se muestra el mensaje real del servidor en lugar de un texto fijo
              que decia "Usuario o contrasena incorrecta" pasase lo que pasase. */}
          {loginError && (
            <div className="form-error" role="alert">
              {loginError}
            </div>
          )}
          <button type="submit">Iniciar Sesion</button>
        </div>
        <div className="link-container">
          <Link to="/register" className="link">
            No tienes cuenta? Registrate
          </Link>
        </div>
      </form>
    </div>
  );
}

export default LoginForm;
