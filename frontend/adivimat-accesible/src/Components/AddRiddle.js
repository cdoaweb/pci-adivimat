import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AddRiddle() {
  const [themes, setThemes] = useState([]);
  const [subthemes, setSubthemes] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState('');
  const [selectedSubtheme, setSelectedSubtheme] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const response = await axios.get('/api/temas');
        setThemes(response.data);
      } catch (error) {
        alert('Error al cargar los temas');
      }
    };
    fetchThemes();
  }, []);

  useEffect(() => {
    const fetchSubthemes = async () => {
      if (selectedTheme) {
        try {
          const response = await axios.get(`/api/temas/${selectedTheme}/subtemas`);
          setSubthemes(response.data);
        } catch (error) {
          alert('Error al cargar los subtemas');
        }
      }
    };
    fetchSubthemes();
  }, [selectedTheme]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedTheme || !selectedSubtheme) {
      alert('Por favor, selecciona un tema y un subtema');
      return;
    }
    try {
      const response = await axios.post(`/api/temas/${selectedTheme}/subtemas/${selectedSubtheme}/adivinanzas`, {
        pregunta: question,
        respuesta: answer
      });
      alert('Adivinanza añadida con éxito!');
      setQuestion('');
      setAnswer('');
    } catch (error) {
      alert('Error al añadir la adivinanza');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Tema:
        <select value={selectedTheme} onChange={e => setSelectedTheme(e.target.value)} required>
          <option value="">Seleccione un tema</option>
          {themes.map(theme => (
            <option key={theme._id} value={theme._id}>{theme.name}</option>
          ))}
        </select>
      </label>
      <label>Subtema:
        <select value={selectedSubtheme} onChange={e => setSelectedSubtheme(e.target.value)} required>
          <option value="">Seleccione un subtema</option>
          {subthemes.map(subtheme => (
            <option key={subtheme._id} value={subtheme._id}>{subtheme.name}</option>
          ))}
        </select>
      </label>
      <label>Pregunta:
        <input type="text" value={question} onChange={e => setQuestion(e.target.value)} required />
      </label>
      <label>Respuesta:
        <input type="text" value={answer} onChange={e => setAnswer(e.target.value)} required />
      </label>
      <button type="submit">Añadir Adivinanza</button>
    </form>
  );
}

export default AddRiddle;
