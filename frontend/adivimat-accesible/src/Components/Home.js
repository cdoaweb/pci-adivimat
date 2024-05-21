import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Riddle from './Riddle';

function Home() {
  const [temas, setTemas] = useState([]);
  const [selectedTemaId, setSelectedTemaId] = useState(null);
  const [subtemas, setSubtemas] = useState([]);
  const [selectedSubtemaId, setSelectedSubtemaId] = useState(null);
  const [riddleId, setRiddleId] = useState(null);

  useEffect(() => {
    const fetchTemas = async () => {
      try {
        const response = await axios.get('http://localhost:3000/temas');
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
          const response = await axios.get(`http://localhost:3000/temas/${selectedTemaId}/subtemas`);
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
    setSelectedSubtemaId(null);
    setRiddleId(null);
  };

  const handleSelectSubtema = (subtemaId) => {
    setSelectedSubtemaId(subtemaId);
    setRiddleId(null);
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
                <li key={subtema._id} onClick={() => handleSelectSubtema(subtema._id)}>
                  {subtema.name}
                </li>
              ))}
            </ul>
          ) : (
            <p>Cargando subtemas...</p>
          )}
        </div>
      )}

      {selectedSubtemaId && (
        <div>
          <h2>Adivinanzas</h2>
          <Riddle temaId={selectedTemaId} subthemeId={selectedSubtemaId} riddleId={riddleId} setRiddleId={setRiddleId} />
        </div>
      )}
    </div>
  );
}

export default Home;