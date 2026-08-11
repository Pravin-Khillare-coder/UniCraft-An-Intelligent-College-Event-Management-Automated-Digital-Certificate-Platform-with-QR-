const os = require('os');
const Certificate = require('../models/Certificate');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const User = require('../models/User');
const { generateCertificatePDF } = require('../utils/pdfGenerator');

function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const devName in interfaces) {
    const iface = interfaces[devName];
    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i];
      if (alias.family === 'IPv4' && !alias.internal && alias.address !== '127.0.0.1') {
        return alias.address;
      }
    }
  }
  return 'localhost';
}

function resolveFrontendHostUrl(req) {
  if (process.env.CLIENT_URL && process.env.CLIENT_URL.trim() !== '') {
    return process.env.CLIENT_URL.replace(/\/$/, '');
  }

  const originHeader = req.headers.origin || req.headers.referer;
  if (originHeader) {
    try {
      const url = new URL(originHeader);
      let hostName = url.hostname;
      if (hostName === 'localhost' || hostName === '127.0.0.1') {
        hostName = getLocalIpAddress();
      }
      const port = url.port ? `:${url.port}` : '';
      return `${url.protocol}//${hostName}${port}`;
    } catch (e) {
      // Fallback
    }
  }

  const lanIp = getLocalIpAddress();
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  return `${protocol}://${lanIp}:5173`;
}

function incrementCertificateNumber(currentNum) {
  const match = currentNum.match(/^(.*?)(\d+)$/);
  if (!match) return currentNum + '-1';
  const prefix = match[1];
  const numStr = match[2];
  const nextNum = parseInt(numStr, 10) + 1;
  const paddedNum = String(nextNum).padStart(numStr.length, '0');
  return prefix + paddedNum;
}

exports.issueCertificate = async (req, res) => {
  try {
    const { studentId, eventId } = req.body;

    if (!studentId || !eventId) {
      return res.status(400).json({ message: 'Student ID and Event ID are required' });
    }

    // Verify registration and attendance
    const registration = await Registration.findOne({ studentId, eventId, status: 'Registered' });
    if (!registration) {
      return res.status(400).json({ message: 'Student is not registered for this event' });
    }

    if (registration.attendance !== 'Present') {
      return res.status(400).json({ message: 'Cannot issue certificate: student attendance is not marked as Present' });
    }

    // Check if certificate already exists
    const existingCert = await Certificate.findOne({ studentId, eventId });
    if (existingCert) {
      return res.status(400).json({ message: 'Certificate has already been issued to this student for this event' });
    }

    // Get event to check for custom certificate number series
    const eventObj = await Event.findById(eventId);
    if (!eventObj) {
      return res.status(404).json({ message: 'Associated event not found' });
    }

    let certificateId;
    if (eventObj.nextCertificateNumber && eventObj.nextCertificateNumber.trim() !== '') {
      certificateId = eventObj.nextCertificateNumber;
      
      // Calculate next number sequence
      const nextNum = incrementCertificateNumber(eventObj.nextCertificateNumber);
      await Event.findByIdAndUpdate(eventId, { nextCertificateNumber: nextNum });
    } else {
      // Default fallback unique serial number: CERT-YYYYMMDD-XXXX
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randCode = Math.random().toString(36).substring(2, 6).toUpperCase();
      certificateId = `CERT-${today}-${randCode}`;
    }

    // Unique verification hash code
    const verificationCode = Math.random().toString(36).substring(2, 15).toUpperCase();

    const certificate = await Certificate.create({
      certificateId,
      studentId,
      eventId,
      verificationCode,
      issuedAt: new Date().toISOString()
    });

    res.status(201).json(certificate);
  } catch (error) {
    console.error('Issue certificate error:', error);
    res.status(500).json({ message: 'Server error issuing certificate' });
  }
};

exports.getMyCertificates = async (req, res) => {
  try {
    const studentId = req.user.id;
    const certificates = await Certificate.find({ studentId });

    // Manually join event details to ensure local JSON DB compatibility
    const populatedCerts = [];
    for (let cert of certificates) {
      const certDoc = cert.toObject ? cert.toObject() : { ...cert };
      const event = await Event.findById(cert.eventId);
      if (event) {
        certDoc.eventId = event;
      }
      populatedCerts.push(certDoc);
    }

    res.json(populatedCerts);
  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({ message: 'Server error retrieving certificates' });
  }
};

exports.downloadCertificate = async (req, res) => {
  try {
    const { id } = req.params; // This is the mongo _id or JSON mock db _id of the Certificate
    const certificate = await Certificate.findById(id);
    if (!certificate) {
      return res.status(404).send('Certificate not found');
    }

    const student = await User.findById(certificate.studentId);
    const event = await Event.findById(certificate.eventId);

    if (!student || !event) {
      return res.status(404).send('Student or Event details missing for this certificate');
    }

    // Set Response Headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Certificate_${certificate.certificateId}.pdf`);

    // Dynamically resolve network host URL (convert localhost to LAN IP for mobile QR scanning)
    const hostUrl = resolveFrontendHostUrl(req);

    await generateCertificatePDF(res, student, event, certificate, hostUrl);
  } catch (error) {
    console.error('Download certificate error:', error);
    if (!res.headersSent) {
      res.status(500).send('Error generating certificate PDF');
    }
  }
};

exports.verifyCertificate = async (req, res) => {
  try {
    const { verificationCode } = req.params;

    let certificate = await Certificate.findOne({ verificationCode });
    if (!certificate) {
      certificate = await Certificate.findOne({ certificateId: verificationCode });
    }
    if (!certificate) {
      try {
        certificate = await Certificate.findById(verificationCode);
      } catch (e) {
        // Not a valid ObjectId
      }
    }

    if (!certificate) {
      return res.status(404).json({ valid: false, message: 'Certificate verification failed: invalid code' });
    }

    const student = await User.findById(certificate.studentId);
    const event = await Event.findById(certificate.eventId);

    if (!student || !event) {
      return res.status(404).json({ valid: false, message: 'Certificate references missing user/event metadata' });
    }

    res.json({
      valid: true,
      _id: certificate._id,
      certificateId: certificate.certificateId,
      issuedAt: certificate.issuedAt,
      verificationCode: certificate.verificationCode,
      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
        rollNumber: student.profile?.rollNumber,
        department: student.profile?.department
      },
      event: {
        _id: event._id,
        title: event.title,
        date: event.date,
        organizer: event.organizer,
        venue: event.venue,
        certificateTemplate: event.certificateTemplate,
        certificateLayout: event.certificateLayout,
        signatures: event.signatures
      }
    });
  } catch (error) {
    console.error('Verify certificate error:', error);
    res.status(500).json({ message: 'Server error verifying certificate' });
  }
};

exports.getAllCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({});
    
    // Manually join student and event details for DB neutrality
    const populatedCerts = [];
    for (let cert of certificates) {
      const certDoc = cert.toObject ? cert.toObject() : { ...cert };
      
      const student = await User.findById(cert.studentId);
      if (student) {
        certDoc.studentId = {
          _id: student._id,
          name: student.name,
          email: student.email,
          profile: student.profile
        };
      }
      
      const event = await Event.findById(cert.eventId);
      if (event) {
        certDoc.eventId = {
          _id: event._id,
          title: event.title,
          date: event.date,
          organizer: event.organizer
        };
      }
      
      populatedCerts.push(certDoc);
    }
    
    res.json(populatedCerts);
  } catch (error) {
    console.error('Get all certificates error:', error);
    res.status(500).json({ message: 'Server error retrieving certificates' });
  }
};

exports.manualIssueCertificate = async (req, res) => {
  try {
    const { studentId, eventId, customCertificateId } = req.body;

    if (!studentId || !eventId) {
      return res.status(400).json({ message: 'Student ID and Event ID are required' });
    }

    const student = await User.findById(studentId);
    const eventObj = await Event.findById(eventId);

    if (!student || !eventObj) {
      return res.status(404).json({ message: 'Student or Event not found' });
    }

    // Check if certificate already exists
    const existingCert = await Certificate.findOne({ studentId, eventId });
    if (existingCert) {
      return res.status(400).json({ message: 'Certificate has already been issued to this student for this event' });
    }

    let certificateId = customCertificateId;
    if (!certificateId || certificateId.trim() === '') {
      if (eventObj.nextCertificateNumber && eventObj.nextCertificateNumber.trim() !== '') {
        certificateId = eventObj.nextCertificateNumber;
        const nextNum = incrementCertificateNumber(eventObj.nextCertificateNumber);
        await Event.findByIdAndUpdate(eventId, { nextCertificateNumber: nextNum });
      } else {
        const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randCode = Math.random().toString(36).substring(2, 6).toUpperCase();
        certificateId = `CERT-${today}-${randCode}`;
      }
    }

    const verificationCode = Math.random().toString(36).substring(2, 15).toUpperCase();

    const certificate = await Certificate.create({
      certificateId,
      studentId,
      eventId,
      verificationCode,
      issuedAt: new Date().toISOString()
    });

    // Manually construct populated response
    const certDoc = certificate.toObject ? certificate.toObject() : { ...certificate };
    certDoc.studentId = {
      _id: student._id,
      name: student.name,
      email: student.email,
      profile: student.profile
    };
    certDoc.eventId = {
      _id: eventObj._id,
      title: eventObj.title,
      date: eventObj.date,
      organizer: eventObj.organizer
    };

    res.status(201).json(certDoc);
  } catch (error) {
    console.error('Manual issue certificate error:', error);
    res.status(500).json({ message: 'Server error manually issuing certificate' });
  }
};

exports.updateCertificate = async (req, res) => {
  try {
    const { certificateId, issuedAt, studentId, eventId } = req.body;
    const { id } = req.params;

    if (!certificateId) {
      return res.status(400).json({ message: 'Certificate ID is required' });
    }

    const cert = await Certificate.findById(id);
    if (!cert) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    const updateFields = {
      certificateId,
      issuedAt: issuedAt ? new Date(issuedAt).toISOString() : cert.issuedAt
    };
    if (studentId) updateFields.studentId = studentId;
    if (eventId) updateFields.eventId = eventId;

    const updated = await Certificate.findByIdAndUpdate(id, updateFields, { new: true });

    // Manually populate response
    const updatedDoc = updated.toObject ? updated.toObject() : { ...updated };
    const student = await User.findById(updated.studentId);
    if (student) {
      updatedDoc.studentId = {
        _id: student._id,
        name: student.name,
        email: student.email,
        profile: student.profile
      };
    }
    const event = await Event.findById(updated.eventId);
    if (event) {
      updatedDoc.eventId = {
        _id: event._id,
        title: event.title,
        date: event.date,
        organizer: event.organizer
      };
    }

    res.json(updatedDoc);
  } catch (error) {
    console.error('Update certificate error:', error);
    res.status(500).json({ message: 'Server error updating certificate' });
  }
};

exports.deleteCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const cert = await Certificate.findById(id);
    if (!cert) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    await Certificate.findByIdAndDelete(id);
    res.json({ message: 'Certificate successfully revoked/deleted' });
  } catch (error) {
    console.error('Delete certificate error:', error);
    res.status(500).json({ message: 'Server error deleting certificate' });
  }
};

exports.bulkIssueCertificates = async (req, res) => {
  try {
    const { eventId, certificateTemplate, nextCertificateNumber, signatures, certificateLayout } = req.body;

    if (!eventId) {
      return res.status(400).json({ message: 'Event ID is required' });
    }

    const eventObj = await Event.findById(eventId);
    if (!eventObj) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Update event configurations
    const updateData = {};
    if (certificateTemplate !== undefined) updateData.certificateTemplate = certificateTemplate;
    if (nextCertificateNumber !== undefined) updateData.nextCertificateNumber = nextCertificateNumber;
    if (signatures !== undefined) updateData.signatures = signatures;
    if (certificateLayout !== undefined) updateData.certificateLayout = certificateLayout;

    await Event.findByIdAndUpdate(eventId, updateData);

    // Find all registered students whose attendance is marked as 'Present'
    const registrations = await Registration.find({ eventId, status: 'Registered', attendance: 'Present' });

    let issuedCount = 0;
    let currentCertNo = (nextCertificateNumber !== undefined && nextCertificateNumber !== '') ? nextCertificateNumber : eventObj.nextCertificateNumber;

    for (const reg of registrations) {
      // Check if certificate already exists
      const existing = await Certificate.findOne({ studentId: reg.studentId, eventId });
      if (!existing) {
        let certId;
        if (currentCertNo && currentCertNo.trim() !== '') {
          certId = currentCertNo;
          currentCertNo = incrementCertificateNumber(currentCertNo);
        } else {
          const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
          const randCode = Math.random().toString(36).substring(2, 6).toUpperCase();
          certId = `CERT-${today}-${randCode}`;
        }

        const verificationCode = Math.random().toString(36).substring(2, 15).toUpperCase();

        await Certificate.create({
          certificateId: certId,
          studentId: reg.studentId,
          eventId,
          verificationCode,
          issuedAt: new Date().toISOString()
        });

        issuedCount++;
      }
    }

    // Update nextCertificateNumber back to the event for subsequent issues
    if (currentCertNo && currentCertNo !== ((nextCertificateNumber !== undefined && nextCertificateNumber !== '') ? nextCertificateNumber : eventObj.nextCertificateNumber)) {
      await Event.findByIdAndUpdate(eventId, { nextCertificateNumber: currentCertNo });
    }

    res.json({
      message: `Successfully processed event. Issued ${issuedCount} new certificates.`,
      issuedCount
    });
  } catch (error) {
    console.error('Bulk issue certificates error:', error);
    res.status(500).json({ message: 'Server error bulk issuing certificates' });
  }
};
