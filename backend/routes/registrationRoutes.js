const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');
const { auth, admin } = require('../middleware/authMiddleware');

router.post('/register', auth, registrationController.registerForEvent);
router.get('/my', auth, registrationController.getMyRegistrations);
router.get('/event/:eventId', auth, admin, registrationController.getEventRegistrations);
router.patch('/attendance/:registrationId', auth, admin, registrationController.updateAttendance);

module.exports = router;
