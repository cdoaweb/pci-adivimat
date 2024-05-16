import React, { useState, useEffect } from 'react';
import axios from 'axios';

function EditSubtheme({ themeId, subthemeId }) {
  const [subthemeName, setSubthemeName] = useState('');

  useEffect(() => {
    const fetchSubtheme = async () => {
      try {
        const response = await axios.get(`/api/temas/${themeId}/subtemas/${subthemeId}`);
        setSubthemeName(response.data.name);
      } catch (error) {
        alert('Error al cargar el subtema');
      }
    };

    fetchSubtheme();
  }, [themeId, subthemeId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.put(`/api/temas/${themeId}/subtemas/${subthemeId}`, {
        name: subthemeName
      });
      alert('Subtema actualizado con éxito!');
    } catch (error) {
      alert('Error al actualizar el subtema');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Nombre del Subtema:
        <input type="text" value={subthemeName} onChange={e => setSubthemeName(e.target.value)} />
      </label>
      <button type="submit">Actualizar Subtema</button>
    </form>
  );
}

export default EditSubtheme;