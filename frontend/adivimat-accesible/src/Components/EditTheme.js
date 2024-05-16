import React, { useState, useEffect } from 'react';
import axios from 'axios';

function EditTheme({ themeId }) {
  const [themeName, setThemeName] = useState('');

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const response = await axios.get(`/api/temas/${themeId}`);
        setThemeName(response.data.name);
      } catch (error) {
        alert('Error al cargar el tema');
      }
    };

    fetchTheme();
  }, [themeId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.put(`/api/temas/${themeId}`, {
        name: themeName
      });
      alert('Tema actualizado con éxito!');
    } catch (error) {
      alert('Error al actualizar el tema');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Nombre del Tema:
        <input type="text" value={themeName} onChange={e => setThemeName(e.target.value)} />
      </label>
      <button type="submit">Actualizar Tema</button>
    </form>
  );
}

export default EditTheme;