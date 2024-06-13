import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axiosConfig';

function ThemeList({ themes, onSelectTheme }) {
  const navigate = useNavigate();  // Crear una instancia de useNavigate

  // Función para manejar el clic en el botón de editar
  const handleEditClick = (themeId) => {
    navigate(`/temas/${themeId}/editar`);
  };

  // Función para manejar el clic en el botón de añadir
  const handleAddClick = () => {
    navigate(`/temas/nuevo`);
  };

  return (
    <ul>
      <h2>Temas</h2>
      {themes.map(theme => (
        <li key={theme._id} onClick={() => onSelectTheme(theme)}>
          {theme.tema}
          <button onClick={() => handleEditClick(theme._id)}>Editar el tema</button>
          <button onClick={handleAddClick}>Añadir tema</button>
        </li>
      ))}
    </ul>
  );
}

export default ThemeList;
