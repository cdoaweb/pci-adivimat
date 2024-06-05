import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container">
        <p>&copy; {currentYear} Carlos Daniel Ondo. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
