import { type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthProvider';

/**
 * Pantalla de confirmacion de cierre de sesion.
 *
 * La version anterior arrastraba estado de un formulario de login copiado
 * (usernameOrEmail, password, error) que no se usaba, y hacia
 * `localStorage.clear()`, borrando cualquier otra cosa guardada por el
 * dominio. Ahora solo llama a `logout()`, que borra sus dos claves.
 */
function Logout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    logout();
    navigate('/');
  };

  return (
    <div className="login-form-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Terminar Sesion</h2>
        <p>Esta realmente seguro?</p>
        <div className="form-control">
          <button type="submit">Cerrar Sesion</button>
        </div>
      </form>
    </div>
  );
}

export default Logout;
