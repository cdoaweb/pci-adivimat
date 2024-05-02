import React, { useState, useEffect } from 'react';

function SubthemeSelector({ themeId, setSubthemeId, onConfirm }) {
  const [subthemes, setSubthemes] = useState([]);
  const [selectedSubtheme, setSelectedSubtheme] = useState('');

  useEffect(() => {
    fetch(`http://localhost:3000/subtemas/${themeId}`)
      .then(response => response.json())
      .then(data => {
        setSubthemes(data.subtemas);
      })
      .catch(error => console.error('Error fetching subthemes:', error));
  }, [themeId]);

  const handleSelectionChange = (e) => {
    setSelectedSubtheme(e.target.value);
    setSubthemeId(e.target.value);
  };

  return (
    <div>
      <h2>Seleccione un Subtema:</h2>
      <select onChange={handleSelectionChange} value={selectedSubtheme}>
        <option disabled value="">-- Seleccione un Subtema --</option>
        {subthemes.map(subtheme => (
          <option key={subtheme._id} value={subtheme._id}>{subtheme.name}</option>
        ))}
      </select>
      <button onClick={onConfirm}>Jugar</button>
    </div>
  );
}

export default SubthemeSelector;
