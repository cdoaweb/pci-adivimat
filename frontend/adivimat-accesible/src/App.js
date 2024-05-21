import logo from './logo.svg';
import './App.css';
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Login from './components/Login';
import Register from './components/Register';
import { AuthProvider } from './context/AuthProvider';
import Home from './components/Home';
import About from './components/About';
import MenuAppBar from './components/MenuAppBar';

function App() {
  const [userType, setUserType] = useState('normal'); // Puede ser 'normal' o 'admin'

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <MenuAppBar userType={userType} />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/gestion" element={<PrivateRoute><div>Gestión de contenido</div></PrivateRoute>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
