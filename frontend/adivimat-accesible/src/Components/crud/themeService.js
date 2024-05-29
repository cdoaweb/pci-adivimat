import axios from '../../utils/axiosConfig'


// Temas
const getThemes = () => axios.get('/api/temas');
const createTheme = (theme) => axios.post('/api/temas', theme);
const updateTheme = (themeId, updatedTheme) => axios.put(`/api/temas/${themeId}`, updatedTheme);

// Subtemas
const getSubthemes = (themeId) => axios.get(`/api/temas/${themeId}/subtemas`);
const createSubtheme = (themeId, subtheme) => axios.post(`/api/temas/${themeId}/subtemas`, subtheme);
const updateSubtheme = (themeId, subtemaId, updatedSubtheme) => axios.put(`/api/temas/${themeId}/subtemas/${subtemaId}`, updatedSubtheme);
const deleteSubtheme = (themeId, subtemaId) => axios.delete(`/api/temas/${themeId}/subtemas/${subtemaId}`);

// Adivinanzas
const getRiddles = (themeId, subtemaId) => axios.get(`/api/temas/${themeId}/subtemas/${subtemaId}/adivinanzas`);
const createRiddle = (themeId, subtemaId, riddle) => axios.post(`/api/temas/${themeId}/subtemas/${subtemaId}/adivinanzas`, riddle);
const updateRiddle = (themeId, subtemaId, adivinanzaId, updatedRiddle) => axios.put(`/api/temas/${themeId}/subtemas/${subtemaId}/adivinanzas/${adivinanzaId}`, updatedRiddle);
const deleteRiddle = (themeId, subtemaId, adivinanzaId) => axios.delete(`/api/temas/${themeId}/subtemas/${subtemaId}/adivinanzas/${adivinanzaId}`);

export const themeService = {
  getThemes,
  createTheme,
  updateTheme,
  getSubthemes,
  createSubtheme,
  updateSubtheme,
  deleteSubtheme,
  getRiddles,
  createRiddle,
  updateRiddle,
  deleteRiddle
};