import React, { useState } from 'react';
import axios from '../utils/axiosConfig';

function AddRiddle({ temaId, subtemaId, onClose }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.post(`/api/temas/${temaId}/subtemas/${subtemaId}/adivinanzas`, {
        pregunta: question,
        respuesta: answer
      });
      alert('Adivinanza añadida con éxito!');
      setQuestion('');
      setAnswer('');
      onClose(); // Cerramos el formulario después de añadir
    } catch (error) {
      alert('Error al añadir la adivinanza');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Pregunta:
        <input type="text" value={question} onChange={e => setQuestion(e.target.value)} required />
      </label>
      <label>Respuesta:
        <input type="text" value={answer} onChange={e => setAnswer(e.target.value)} required />
      </label>
      <button type="submit">Añadir Adivinanza</button>
      <button type="button" onClick={onClose}>Cancelar</button>
    </form>
  );
}

export default AddRiddle;
