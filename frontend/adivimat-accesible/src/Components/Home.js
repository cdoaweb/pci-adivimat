import React, { useState, useEffect } from 'react';
import axios from './utils/axiosConfig';
import RiddleSelector from './selector/RiddleSelector';

function Home() {
  const [temas, setTemas] = useState([]);
  const [selectedTemaId, setSelectedTemaId] = useState(null);
  const [subtemas, setSubtemas] = useState([]);
  const [selectedSubtema, setSelectedSubtema] = useState(null);

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

  const handleSelectTema = (temaId) => {
    setSelectedTemaId(temaId);
    setSelectedSubtema(null);
  };

  const handleSelectSubtema = (subtema) => {
    setSelectedSubtema(subtema);
  };

  return (
    <div>
      <h1>Bienvenido a Adivimat Accesible</h1>
      <div>
        <h2>Temas</h2>
        {temas.length > 0 ? (
          <ul>
            {temas.map((tema) => (
              <li key={tema._id} onClick={() => handleSelectTema(tema._id)}>
                {tema.tema}
              </li>
            ))}
          </ul>
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
                <li key={subtema.name} onClick={() => handleSelectSubtema(subtema.name)}>
                  {subtema.name}
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
    </div>
  );
}

export default Home;
