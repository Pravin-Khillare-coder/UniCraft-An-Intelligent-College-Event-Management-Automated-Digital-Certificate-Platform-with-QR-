const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const { auth, admin } = require('../middleware/authMiddleware');

router.post('/issue', auth, admin, certificateController.issueCertificate);
router.post('/bulk-issue', auth, admin, certificateController.bulkIssueCertificates);
router.get('/my', auth, certificateController.getMyCertificates);
router.get('/download/:id', certificateController.downloadCertificate); // Public download route
router.get('/verify/:verificationCode', certificateController.verifyCertificate); // Public verify route

// Admin Certificate Registry routes
router.get('/', auth, admin, certificateController.getAllCertificates);
router.post('/manual', auth, admin, certificateController.manualIssueCertificate);
router.put('/:id', auth, admin, certificateController.updateCertificate);
router.delete('/:id', auth, admin, certificateController.deleteCertificate);

module.exports = router;
