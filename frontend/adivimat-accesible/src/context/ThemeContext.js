import React, { createContext, useState, useContext, useCallback } from 'react';
import axios from '../utils/axiosConfig'

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themes, setThemes] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [selectedSubtheme, setSelectedSubtheme] = useState(null);

  const fetchThemes = useCallback(async () => {
    try {
      const response = await axios.get('/api/temas');
      console.log(response.data);
      setThemes(response.data);
    } catch (error) {
      alert('Error al cargar los temas');
    }
  }, []);

  const value = {
    themes,
    setThemes,
    selectedTheme,
    setSelectedTheme,
    selectedSubtheme,
    setSelectedSubtheme,
    fetchThemes
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};


export const useThemes = () => useContext(ThemeContext);