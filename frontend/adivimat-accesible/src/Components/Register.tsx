import { type FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  type BootstrapStatusResponse,
  type ErroresValidacion,
  type RegisterRequest,
  type RegisterResponse,
  esValido,
  validarRegistro,
} from '@adivimat/shared';

import { api, mensajeDeError } from '../lib/api';
import { useAuth } from '../context/AuthProvider';

/**
 * Alta de administradores.
 *
 * La pantalla tiene dos modos, segun responda /api/auth/bootstrap:
 *
 * - Alta inicial: todavia no hay ningun administrador. Es publica, pide el
 *   ADMIN_CODE y, al crear la cuenta, entra directamente con el token que
 *   devuelve el servidor.
 * - Alta normal: ya hay administradores. Exige sesion de administrador, no
 *   pide codigo, y al terminar la sesion de quien la crea sigue intacta.
 *
 * Antes era siempre publica y bastaba con conocer un ADMIN_CODE compartido que
 * no caducaba nunca.
 */
function RegisterForm() {
  const { state, establecerSesion } = useAuth();
  const navigate = useNavigate();

  const [bootstrap, setBootstrap] = useState<boolean | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [username, setUsername] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [errores, setErrores] = useState<ErroresValidacion<RegisterRequest>>({});
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  useEffect(() => {
    const comprobar = async () => {
      try {
        const { data } = await api.get<BootstrapStatusResponse>('/api/auth/bootstrap');
        setBootstrap(data.bootstrap);
      } catch (err) {
        setError(mensajeDeError(err, 'No se pudo comprobar el estado del sistema'));
      }
    };

    void comprobar();
  }, []);

  useEffect(() => {
    setErrores({});
    setError('');
  }, [email, password, password2, username, adminCode]);

  if (bootstrap === null) {
    return <p>Comprobando...</p>;
  }

  const esAdmin = state.isAuthenticated && state.user?.isAdmin === true;

  /* Fuera del alta inicial, esta pantalla es una operacion de administracion. */
  if (!bootstrap && !esAdmin) {
    return (
      <div className="register-form-container">
        <h2>Crear cuenta de administrador</h2>
        <p>
          Solo un administrador puede dar de alta nuevas cuentas. Inicia sesion para continuar.
        </p>
        <Link to="/login" className="link">
          Iniciar sesion
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setExito('');

    const resultado = validarRegistro({ username, email, password, adminCode }, bootstrap);
    if (!esValido(resultado)) {
      setErrores(resultado);
      return;
    }

    if (password !== password2) {
      setErrores({ password: 'Las contrasenas no coinciden' });
      return;
    }

    try {
      const cuerpo: RegisterRequest = {
        username,
        email,
        password,
        /* El codigo solo viaja en el alta inicial; despues el servidor lo
           ignora y se autoriza con el token del administrador. */
        ...(bootstrap ? { adminCode } : {}),
      };
      const { data } = await api.post<RegisterResponse>('/api/auth/register', cuerpo);

      if (data.token) {
        /* Alta inicial: se entra directamente con la cuenta recien creada. */
        establecerSesion(data.user, data.token);
        navigate('/gestion');
        return;
      }

      /* Alta hecha por un administrador: su sesion no se toca. */
      setExito(`Administrador "${data.user.username}" creado correctamente.`);
      setUsername('');
      setEmail('');
      setPassword('');
      setPassword2('');
    } catch (err) {
      setError(mensajeDeError(err, 'Error al registrar el usuario'));
    }
  };

  return (
    <div className="register-form-container">
      <form className="register-form" onSubmit={handleSubmit} noValidate>
        <h2>{bootstrap ? 'Crear el primer administrador' : 'Crear cuenta de administrador'}</h2>

        {bootstrap && (
          <p>
            Todavia no hay ningun administrador. Esta alta es la unica que acepta el codigo de
            administrador; a partir de ahora las cuentas las crea un administrador con su sesion.
          </p>
        )}

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

        {bootstrap && (
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
        )}

        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}

        {exito && <div role="status">{exito}</div>}

        <div className="form-control">
          <button type="submit">{bootstrap ? 'Crear administrador' : 'Crear cuenta'}</button>
        </div>

        {bootstrap && (
          <div className="link-container">
            <Link to="/login" className="link">
              Ya tienes cuenta? Inicia sesion
            </Link>
          </div>
        )}
      </form>
    </div>
  );
}

export default RegisterForm;
