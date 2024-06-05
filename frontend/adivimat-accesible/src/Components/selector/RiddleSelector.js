import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosConfig';

function RiddleSelector({ temaId, subtema }) {
  const [adivinanzas, setAdivinanzas] = useState([]);
  const [currentRiddle, setCurrentRiddle] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [maxAttempts, setMaxAttempts] = useState(5);
  const [userAnswer, setUserAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdivinanzas = async () => {
      if (temaId && subtema) {
        setIsLoading(true);
        setError(null);
        try {
          console.log(`Fetching riddles for temaId: ${temaId} and subtema: ${subtema}`);
          const response = await axios.get(`/api/temas/${temaId}/subtemas/${subtema}/adivinanzas`);
          console.log('Riddles fetched:', response.data);
          if (response.data && response.data.length > 0) {
            setAdivinanzas(response.data);
            getRandomRiddle(response.data);
          } else {
            setError('No se encontraron adivinanzas para el subtema seleccionado.');
          }
          setIsLoading(false);
        } catch (error) {
          console.error('Error fetching riddles:', error);
          setError('Error al cargar las adivinanzas, intente de nuevo más tarde.');
          setIsLoading(false);
        }
      }
    };

    fetchAdivinanzas();
  }, [temaId, subtema]);

  const getRandomRiddle = (adivinanzas) => {
    const randomIndex = Math.floor(Math.random() * adivinanzas.length);
    setCurrentRiddle(adivinanzas[randomIndex]);
    setAttempts(0);
    setShowAnswer(false);
    setUserAnswer('');
  };

  const handleAnswerChange = (e) => {
    setUserAnswer(e.target.value);
  };

  const handleAnswerSubmit = () => {
    if (userAnswer.toLowerCase() === currentRiddle.respuesta.toLowerCase()) {
      alert('¡Correcto!');
      getRandomRiddle(adivinanzas);
    } else {
      setAttempts(attempts + 1);
      if (attempts + 1 >= maxAttempts) {
        setShowAnswer(true);
      }
    }
    setUserAnswer('');
  };

  const handleSkip = () => {
    getRandomRiddle(adivinanzas);
  };

  if (isLoading) {
    return <p>Cargando adivinanzas...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!currentRiddle) {
    return <p>No hay adivinanza disponible.</p>;
  }

  return (
    <div>
      <h3>Adivinanza:</h3>
      <p>{currentRiddle.pregunta}</p>
      <input
        type="text"
        value={userAnswer}
        onChange={handleAnswerChange}
        disabled={showAnswer}
        placeholder="Ingrese su respuesta"
      />
      <button onClick={handleAnswerSubmit} disabled={showAnswer}>Responder</button>
      <button onClick={handleSkip}>Saltar</button>
      {showAnswer && <p>La respuesta es: {currentRiddle.respuesta}</p>}
      <p>Intentos restantes: {maxAttempts - attempts}</p>
    </div>
  );
}

export default RiddleSelector;
