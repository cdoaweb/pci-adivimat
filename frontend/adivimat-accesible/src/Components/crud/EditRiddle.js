import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosConfig'

function EditRiddle({ temaId, subtemaId, riddleId }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  useEffect(() => {
    const fetchRiddle = async () => {
      try {
        const response = await axios.get(`/api/temas/${temaId}/subtemas/${subtemaId}/adivinanzas/${riddleId}`);
        setQuestion(response.data.pregunta);
        setAnswer(response.data.respuesta);
      } catch (error) {
        alert('Error al cargar la adivinanza');
      }
    };

    fetchRiddle();
  }, [temaId, subtemaId, riddleId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.put(`/api/temas/${temaId}/subtemas/${subtemaId}/adivinanzas/${riddleId}`, {
        pregunta: question,
        respuesta: answer
      });
      alert('Adivinanza actualizada con éxito!');
    } catch (error) {
      alert('Error al actualizar la adivinanza');
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
      <button type="submit">Actualizar Adivinanza</button>
    </form>
  );
}

export default EditRiddle;
