import React, { useState } from 'react';
import axios from '../utils/axiosConfig';
import { useParams, useNavigate } from 'react-router-dom';

const EliminarAdivinanza = () => {
  const { temaId, subtemaId, adivinanzaId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`/api/temas/${temaId}/subtemas/${subtemaId}/adivinanzas/${adivinanzaId}`);
      alert('Adivinanza eliminada exitosamente');
      navigate(`/temas/${temaId}/subtemas/${subtemaId}`);
    } catch (error) {
      setError('Error al eliminar la adivinanza');
      console.error('Error al eliminar la adivinanza:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Eliminar Adivinanza</h2>
      <p>¿Estás seguro de que deseas eliminar esta adivinanza?</p>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={handleDelete} disabled={loading}>
        {loading ? 'Eliminando...' : 'Eliminar Adivinanza'}
      </button>
      <button onClick={() => navigate(-1)}>Cancelar</button>
    </div>
  );
};

export default EliminarAdivinanza;
