import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosConfig'

function AddSubtheme() {
  const [temas, tema, setTemas] = useState([]);
  const [selectedTema, setSelectedTema] = useState('');
  const [subtemaName, setSubtemaName] = useState('');

  useEffect(() => {
    const fetchTemas = async () => {
      try {
        const response = await axios.get('/api/temas');
        setTemas(response.data);
      } catch (error) {
        alert('Error al cargar los temas');
      }
    };
    fetchTemas();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedTema) {
      alert('Por favor, selecciona un tema');
      return;
    }
    try {
      const response = await axios.post(`/api/temas/${selectedTema}/subtemas`, {
        name: subtemaName
      });
      alert('Subtema añadido con éxito!');
      setSubtemaName('');
    } catch (error) {
      alert('Error al añadir el subtema');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Tema:
        <select value={selectedTema} onChange={e => setSelectedTema(e.target.value)} required>
          <option value="">Seleccione un tema</option>
          {temas.map(theme => (
            <option key={tema._id} value={tema._id}>{tema.tema}</option>
          ))}
        </select>
      </label>
      <label>Nombre del Subtema:
        <input type="text" value={subtemaName} onChange={e => setSubtemaName(e.target.value)} required />
      </label>
      <button type="submit">Añadir Subtema</button>
    </form>
  );
}

export default AddSubtheme;
