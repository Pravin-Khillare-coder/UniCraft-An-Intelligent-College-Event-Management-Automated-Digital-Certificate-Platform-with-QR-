const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { auth, admin } = require('../middleware/authMiddleware');

router.get('/', eventController.getEvents);
router.get('/:id', eventController.getEventById);
router.post('/', auth, admin, eventController.createEvent);
router.put('/:id', auth, admin, eventController.updateEvent);
router.delete('/:id', auth, admin, eventController.deleteEvent);

module.exports = router;
