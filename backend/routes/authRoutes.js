const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);

router.post('/login', authController.login);
router.use('/admin', authController.isAdmin);

// router.get('/admin/dashboard', dashboardController.show);

router.get('/logout', (req, res) => {
  
  res.status(200).send('Logout successful. Please clear your token.');
});

module.exports = router;