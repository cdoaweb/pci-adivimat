import { type FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import type { Tema, UpdateTemaRequest } from '@adivimat/shared';

import { api, mensajeDeError } from '../../lib/api';

function EditTheme() {
  /* Este si se monta desde una ruta (/temas/:themeId/editar), asi que
     useParams es correcto aqui. `themeId` es string | undefined y el
     compilador obliga a contemplar el caso. */
  const { themeId } = useParams<{ themeId: string }>();
  const navigate = useNavigate();
  const [themeName, setThemeName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!themeId) {
      setError('Falta el identificador del tema');
      setLoading(false);
      return;
    }

    const fetchTheme = async () => {
      try {
        const { data } = await api.get<Tema>(`/api/temas/${themeId}`);
        setThemeName(data.tema);
      } catch (err) {
        setError(mensajeDeError(err, 'Error al cargar el tema'));
      } finally {
        setLoading(false);
      }
    };

    void fetchTheme();
  }, [themeId]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!themeId) return;
    setError('');

    try {
      const cuerpo: UpdateTemaRequest = { tema: themeName };
      await api.put(`/api/temas/${themeId}`, cuerpo);
      navigate('/gestion');
    } catch (err) {
      setError(mensajeDeError(err, 'Error al actualizar el tema'));
    }
  };

  if (loading) {
    return <p>Cargando...</p>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Editar tema</h2>
      {error && <p role="alert">{error}</p>}
      <label>
        Nombre del Tema:
        <input
          type="text"
          value={themeName}
          onChange={(e) => setThemeName(e.target.value)}
          required
        />
      </label>
      <button type="submit">Actualizar Tema</button>
      <button type="button" onClick={() => navigate('/gestion')}>
        Cancelar
      </button>
    </form>
  );
}

export default EditTheme;
