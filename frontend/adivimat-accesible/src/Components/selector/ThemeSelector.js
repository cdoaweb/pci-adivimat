import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosConfig'

function ThemeSelector({ setThemeId, onConfirm }) {
  const [themes, setThemes] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchThemes = async () => {
      setIsLoading(true);
      setError(null); // Resetea el estado de error en cada intento de carga
      try {
        const response = await axios.get('/api/temas');
        setThemes(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching themes:', error);
        setError('No se pudieron cargar los temas, por favor intente de nuevo más tarde.');
        setIsLoading(false);
      }
    };

    fetchThemes();
  }, []);

  const handleSelectionChange = (e) => {
    const newThemeId = e.target.value;
    setSelectedTheme(newThemeId);
    setThemeId(newThemeId);
  };

  return (
    <div>
      <h2>Seleccione un Tema:</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {isLoading ? (
        <p>Cargando temas...</p>
      ) : (
        <select onChange={handleSelectionChange} value={selectedTheme} disabled={!themes.length}>
          <option disabled value="">-- Seleccione un Tema --</option>
          {themes.map(theme => (
            <option key={theme._id} value={theme._id}>{theme.tema}</option>
          ))}
        </select>
      )}
      <button onClick={onConfirm} disabled={!selectedTheme}>Confirmar Tema</button>
    </div>
  );
}

export default ThemeSelector;