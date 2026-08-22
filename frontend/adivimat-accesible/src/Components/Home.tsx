import { type ChangeEvent, useEffect, useState } from 'react';

import type { Subtema, Tema } from '@adivimat/shared';

import { api, mensajeDeError } from '../lib/api';
import RiddleSelector from './selector/RiddleSelector';

function Home() {
  const [temas, setTemas] = useState<Tema[]>([]);
  const [selectedTemaId, setSelectedTemaId] = useState<string>('');
  const [subtemas, setSubtemas] = useState<Subtema[]>([]);
  /* Se guarda el subtema entero, no su nombre: el backend identifica los
     subtemas por id, y pasar el nombre hacia que las peticiones de adivinanzas
     apuntasen a /subtemas/<nombre>/adivinanzas y no encontrasen nada. */
  const [selectedSubtema, setSelectedSubtema] = useState<Subtema | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTemas = async () => {
      try {
        const { data } = await api.get<Tema[]>('/api/temas');
        setTemas(data);
      } catch (err) {
        setError(mensajeDeError(err, 'Error al cargar los temas'));
      }
    };

    void fetchTemas();
  }, []);

  useEffect(() => {
    if (!selectedTemaId) return;

    const fetchSubtemas = async () => {
      try {
        const { data } = await api.get<Subtema[]>(`/api/temas/${selectedTemaId}/subtemas`);
        setSubtemas(data);
      } catch (err) {
        setError(mensajeDeError(err, 'Error al cargar los subtemas'));
      }
    };

    void fetchSubtemas();
  }, [selectedTemaId]);

  const handleSelectTema = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedTemaId(event.target.value);
    setSelectedSubtema(null);
    setAnnouncement('Tema seleccionado');
  };

  const handleSelectSubtema = (subtema: Subtema) => {
    setSelectedSubtema(subtema);
    setAnnouncement(`Subtema ${subtema.name} seleccionado`);
  };

  return (
    <div>
      <h1>Bienvenido a Adivimat Accesible</h1>

      {error && <p role="alert">{error}</p>}

      <div>
        <h2>Temas</h2>
        {temas.length > 0 ? (
          <>
            <label htmlFor="selector-tema">Selecciona un tema</label>
            <select id="selector-tema" onChange={handleSelectTema} value={selectedTemaId}>
              <option value="" disabled>
                Selecciona un tema
              </option>
              {temas.map((tema) => (
                /* `tema.id`, no `tema._id`: el backend serializa el ObjectId
                   como `id` y el tipo compartido no expone `_id`. */
                <option key={tema.id} value={tema.id}>
                  {tema.tema}
                </option>
              ))}
            </select>
          </>
        ) : (
          <p>Cargando temas...</p>
        )}
      </div>

      {selectedTemaId && (
        <div>
          <h2>Subtemas</h2>
          {subtemas.length > 0 ? (
            <ul>
              {subtemas.map((subtema) => (
                <li key={subtema.id}>
                  <button
                    onClick={() => handleSelectSubtema(subtema)}
                    aria-pressed={selectedSubtema?.id === subtema.id}
                  >
                    {subtema.name}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>Cargando subtemas...</p>
          )}
        </div>
      )}

      {selectedTemaId && selectedSubtema && (
        <div>
          <h2>Adivinanzas</h2>
          <RiddleSelector temaId={selectedTemaId} subtemaId={selectedSubtema.id} />
        </div>
      )}

      <div aria-live="polite" style={{ position: 'absolute', left: '-9999px' }}>
        {announcement}
      </div>
    </div>
  );
}

export default Home;
