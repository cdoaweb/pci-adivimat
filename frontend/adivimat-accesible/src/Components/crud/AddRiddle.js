import React, { useState } from 'react';
import axios from '../utils/axiosConfig';

function AddRiddle({ temaId, subtemaId, onClose }) {
  // Estado para almacenar la pregunta y la respuesta de la adivinanza
  const [pregunta, setPregunta] = useState('');
  const [respuesta, setRespuesta] = useState('');

  // Maneja el envío del formulario
  const handleSubmit = async (event) => {
    event.preventDefault(); // Evita la recarga de la página
    try {
      // Realiza una solicitud POST al backend para añadir la adivinanza
      await axios.post(`/api/temas/${temaId}/subtemas/${subtemaId}/adivinanzas`, {
        pregunta: pregunta,
        respuesta: respuesta
      });
      alert('Adivinanza añadida con éxito!');
      // Resetea los campos del formulario
      setPregunta('');
      setRespuesta('');
      // Cierra el formulario después de añadir la adivinanza
      onClose();
    } catch (error) {
      console.error('Error al añadir la adivinanza:', error); // Log de error para más detalles
      alert('Error al añadir la adivinanza');
    }
  };

  // Renderiza el formulario para añadir una nueva adivinanza
  return (
    <form onSubmit={handleSubmit}>
      <label>Pregunta:
        <input type="text" value={pregunta} onChange={e => setPregunta(e.target.value)} required />
      </label>
      <label>Respuesta:
        <input type="text" value={respuesta} onChange={e => setRespuesta(e.target.value)} required />
      </label>
      <button type="submit">Añadir Adivinanza</button>
      <button type="button" onClick={onClose}>Cancelar</button>
    </form>
  );
}

export default AddRiddle;
