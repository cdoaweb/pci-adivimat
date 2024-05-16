import React, { useState } from 'react';
import axios from 'axios';

function AddSubtheme({ themeId }) {
  const [subthemeName, setSubthemeName] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(`/api/temas/${themeId}/subtemas`, {
        name: subthemeName
      });
      alert('Subtema añadido con éxito!');
      setSubthemeName('');
    } catch (error) {
      alert('Error al añadir el subtema');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Nombre del Subtema:
        <input type="text" value={subthemeName} onChange={e => setSubthemeName(e.target.value)} />
      </label>
      <button type="submit">Añadir Subtema</button>
    </form>
  );
}

export default AddSubtheme;