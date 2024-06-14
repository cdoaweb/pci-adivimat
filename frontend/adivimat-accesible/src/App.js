import logo from './logo.svg';
import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PrivateRoute from './Components/PrivateRoute';
import Login from './Components/Login';
import Register from './Components/Register';
import Home from './Components/Home';
import About from './Components/About';
import MenuAppBar from './Components/MenuAppBar';
import Gestion from './Components/Gestion';
import Footer from './Components/Footer';
import { useAuth } from './context/AuthProvider';
import EditTheme from './Components/crud/EditTheme';
import AddTheme from './Components/crud/AddTheme';

function App() {
  const { state } = useAuth();
  const { isAuthenticated, user } = state;

  return (
    <div className="App">
      <a href="#mainContent" className="skip-link">Saltar al contenido principal</a>
      {console.log(user, isAuthenticated)}
      <MenuAppBar userType={user?.isAdmin ? 'admin' : 'normal'} />
      <main id="mainContent">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/gestion" element={
            <PrivateRoute>
              <Gestion />
            </PrivateRoute>
          } />
          <Route path="/temas/:themeId/editar" element={
            <PrivateRoute>
              <EditTheme />
              
            </PrivateRoute>
          }/>
          <Route path="/temas/:themeId/añadir" element={
                <PrivateRoute>
                  <AddTheme />
                  </PrivateRoute>
          }/>
        </Routes>
      </main>
      <Footer /> {Footer }
    </div>
  );
}

export default App;
