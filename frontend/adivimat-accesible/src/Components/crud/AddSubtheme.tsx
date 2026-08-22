import { type FormEvent, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import type { CreateSubtemaRequest } from '@adivimat/shared';

import { api, mensajeDeError } from '../../lib/api';

/**
 * Alta de subtema dentro de un tema.
 *
 * La version anterior estaba rota de raiz:
 *
 *   const [temas, tema, setTemas] = useState([]);
 *
 * `useState` devuelve dos elementos, asi que `tema` era el setter y `setTemas`
 * quedaba en undefined: llamarlo lanzaba un TypeError nada mas cargar los
 * temas. En el JSX, ademas, se iteraba sobre `temas` pero se leia `tema._id`,
 * es decir, propiedades de la funcion setter.
 *
 * Se elimina el selector de tema: la ruta es /temas/:temaId/subtemas/nuevo, o
 * sea que el tema ya viene dado y elegirlo otra vez sobraba.
 */
function AddSubtheme() {
  const { temaId } = useParams<{ temaId: string }>();
  const navigate = useNavigate();
  const [subtemaName, setSubtemaName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!temaId) {
      setError('Falta el identificador del tema');
      return;
    }
    setError('');

    try {
      const cuerpo: CreateSubtemaRequest = { name: subtemaName };
      await api.post(`/api/temas/${temaId}/subtemas`, cuerpo);
      navigate('/gestion');
    } catch (err) {
      setError(mensajeDeError(err, 'Error al anadir el subtema'));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Nuevo subtema</h2>
      {error && <p role="alert">{error}</p>}
      <label>
        Nombre del Subtema:
        <input
          type="text"
          value={subtemaName}
          onChange={(e) => setSubtemaName(e.target.value)}
          required
        />
      </label>
      <button type="submit">Anadir Subtema</button>
      <button type="button" onClick={() => navigate('/gestion')}>
        Cancelar
      </button>
    </form>
  );
}

export default AddSubtheme;
