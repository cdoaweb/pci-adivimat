import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Riddle({ subthemeId, riddleId, setRiddleId }) {
  const [riddle, setRiddle] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRiddle = async () => {
      if (subthemeId && riddleId) {
        setIsLoading(true);
        setError(null);
        try {
          const response = await axios.get(`http://localhost:3000/adivinanzas/${subthemeId}/${riddleId}`);
          setRiddle(response.data);
          setIsLoading(false);
        } catch (error) {
          console.error('Error fetching riddle:', error);
          setError('Error al cargar la adivinanza, intente de nuevo más tarde.');
          setIsLoading(false);
        }
      }
    };

    fetchRiddle();
  }, [subthemeId, riddleId]);

  const handleAnswer = async (answer) => {
    try {
      const response = await axios.post(`http://localhost:3000/respuesta/${subthemeId}/${riddle._id}`, {
        respuestaUsuario: answer
      });
      alert(response.data.message);
      if (response.data.respuestaRevelada) {
        
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Error al enviar respuesta, intente de nuevo.');
    }
  };

  if (isLoading) {
    return <p>Loading riddle...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!riddle) {
    return <p>No hay adivinanza disponible.</p>;
  }

  return (
    <div>
      <h2>Adivinanza:</h2>
      <p>{riddle.pregunta}</p>
      <input
        type="text"
        placeholder="Ingrese su respuesta"
        onKeyPress={e => {
          if (e.key === 'Enter') {
            handleAnswer(e.target.value);
          }
        }}
      />
      <button onClick={() => setRiddleId(prev => prev + 1)}>Siguiente Adivinanza</button>
    </div>
  );
}

export default Riddle;