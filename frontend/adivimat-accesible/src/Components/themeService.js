import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

// Temas
const getThemes = () => api.get('/temas');
const createTheme = (theme) => api.post('/temas', theme);
const updateTheme = (themeId, updatedTheme) => api.put(`/temas/${themeId}`, updatedTheme);

// Subtemas
const getSubthemes = (themeId) => api.get(`/temas/${themeId}/subtemas`);
const createSubtheme = (themeId, subtheme) => api.post(`/temas/${themeId}/subtemas`, subtheme);
const updateSubtheme = (themeId, subtemaId, updatedSubtheme) => api.put(`/temas/${themeId}/subtemas/${subtemaId}`, updatedSubtheme);
const deleteSubtheme = (themeId, subtemaId) => api.delete(`/temas/${themeId}/subtemas/${subtemaId}`);

// Adivinanzas
const getRiddles = (themeId, subtemaId) => api.get(`/temas/${themeId}/subtemas/${subtemaId}/adivinanzas`);
const createRiddle = (themeId, subtemaId, riddle) => api.post(`/temas/${themeId}/subtemas/${subtemaId}/adivinanzas`, riddle);
const updateRiddle = (themeId, subtemaId, adivinanzaId, updatedRiddle) => api.put(`/temas/${themeId}/subtemas/${subtemaId}/adivinanzas/${adivinanzaId}`, updatedRiddle);
const deleteRiddle = (themeId, subtemaId, adivinanzaId) => api.delete(`/temas/${themeId}/subtemas/${subtemaId}/adivinanzas/${adivinanzaId}`);

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