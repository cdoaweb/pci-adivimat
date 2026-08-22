import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { Subtema } from '@adivimat/shared';

import { api, mensajeDeError } from '../../lib/api';

interface SubthemeListProps {
  themeId: string;
  onSelectSubtheme: (subtema: Subtema) => void;
}

function SubthemeList({ themeId, onSelectSubtheme }: SubthemeListProps) {
  const [subthemes, setSubthemes] = useState<Subtema[]>([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchSubthemes = useCallback(async () => {
    try {
      const { data } = await api.get<Subtema[]>(`/api/temas/${themeId}/subtemas`);
      setSubthemes(data);
    } catch (err) {
      setError(mensajeDeError(err, 'Error al cargar los subtemas'));
    }
  }, [themeId]);

  useEffect(() => {
    void fetchSubthemes();
  }, [fetchSubthemes]);

  const handleDeleteClick = async (subtemaId: string) => {
    if (!window.confirm('Estas seguro de que deseas eliminar este subtema?')) return;

    try {
      await api.delete(`/api/temas/${themeId}/subtemas/${subtemaId}`);
      setSubthemes((actuales) => actuales.filter((s) => s.id !== subtemaId));
    } catch (err) {
      setError(mensajeDeError(err, 'Error al eliminar el subtema'));
    }
  };

  return (
    <section>
      <h2>Subtemas</h2>
      {error && <p role="alert">{error}</p>}
      <button onClick={() => navigate(`/temas/${themeId}/subtemas/nuevo`)}>
        Anadir un nuevo Subtema
      </button>
      <ul>
        {subthemes.map((subtheme) => (
          <li key={subtheme.id}>
            <button onClick={() => onSelectSubtheme(subtheme)}>{subtheme.name}</button>
            <button onClick={() => navigate(`/temas/${themeId}/subtemas/${subtheme.id}/editar`)}>
              Editar
            </button>
            <button onClick={() => void handleDeleteClick(subtheme.id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default SubthemeList;
