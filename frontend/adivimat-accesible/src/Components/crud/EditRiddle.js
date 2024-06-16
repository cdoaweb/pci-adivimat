import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axiosConfig';

const EditRiddle = () => {
  const { temaId, subtemaId, adivinanzaId } = useParams();
  const navigate = useNavigate();
  const [adivinanza, setAdivinanza] = useState({ pregunta: '', respuesta: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/temas/${temaId}/subtemas/${subtemaId}/adivinanzas`)
      .then(response => {
        const adivinanzaEncontrada = response.data.find(ad => ad._id === adivinanzaId);
        if (adivinanzaEncontrada) {
          setAdivinanza(adivinanzaEncontrada);
        } else {
          alert('Adivinanza no encontrada');
          navigate(`/temas/${temaId}/subtemas/${subtemaId}`);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error al obtener la adivinanza:', error);
        setLoading(false);
      });
  }, [temaId, subtemaId, adivinanzaId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAdivinanza({ ...adivinanza, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.put(`/api/temas/${temaId}/subtemas/${subtemaId}/adivinanzas/${adivinanzaId}`, adivinanza)
      .then(response => {
        alert('Adivinanza actualizada exitosamente');
        navigate(`/temas/${temaId}/subtemas/${subtemaId}`);
      })
      .catch(error => {
        console.error('Error al actualizar la adivinanza:', error);
        alert('Error al actualizar la adivinanza');
      });
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div>
      <h2>Editar Adivinanza</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Pregunta:</label>
          <input
            type="text"
            name="pregunta"
            value={adivinanza.pregunta}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Respuesta:</label>
          <input
            type="text"
            name="respuesta"
            value={adivinanza.respuesta}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Guardar Cambios</button>
      </form>
    </div>
  );
};

export default EditRiddle;
