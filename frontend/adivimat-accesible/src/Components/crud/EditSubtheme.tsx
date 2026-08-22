import { type FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import type { Subtema, UpdateSubtemaRequest } from '@adivimat/shared';

import { api, mensajeDeError } from '../../lib/api';

function EditSubtheme() {
  const { temaId, subtemaId } = useParams<{ temaId: string; subtemaId: string }>();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!temaId || !subtemaId) {
      setError('Faltan identificadores en la ruta');
      setLoading(false);
      return;
    }

    const fetchSubtema = async () => {
      try {
        const { data } = await api.get<Subtema[]>(`/api/temas/${temaId}/subtemas`);
        /* `s.id`, no `s._id`. */
        const encontrado = data.find((s) => s.id === subtemaId);
        if (!encontrado) {
          setError('Subtema no encontrado');
        } else {
          setName(encontrado.name);
        }
      } catch (err) {
        setError(mensajeDeError(err, 'Error al obtener los subtemas'));
      } finally {
        setLoading(false);
      }
    };

    void fetchSubtema();
  }, [temaId, subtemaId]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!temaId || !subtemaId) return;
    setError('');

    try {
      const cuerpo: UpdateSubtemaRequest = { name };
      await api.put(`/api/temas/${temaId}/subtemas/${subtemaId}`, cuerpo);
      navigate('/gestion');
    } catch (err) {
      setError(mensajeDeError(err, 'Error al actualizar el subtema'));
    }
  };

  if (loading) {
    return <p>Cargando...</p>;
  }

  return (
    <div>
      <h2>Editar Subtema</h2>
      {error && <p role="alert">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label htmlFor="nombre-subtema">Nombre:</label>
        {/* El input se llamaba "nombre" mientras el estado guardaba `name`, de
            modo que el handleChange generico escribia en un campo `nombre` que
            no existia y editar no guardaba nada. Ahora es estado directo. */}
        <input
          id="nombre-subtema"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <button type="submit">Guardar Cambios</button>
        <button type="button" onClick={() => navigate('/gestion')}>
          Cancelar
        </button>
      </form>
    </div>
  );
}

export default EditSubtheme;
