import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosConfig'
import ThemeList from './ThemeList';
import SubthemeList from './SubthemeList';
import RiddleTable from './RiddleTable';

function ThemeManager() {
  const [temas, setTemas] = useState([]);
  const [selectedTemaId, setSelectedTemaId] = useState(null);
  const [subtemas, setSubtemas] = useState([]);
  const [selectedSubtema, setSelectedSubtema] = useState(null);


  useEffect(() => {
    const fetchTemas = async () => {
      try {
        const response = await axios.get('/api/temas');
        setTemas(response.data);
      } catch (error) {
        console.error('Error fetching temas:', error);
      }
    };

    fetchTemas();
  }, []);

  useEffect(() => {
    if (selectedTemaId) {
      const fetchSubtemas = async () => {
        try {
          const response = await axios.get(`/api/temas/${selectedTemaId._id}/subtemas`);
          setSubtemas(response.data);
        } catch (error) {
          console.error('Error fetching subtemas:', error);
        }
      };

      fetchSubtemas();
    }
  }, [selectedTemaId]);


  const handleSelectTema = (temaId) => {
    setSelectedTemaId(temaId);
    setSelectedSubtema(null);
  };

  const handleSelectSubtema = (subtema) => {
    setSelectedSubtema(subtema);
  };



  return (
    <div>
      <ThemeList themes={temas} onSelectTheme={setSelectedTemaId} />
      {selectedTemaId && <SubthemeList themeId={selectedTemaId._id} onSelectSubtheme={setSelectedSubtema} />}
      {selectedSubtema && <RiddleTable  temaId={selectedTemaId._id} subtema={selectedSubtema.name} />}
    </div>
  );
}

export default ThemeManager;