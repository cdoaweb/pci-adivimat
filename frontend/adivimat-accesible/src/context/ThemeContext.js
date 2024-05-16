import React, { createContext, useState, useContext, useCallback } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themes, setThemes] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [selectedSubtheme, setSelectedSubtheme] = useState(null);

  const fetchThemes = useCallback(async () => {
    try {
      const response = await fetch('/api/temas');
      const data = await response.json();
      setThemes(data);
    } catch (error) {
      console.error('Error al cargar los temas:', error);
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