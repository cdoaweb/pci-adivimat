import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosConfig'

function SubthemeList({ themeId, onSelectSubtheme }) {
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
      {subthemes.map(subtheme => (
        <li key={subtheme._id} onClick={() => onSelectSubtheme(subtheme)}>
          {subtheme.name}
        </li>
      ))}
    </ul>
  );
}

export default SubthemeList;