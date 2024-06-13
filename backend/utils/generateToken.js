const jwt = require('jsonwebtoken');

// Generar un JWT
const generateToken = (userId, isAdmin) => {
  // Carga la clave secreta desde las variables de entorno
  const secretKey = process.env.JWT_SECRET;

  // Información del token
  const payload = {
    id: userId,
    isAdmin: isAdmin,
  };

  // Opciones del token
  const options = {
    expiresIn: '1h', // El token expira en 1 hora
  };

  // Crear el token
  const token = jwt.sign(payload, secretKey, options);
  return token;
};

module.exports = generateToken;