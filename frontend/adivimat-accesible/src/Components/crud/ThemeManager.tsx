import { useCallback, useEffect, useState } from 'react';

import type { Subtema, Tema } from '@adivimat/shared';

import { api, mensajeDeError } from '../../lib/api';
import RiddleTable from './RiddleTable';
import SubthemeList from './SubthemeList';
import ThemeList from './ThemeList';

/**
 * Pantalla de gestion: tema -> subtema -> adivinanzas.
 *
 * La variable que guarda el tema se llamaba `selectedTemaId` pero contenia el
 * objeto entero, y luego se leia `selectedTemaId._id` por todas partes. Ahora
 * el nombre dice lo que hay dentro y el tipo lo obliga.
 */
function ThemeManager() {
  const [temas, setTemas] = useState<Tema[]>([]);
  const [selectedTema, setSelectedTema] = useState<Tema | null>(null);
  const [selectedSubtema, setSelectedSubtema] = useState<Subtema | null>(null);
  const [error, setError] = useState('');

  const fetchTemas = useCallback(async () => {
    try {
      const { data } = await api.get<Tema[]>('/api/temas');
      setTemas(data);
    } catch (err) {
      setError(mensajeDeError(err, 'Error al cargar los temas'));
    }
  }, []);

  useEffect(() => {
    void fetchTemas();
  }, [fetchTemas]);

  const handleSelectTema = (tema: Tema) => {
    setSelectedTema(tema);
    setSelectedSubtema(null);
  };

  return (
    <div>
      {error && <p role="alert">{error}</p>}

      <ThemeList themes={temas} onSelectTheme={handleSelectTema} />

      {selectedTema && (
        <SubthemeList themeId={selectedTema.id} onSelectSubtheme={setSelectedSubtema} />
      )}

      {selectedTema && selectedSubtema && (
        /* Se pasa el id del subtema, no su nombre: el endpoint de adivinanzas
           identifica el subtema por id. */
        <RiddleTable temaId={selectedTema.id} subtemaId={selectedSubtema.id} />
      )}
    </div>
  );
}

export default ThemeManager;
