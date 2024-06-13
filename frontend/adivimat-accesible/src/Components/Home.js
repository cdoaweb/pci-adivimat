import React, { useState, useEffect } from 'react';
import axios from './utils/axiosConfig';
import RiddleSelector from './selector/RiddleSelector';

function Home() {
  // Estados para almacenar los temas, el ID del tema seleccionado, los subtemas, el subtema seleccionado y los anuncios de accesibilidad.
  const [temas, setTemas] = useState([]);
  const [selectedTemaId, setSelectedTemaId] = useState(null);
  const [subtemas, setSubtemas] = useState([]);
  const [selectedSubtema, setSelectedSubtema] = useState(null);
  const [announcement, setAnnouncement] = useState('');

  // useEffect para obtener los temas al montar el componente
  useEffect(() => {
    const fetchTemas = async () => {
      try {
        const response = await axios.get('/api/temas');
        setTemas(response.data);
      } catch (error) {
        console.error('Error fetching temas:', error);
      }
    };

    fetchTemas();
  }, []);

  // useEffect para obtener los subtemas cuando se selecciona un tema
  useEffect(() => {
    if (selectedTemaId) {
      const fetchSubtemas = async () => {
        try {
          const response = await axios.get(`/api/temas/${selectedTemaId}/subtemas`);
          setSubtemas(response.data);
        } catch (error) {
          console.error('Error fetching subtemas:', error);
        }
      };

      fetchSubtemas();
    }
  }, [selectedTemaId]);

  // Manejar la selección de un tema
  const handleSelectTema = (event) => {
    const temaId = event.target.value;
    setSelectedTemaId(temaId);
    setSelectedSubtema(null);
    setAnnouncement('Tema seleccionado');
  };

  // Manejar la selección de un subtema
  const handleSelectSubtema = (subtema) => {
    setSelectedSubtema(subtema);
    setAnnouncement(`Subtema ${subtema} seleccionado`);
  };

  return (
    <div>
      <h1>Bienvenido a Adivimat Accesible</h1>
      <div>
        <h2>Temas</h2>
        {temas.length > 0 ? (
          <select onChange={handleSelectTema} value={selectedTemaId || ''}>
            <option value="" disabled>Selecciona un tema</option>
            {temas.map((tema) => (
              <option key={tema._id} value={tema._id}>
                {tema.tema}
              </option>
            ))}
          </select>
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
                <li key={subtema.name}>
                  <button
                    onClick={() => handleSelectSubtema(subtema.name)}
                    aria-pressed={selectedSubtema === subtema.name}
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

      {selectedSubtema && (
        <div>
          <h2>Adivinanzas</h2>
          <RiddleSelector temaId={selectedTemaId} subtema={selectedSubtema} />
        </div>
      )}

      {/* Elemento aria-live para anunciar cambios dinámicos */}
      <div aria-live="polite" style={{ position: 'absolute', left: '-9999px' }}>
        {announcement}
      </div>
    </div>
  );
}

export default Home;
