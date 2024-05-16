import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ThemeList from './ThemeList';
import SubthemeList from './SubthemeList';
import RiddleTable from './RiddleTable';

function ThemeManager() {
  const [temas, setTemas] = useState([]);
  const [temaSeleccionado, setTemaSeleccionado] = useState(null);
  const [subtemaSeleccionado, setSubtemaSeleccionado] = useState(null);

  useEffect(() => {
    obtenerTemas();
  }, []);

  const obtenerTemas = async () => {
    try {
      const respuesta = await axios.get('/api/temas');
      setTemas(respuesta.data);
    } catch (error) {
      alert('Error al cargar los temas');
    }
  };

  return (
    <div>
      <ThemeList themes={temas} onSelectTheme={setTemaSeleccionado} />
      {temaSeleccionado && <SubthemeList themeId={temaSeleccionado._id} onSelectSubtheme={setSubtemaSeleccionado} />}
      {subtemaSeleccionado && <RiddleTable subthemeId={subtemaSeleccionado._id} />}
    </div>
  );
}

export default ThemeManager;