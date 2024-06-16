import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosConfig';

function EditRiddle({ temaId, subtemaId, adivinanzaId }) {
  const [pregunta, setPregunta] = useState('');
  const [respuesta, setRespuesta] = useState('');

  useEffect(() => {
    const fetchRiddle = async () => {
      try {
        // Log de depuración para los IDs
        console.log('Fetching riddle:', { temaId, subtemaId, adivinanzaId });

        // Realiza una solicitud GET al backend para obtener la adivinanza
        const response = await axios.get(`/api/temas/${temaId}/subtemas/${subtemaId}/adivinanzas/${adivinanzaId}`);
        
        // Log de depuración para la respuesta del backend
        console.log('Riddle data:', response.data);

        // Actualiza los estados de pregunta y respuesta con los datos recibidos
        setPregunta(response.data.pregunta);
        setRespuesta(response.data.respuesta);
      } catch (error) {
        console.error('Error al cargar la adivinanza:', error);
        alert('Error al cargar la adivinanza');
      }
    };

    fetchRiddle();
  }, [temaId, subtemaId, adivinanzaId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      // Realiza una solicitud PUT al backend para actualizar la adivinanza
      await axios.put(`/api/temas/${temaId}/subtemas/${subtemaId}/adivinanzas/${adivinanzaId}`, {
        pregunta: pregunta,
        respuesta: respuesta
      });
      alert('Adivinanza actualizada con éxito!');
    } catch (error) {
      console.error('Error al actualizar la adivinanza:', error);
      alert('Error al actualizar la adivinanza');
    }
  };

  // Renderiza el formulario de edición de la adivinanza
  return (
    <form onSubmit={handleSubmit}>
      <label>Pregunta:
        <input type="text" value={pregunta} onChange={e => setPregunta(e.target.value)} />
      </label>
      <label>Respuesta:
        <input type="text" value={respuesta} onChange={e => setRespuesta(e.target.value)} />
      </label>
      <button type="submit">Actualizar Adivinanza</button>
    </form>
  );
}

export default EditRiddle;
