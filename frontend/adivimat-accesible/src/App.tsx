import { Route, Routes } from 'react-router-dom';

import './App.css';
import About from './Components/About';
import Footer from './Components/Footer';
import Gestion from './Components/Gestion';
import Home from './Components/Home';
import Login from './Components/Login';
import Logout from './Components/Logout';
import MenuAppBar from './Components/MenuAppBar';
import PrivateRoute from './Components/PrivateRoute';
import Register from './Components/Register';
import AddSubtheme from './Components/crud/AddSubtheme';
import AddTheme from './Components/crud/AddTheme';
import EditSubtheme from './Components/crud/EditSubtheme';
import EditTheme from './Components/crud/EditTheme';

function App() {
  return (
    <div className="App">
      <a href="#mainContent" className="skip-link">
        Saltar al contenido principal
      </a>
      <MenuAppBar />
      <main id="mainContent">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/gestion"
            element={
              <PrivateRoute>
                <Gestion />
              </PrivateRoute>
            }
          />
          <Route
            path="/temas/nuevo"
            element={
              <PrivateRoute>
                <AddTheme />
              </PrivateRoute>
            }
          />
          <Route
            path="/temas/:themeId/editar"
            element={
              <PrivateRoute>
                <EditTheme />
              </PrivateRoute>
            }
          />
          <Route
            path="/temas/:temaId/subtemas/nuevo"
            element={
              <PrivateRoute>
                <AddSubtheme />
              </PrivateRoute>
            }
          />
          <Route
            path="/temas/:temaId/subtemas/:subtemaId/editar"
            element={
              <PrivateRoute>
                <EditSubtheme />
              </PrivateRoute>
            }
          />
          <Route path="/logout" element={<Logout />} />
          <Route path="*" element={<p>Pagina no encontrada.</p>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
