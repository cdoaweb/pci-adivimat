import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosConfig'

function SubthemeSelector({ themeId, setSubthemeId, onConfirm }) {
  const [subthemes, setSubthemes] = useState([]);
  const [selectedSubtheme, setSelectedSubtheme] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubthemes = async () => {
      if (themeId) {
        console.log("Fetching subthemes for theme ID:", themeId);
        setIsLoading(true);
        setError(null);
        try {
          const response = await axios.get(`api/subtemas/${themeId}`);
          console.log("Subthemes loaded:", response.data.subtemas);
          setSubthemes(response.data.subtemas);
          setIsLoading(false);
        } catch (error) {
          console.error('Error fetching subthemes:', error);
          setError('Error al cargar los subtemas, intente de nuevo más tarde.');
          setIsLoading(false);
        }
      }
    };

    fetchSubthemes();
  }, [themeId]);

  const handleSelectionChange = (e) => {
    const newSubthemeId = e.target.value;
    setSelectedSubtheme(newSubthemeId);
    setSubthemeId(newSubthemeId);
  };

  return (
    <div>
      <h2>Seleccione un Subtema:</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {isLoading ? (
        <p>Cargando subtemas...</p>
      ) : (
        <select onChange={handleSelectionChange} value={selectedSubtheme} disabled={!subthemes.length || !themeId}>
          <option disabled value="">-- Seleccione un Subtema --</option>
          {subthemes.map(subtheme => (
            <option key={subtheme._id} value={subtheme._id}>{subtheme.name}</option>
          ))}
        </select>
      )}
      <button onClick={onConfirm} disabled={!selectedSubtheme}>Confirmar</button>
    </div>
  );
}

export default SubthemeSelector;