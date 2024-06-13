import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosConfig';

/**
 * Carga de adivinanzas: El efecto `useEffect` se encarga de cargar las adivinanzas desde el servidor 
 * cuando se monta el componente o cambian las propiedades `temaId` o `subtema`.
 * Selección de adivinanza aleatoria: La función `getRandomRiddle` selecciona una adivinanza al azar 
 * de la lista de adivinanzas disponibles y restablece el estado de los intentos y la respuesta del usuario.
 * Manejo de cambios en la respuesta: La función `handleAnswerChange` actualiza el estado `userAnswer` 
 * cada vez que el usuario escribe en la caja de texto.
 * Envio de la respuesta: La función `handleAnswerSubmit` compara la respuesta del usuario con la respuesta 
 * correcta y proporciona retroalimentación mediante el estado `announcement`. También actualiza los intentos 
 * restantes y muestra la respuesta correcta si los intentos se agotan.
 * Accesibilidad: Utilizo aria-live para anunciar los mensajes importantes, asegurando que los usuarios 
 * de lectores de pantalla reciban actualizaciones relevantes sin sobrecargarlos. Además, los botones tienen 
 * atributos `aria-label` para mejorar la usabilidad.
 */

function RiddleSelector({ temaId, subtema }) {
  // Definición de estados
  const [adivinanzas, setAdivinanzas] = useState([]);
  const [currentRiddle, setCurrentRiddle] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [maxAttempts, setMaxAttempts] = useState(5);
  const [userAnswer, setUserAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [announcement, setAnnouncement] = useState('');

  // useEffect se ejecuta cuando se monta el componente o cambian `temaId` o `subtema`
  useEffect(() => {
    const fetchAdivinanzas = async () => {
      if (temaId && subtema) {
        setIsLoading(true);
        setError(null);
        try {
          // Solicita las adivinanzas al servidor
          const response = await axios.get(`/api/temas/${temaId}/subtemas/${subtema}/adivinanzas`);
          if (response.data && response.data.length > 0) {
            setAdivinanzas(response.data);
            getRandomRiddle(response.data);
          } else {
            setError('No se encontraron adivinanzas para el subtema seleccionado.');
          }
          setIsLoading(false);
        } catch (error) {
          setError('Error al cargar las adivinanzas, intente de nuevo más tarde.');
          setIsLoading(false);
        }
      }
    };

    fetchAdivinanzas();
  }, [temaId, subtema]);

  // Selecciona una adivinanza aleatoria de la lista
  const getRandomRiddle = (adivinanzas) => {
    const randomIndex = Math.floor(Math.random() * adivinanzas.length);
    setCurrentRiddle(adivinanzas[randomIndex]);
    setAttempts(0);
    setShowAnswer(false);
    setUserAnswer('');
    setAnnouncement(`Nueva adivinanza: ${adivinanzas[randomIndex].pregunta}`);
  };

  // Maneja el cambio en el input de la respuesta del usuario
  const handleAnswerChange = (e) => {
    setUserAnswer(e.target.value);
  };

  // Envía la respuesta cuando se presiona Enter
  const handleKeyPressed = (e) => {
    if (e.keyCode === 13) {
      handleAnswerSubmit();
    }
  };

  // Envía la respuesta y proporciona retroalimentación
  const handleAnswerSubmit = () => {
    if (userAnswer.toLowerCase() === currentRiddle.respuesta.toLowerCase()) {
      setAnnouncement('¡Correcto! ¡Bien hecho!');
      getRandomRiddle(adivinanzas);
    } else {
      setAttempts(attempts + 1);
      if (attempts + 1 >= maxAttempts) {
        setShowAnswer(true);
        setAnnouncement(`Lo siento, has agotado tus intentos. La respuesta es: ${currentRiddle.respuesta}`);
      } else {
        setAnnouncement(`Incorrecto. Te quedan ${maxAttempts - attempts - 1} intentos.`);
      }
    }
    setUserAnswer('');
  };

  // Permite al usuario saltar la adivinanza actual
  const handleSkip = () => {
    getRandomRiddle(adivinanzas);
  };

  // Muestra un mensaje de carga si las adivinanzas están cargando
  if (isLoading) {
    return <p>Cargando adivinanzas...</p>;
  }

  // Muestra un mensaje de error si hubo un problema al cargar las adivinanzas
  if (error) {
    return <p>{error}</p>;
  }

  // Muestra un mensaje si no hay adivinanzas disponibles
  if (!currentRiddle) {
    return <p>No hay adivinanza disponible.</p>;
  }

  // Renderiza el contenido principal del componente
  return (
    <div>
      <h3>Adivinanza:</h3>
      <p>{currentRiddle.pregunta}</p>
      <div aria-live="polite">
        {announcement}
      </div>
      <input
        type="text"
        value={userAnswer}
        onChange={handleAnswerChange}
        disabled={showAnswer}
        placeholder="Ingrese su respuesta"
        onKeyDown={handleKeyPressed}
        aria-label="Caja de texto para ingresar la respuesta"
      />
      <button onClick={handleAnswerSubmit} disabled={showAnswer} aria-label="Botón para enviar respuesta">Responder</button>
      <button onClick={handleSkip} aria-label="Botón para saltar adivinanza">Saltar</button>
      {showAnswer && <p>La respuesta es: {currentRiddle.respuesta}</p>}
      <p>Intentos restantes: {maxAttempts - attempts}</p>
    </div>
  );
}

export default RiddleSelector;
