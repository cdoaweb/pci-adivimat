const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
  try {
    const { username, password, adminCode } = req.body;
    // Verificar si el código de admin es correcto para permitir la creación de un admin
    if (adminCode !== process.env.ADMIN_CODE) {
      return res.status(401).json({ message: 'Unauthorized to create an admin' });
    }
    const user = new User({ username, password, isAdmin: true });
    await user.save();
    res.status(201).json({ message: 'Admin created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering new admin: ' + error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.comparePassword(password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ message: 'Error checking credentials: ' + err.message });
      }
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ token, user: { username: user.username, isAdmin: user.isAdmin } });
    });
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