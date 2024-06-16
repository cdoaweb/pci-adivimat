import React, { useState } from 'react';
import axios from '../utils/axiosConfig';
import { useParams, useNavigate } from 'react-router-dom';

const EliminarSubtema = () => {
  const { temaId, subtemaId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`/api/temas/${temaId}/subtemas/${subtemaId}`);
      alert('Subtema eliminado exitosamente');
      navigate(`/temas/${temaId}`);
    } catch (error) {
      setError('Error al eliminar el subtema');
      console.error('Error al eliminar el subtema:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Eliminar Subtema</h2>
      <p>¿Estás seguro de que deseas eliminar este subtema?</p>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={handleDelete} disabled={loading}>
        {loading ? 'Eliminando...' : 'Eliminar Subtema'}
      </button>
      <button onClick={() => navigate(-1)}>Cancelar</button>
    </div>
  );
};

export default EliminarSubtema;
