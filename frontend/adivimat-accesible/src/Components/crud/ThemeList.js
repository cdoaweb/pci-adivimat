import React from 'react';
import EditTheme from './EditTheme';
import AddTheme from './AddTheme';
import axios from '../utils/axiosConfig';

function ThemeList({ themes, tema, onSelectTheme }) {
  return (
    <ul>
          <h2>Temas</h2>
      {themes.map(theme => (
        <li key={theme._id} onClick={() => onSelectTheme(theme)}>
          {theme.tema}
          <button onClick={() => EditTheme(tema.EditTheme)}>Editar el tema</button>
          <button onClick={() => AddTheme(tema.AddTheme)}>Añadir tema</button>
        </li>
      ))}
    </ul>
  );
}

export default ThemeList;