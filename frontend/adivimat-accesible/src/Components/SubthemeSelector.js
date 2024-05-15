import React, { useState, useEffect } from 'react';
import axios from 'axios';

function SubthemeSelector({ themeId, setSubthemeId, onConfirm }) {
  const [subthemes, setSubthemes] = useState([]);
  const [selectedSubtheme, setSelectedSubtheme] = useState('');

  useEffect(() => {
    if (themeId) {
      console.log("Fetching subthemes for theme ID:", themeId); // Depuro: ID del tema solicitado
      axios.get(`http://localhost:3000/subtemas/${themeId}`)
        .then(response => {
          console.log("Subthemes loaded:", response.data.subtemas); // Depurar: datos recibidos
          setSubthemes(response.data.subtemas);
        })
        .catch(error => {
          console.error('Error fetching subthemes:', error);
          alert('Error al cargar los subtemas');
        });
    }
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
      <button onClick={onConfirm}>Confirmar</button>
    </div>
  );
}

export default SubthemeSelector;