import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosConfig'

function AddSubtheme() {
  const [themes, setThemes] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState('');
  const [subthemeName, setSubthemeName] = useState('');

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const response = await axios.get('/api/temas');
        setThemes(response.data);
      } catch (error) {
        alert('Error al cargar los temas');
      }
    };
    fetchThemes();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedTheme) {
      alert('Por favor, selecciona un tema');
      return;
    }
    try {
      const response = await axios.post(`/api/temas/${selectedTheme}/subtemas`, {
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
      <label>Tema:
        <select value={selectedTheme} onChange={e => setSelectedTheme(e.target.value)} required>
          <option value="">Seleccione un tema</option>
          {themes.map(theme => (
            <option key={theme._id} value={theme._id}>{theme.name}</option>
          ))}
        </select>
      </label>
      <label>Nombre del Subtema:
        <input type="text" value={subthemeName} onChange={e => setSubthemeName(e.target.value)} required />
      </label>
      <button type="submit">Añadir Subtema</button>
    </form>
  );
}

export default AddSubtheme;
