import React, { useState, useEffect } from 'react';

function Riddle({ subthemeId, riddleId, setRiddleId }) {
  const [riddle, setRiddle] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3000/adivinanzas/${subthemeId}/${riddleId}`)
      .then(response => response.json())
      .then(data => setRiddle(data))
      .catch(error => console.error('Error fetching riddle:', error));
  }, [subthemeId, riddleId]);

  const handleAnswer = (answer) => {
    fetch(`http://localhost:3000/respuesta/${subthemeId}/${riddle._id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ respuestaUsuario: answer })
    })
      .then(response => response.json())
      .then(data => {
        alert(data.message);
        if (data.respuestaRevelada) {
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
