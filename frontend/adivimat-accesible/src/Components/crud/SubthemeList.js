import React, { useState, useEffect } from 'react';
import EditSubtheme from './EditSubtheme';
import AddSubtheme from './AddSubtheme';
import axios from '../utils/axiosConfig';

function SubthemeList({ themeId, subtema, onSelectSubtheme }) {
  const [subthemes, setSubthemes] = useState([]);

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

  return (
    <ul>
          <h2>Subtemas</h2>
      {subthemes.map(subtheme => (
        <li key={subtheme._id} onClick={() => onSelectSubtheme(subtheme)}>
          {subtheme.name}
          <button onClick={() => EditSubtheme(subtema.EditSubtheme)}>Editar El Subtema</button>
          <button onClick={() => AddSubtheme(subtema.AddSubtheme)}>Añadir un nuevo Subtema</button>
        </li>
      ))}
    </ul>
  );
}

export default SubthemeList;
