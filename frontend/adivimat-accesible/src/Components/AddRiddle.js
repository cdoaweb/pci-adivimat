import React, { useState } from 'react';
import axios from 'axios';

function AddRiddle({ subthemeId }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(`/api/subtemas/${subthemeId}/adivinanzas`, {
        pregunta: question,
        respuesta: answer
      });
      alert('Adivinanza añadida con éxito!');
      setQuestion('');
      setAnswer('');
    } catch (error) {
      alert('Error al añadir la adivinanza');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Pregunta:
        <input type="text" value={question} onChange={e => setQuestion(e.target.value)} />
      </label>
      <label>Respuesta:
        <input type="text" value={answer} onChange={e => setAnswer(e.target.value)} />
      </label>
      <button type="submit">Añadir Adivinanza</button>
    </form>
  );
}

export default AddRiddle;