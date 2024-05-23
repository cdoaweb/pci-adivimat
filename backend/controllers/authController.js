const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

exports.register = async (req, res) => {
  try {
    const { username, email, password, adminCode } = req.body;

    // Verificar si el código de admin es correcto para permitir la creación de un admin
    if (adminCode !== process.env.ADMIN_CODE) {
      return res.status(401).json({ message: 'Unauthorized to create an admin' });
    }

    // Encriptar la contraseña antes de guardar el usuario
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword, isAdmin: true });
    await user.save();

    // Generar el token
    const token = generateToken(user._id, user.isAdmin);

    res.status(201).json({ message: 'Admin created successfully', token });
  } catch (error) {
    res.status(500).json({ message: 'Error registering new admin: ' + error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Comprobar que la contraseña sea correcta
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generar el token
    const token = generateToken(user._id, user.isAdmin);

    res.json({ token, user: { username: user.username, isAdmin: user.isAdmin } });
  } catch (error) {
    res.status(500).json({ message: 'Error during login: ' + error.message });
  }
};

exports.isAdmin = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token or not provided' });
  }
};
