import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EditSubtheme from './EditSubtheme';
import AddSubtheme from './AddSubtheme';
import axios from '../utils/axiosConfig';

function SubthemeList({ themeId, onSelectSubtheme }) {
  const [subthemes, setSubthemes] = useState([]);
  const navigate = useNavigate();

  // Efecto para obtener los subtemas al cargar el componente
  useEffect(() => {
    const fetchSubthemes = async () => {
      try {
        const response = await axios.get(`/api/temas/${themeId}/subtemas`);
        setSubthemes(response.data);
      } catch (error) {
        alert('Error fetching subthemes');
      }
    };

    fetchSubthemes();
  }, [themeId]);

  // Función para manejar el clic en el botón de editar
  const handleEditClick = (subtemaId) => {
    navigate(`/temas/${themeId}/subtemas/${subtemaId}/editar`);
  };

  // Función para manejar el clic en el botón de añadir
  const handleAddClick = () => {
    navigate(`/temas/${themeId}/subtemas/nuevo`);
  };

  // Función para manejar el clic en el botón de eliminar
  const handleDeleteClick = async (subtemaId) => {
    const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este subtema?");
    if (confirmDelete) {
      try {
        await axios.delete(`/api/temas/${themeId}/subtemas/${subtemaId}`);
        setSubthemes(subthemes.filter(subtheme => subtheme._id !== subtemaId));
        alert('Subtema eliminado exitosamente');
      } catch (error) {
        alert('Error al eliminar el subtema');
      }
    }
  };

  return (
    <ul>
      <h2>Subtemas</h2>
      {subthemes.map(subtheme => (
        <li key={subtheme._id} onClick={() => onSelectSubtheme(subtheme)}>
          {subtheme.name}
          <button onClick={() => handleEditClick(subtheme._id)}>Editar</button>
          <button onClick={() => handleDeleteClick(subtheme._id)}>Eliminar</button>
        </li>
      ))}
      <button onClick={handleAddClick}>Añadir un nuevo Subtema</button>
    </ul>
  );
}

export default SubthemeList;
