import logo from './logo.svg';
import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import About from './components/About';
import MenuAppBar from './components/MenuAppBar';
import Gestion from './components/Gestion';
import { useAuth } from './context/AuthProvider';

function App() {
  const { state } = useAuth();
  const { isAuthenticated, user } = state;

  return (
    <div className="App">
      {console.log(user, isAuthenticated)}
      <MenuAppBar userType={user?.isAdmin ? 'admin' : 'normal'} />
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
      </Routes>
    </div>
  );
}

export default App;
