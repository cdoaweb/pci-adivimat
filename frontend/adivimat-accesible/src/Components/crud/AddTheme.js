import React, { useState } from 'react';
import axios from '../utils/axiosConfig';

function AddTheme({ onClose }) {
  const [themeName, setThemeName] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.post('/api/temas', {
        name: themeName
      });
      alert('Tema añadido con éxito!');
      setThemeName('');
      onClose(); // Cerramos el formulario después de añadir
    } catch (error) {
      alert('Error al añadir el tema');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Nombre del Tema:
        <input type="text" value={themeName} onChange={e => setThemeName(e.target.value)} required />
      </label>
      <button type="submit">Añadir Tema</button>
      <button type="button" onClick={onClose}>Cancelar</button>
    </form>
  );
}

export default AddTheme;
