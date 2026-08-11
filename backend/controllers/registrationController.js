const Registration = require('../models/Registration');
const Event = require('../models/Event');
const User = require('../models/User');

exports.registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.body;
    const studentId = req.user.id;

    if (!eventId) {
      return res.status(400).json({ message: 'Event ID is required' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.status !== 'Published') {
      return res.status(400).json({ message: 'Cannot register for an unpublished event' });
    }

    // Check if already registered
    const existingReg = await Registration.findOne({ studentId, eventId, status: 'Registered' });
    if (existingReg) {
      return res.status(400).json({ message: 'You are already registered for this event' });
    }

    // Check seat capacity
    const activeRegCount = await Registration.countDocuments({ eventId, status: 'Registered' });
    if (activeRegCount >= event.maxSeats) {
      return res.status(400).json({ message: 'Event is fully booked' });
    }

    const registration = await Registration.create({
      studentId,
      eventId,
      status: 'Registered',
      attendance: 'Pending'
    });

    res.status(201).json(registration);
  } catch (error) {
    console.error('Register event error:', error);
    res.status(500).json({ message: 'Server error during event registration' });
  }
};

exports.getMyRegistrations = async (req, res) => {
  try {
    const studentId = req.user.id;
    const registrations = await Registration.find({ studentId, status: 'Registered' });

    // Manually populate event details to ensure dual-mode DB compatibility
    const populatedRegs = [];
    for (let reg of registrations) {
      // Handle Mongoose vs JSON database structure
      const regDoc = reg.toObject ? reg.toObject() : { ...reg };
      const event = await Event.findById(reg.eventId);
      regDoc.eventId = event;
      populatedRegs.push(regDoc);
    }

    res.json(populatedRegs);
  } catch (error) {
    console.error('Get my registrations error:', error);
    res.status(500).json({ message: 'Server error fetching registrations' });
  }
};

exports.getEventRegistrations = async (req, res) => {
  try {
    const { eventId } = req.params;
    const registrations = await Registration.find({ eventId });

    // Manually populate student details
    const populatedRegs = [];
    for (let reg of registrations) {
      const regDoc = reg.toObject ? reg.toObject() : { ...reg };
      const student = await User.findById(reg.studentId);
      
      if (student) {
        regDoc.studentId = {
          _id: student._id,
          name: student.name,
          email: student.email,
          profile: student.profile
        };
      }
      populatedRegs.push(regDoc);
    }

    res.json(populatedRegs);
  } catch (error) {
    console.error('Get event registrations error:', error);
    res.status(500).json({ message: 'Server error fetching event registrations' });
  }
};

exports.updateAttendance = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const { attendance } = req.body; // Present, Absent, Pending

    if (!['Present', 'Absent', 'Pending'].includes(attendance)) {
      return res.status(400).json({ message: 'Invalid attendance status' });
    }

    const reg = await Registration.findById(registrationId);
    if (!reg) {
      return res.status(404).json({ message: 'Registration record not found' });
    }

    const updatedReg = await Registration.findByIdAndUpdate(registrationId, { attendance }, { new: true });
    
    // Add default user details mapping for client convenience
    const student = await User.findById(updatedReg.studentId);
    const regDoc = updatedReg.toObject ? updatedReg.toObject() : { ...updatedReg };
    if (student) {
      regDoc.studentId = {
        _id: student._id,
        name: student.name,
        email: student.email,
        profile: student.profile
      };
    }

    res.json(regDoc);
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({ message: 'Server error updating attendance record' });
  }
};
