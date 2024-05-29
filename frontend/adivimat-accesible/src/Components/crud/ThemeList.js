import React from 'react';

function ThemeList({ themes, onSelectTheme }) {
  return (
    <ul>
      {themes.map(theme => (
        <li key={theme._id} onClick={() => onSelectTheme(theme)}>
          {theme.tema}
        </li>
      ))}
    </ul>
  );
}

export default ThemeList;