import React, { useState, useEffect } from 'react';

function ThemeSelector({ setThemeId, onConfirm }) {
  const [themes, setThemes] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState('');

  useEffect(() => {
    fetch('http://localhost:3000/temas')
      .then(response => response.json())
      .then(data => setThemes(data))
      .catch(error => console.error('Error fetching themes:', error));
  }, []);

  const handleSelectionChange = (e) => {
    setSelectedTheme(e.target.value);
    setThemeId(e.target.value);
  };

  return (
    <div>
      <h2>Seleccione un Tema:</h2>
      <select onChange={handleSelectionChange} value={selectedTheme}>
        <option disabled value="">-- Seleccione un Tema --</option>
        {themes.map(theme => (
          <option key={theme._id} value={theme._id}>{theme.tema}</option>
        ))}
      </select>
      <button onClick={onConfirm}>Confirmar Tema</button>
    </div>
  );
}

export default ThemeSelector;
