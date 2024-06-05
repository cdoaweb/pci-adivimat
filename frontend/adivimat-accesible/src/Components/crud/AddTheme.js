import React, { useState } from 'react';
import axios from '../../utils/axiosConfig'

function AddTheme() {
  const [temaName, setTemaName] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('/api/temas', {
        name: temaName
      });
      alert('Tema añadido con éxito!');
      setTemaName('');
    } catch (error) {
      alert('Error al añadir el tema');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Nombre del Tema:
        <input type="text" value={themeName} onChange={e => setThemeName(e.target.value)} />
      </label>
      <button type="submit">Añadir Tema</button>
    </form>
  );
}

export default AddTheme;