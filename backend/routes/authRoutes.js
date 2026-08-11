const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/authMiddleware');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/google-login', authController.googleLogin);
router.get('/me', auth, authController.getMe);
router.put('/profile', auth, authController.updateProfile);
router.get('/students', auth, authController.getStudents);

module.exports = router;
