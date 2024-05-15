import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Riddle({ subthemeId, riddleId, setRiddleId }) {
  const [riddle, setRiddle] = useState(null);

  useEffect(() => {
    if (subthemeId && riddleId) {
      axios.get(`http://localhost:3000/adivinanzas/${subthemeId}/${riddleId}`)
        .then(response => setRiddle(response.data))
        .catch(error => console.error('Error fetching riddle:', error));
    }
  }, [subthemeId, riddleId]);

  const handleAnswer = (answer) => {
    axios.post(`http://localhost:3000/respuesta/${subthemeId}/${riddle._id}`, {
      respuestaUsuario: answer
    })
    .then(response => {
      alert(response.data.message);
      if (response.data.respuestaRevelada) {
        // Handle the case where the answer has been revealed
      }
    })
    .catch(error => console.error('Error submitting answer:', error));
  };

  if (!riddle) {
    return <p>Loading riddle...</p>;
  }

  return (
    <div>
      <h2>Adivinanza:</h2>
      <p>{riddle.pregunta}</p>
      <input type="text" placeholder="Ingrese su respuesta" onKeyPress={e => {
        if (e.key === 'Enter') handleAnswer(e.target.value);
      }} />
      <button onClick={() => setRiddleId(riddle._id + 1)}>Siguiente Adivinanza</button>
    </div>
  );
}

export default Riddle;