import logo from './logo.svg';
import './App.css';
import React, { useState } from 'react';
import ThemeSelector from './Components/ThemeSelector';
import SubthemeSelector from './Components/SubthemeSelector';
import Riddle from './Components/Riddle';

function App() {
  const [themeId, setThemeId] = useState(null);
  const [subthemeId, setSubthemeId] = useState(null);
  const [showSubthemes, setShowSubthemes] = useState(false);
  const [showRiddles, setShowRiddles] = useState(false);

  const handleThemeConfirm = () => {
    setShowSubthemes(true);
  };

  const handleSubthemeConfirm = () => {
    setShowRiddles(true);
  };

  return (
    <div className="App">
      <h1>Adivinanzas Matemáticas</h1>
      {!showSubthemes && <ThemeSelector setThemeId={setThemeId} onConfirm={handleThemeConfirm} />}
      {showSubthemes && !showRiddles && <SubthemeSelector themeId={themeId} setSubthemeId={setSubthemeId} onConfirm={handleSubthemeConfirm} />}
      {showRiddles && <Riddle subthemeId={subthemeId} />}
    </div>
  );
}

export default App;
