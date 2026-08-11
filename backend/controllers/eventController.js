const Event = require('../models/Event');

exports.getEvents = async (req, res) => {
  try {
    const { category, search, status } = req.query;
    let events = await Event.find({});

    // Filter in-memory to guarantee consistent behavior across MongoDB & MockDB fallback
    if (category && category !== 'All Categories' && category !== 'All') {
      events = events.filter(e => e.category.toLowerCase() === category.toLowerCase());
    }
    
    if (search) {
      const term = search.toLowerCase();
      events = events.filter(e => 
        e.title.toLowerCase().includes(term) || 
        e.description.toLowerCase().includes(term) ||
        e.venue.toLowerCase().includes(term) ||
        e.organizer.toLowerCase().includes(term)
      );
    }

    if (status) {
      events = events.filter(e => e.status.toLowerCase() === status.toLowerCase());
    }

    // Sort by date (upcoming events first)
    events.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json(events);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error retrieving events' });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    console.error('Get event details error:', error);
    res.status(500).json({ message: 'Server error retrieving event details' });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, time, venue, category, poster, organizer, maxSeats, status, certificateTemplate, nextCertificateNumber, signatures, certificateLayout } = req.body;

    if (!title || !description || !date || !time || !venue || !category || !organizer) {
      return res.status(400).json({ message: 'Please provide all required event fields' });
    }

    const event = await Event.create({
      title,
      description,
      date,
      time,
      venue,
      category,
      poster: poster || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80',
      organizer,
      maxSeats: Number(maxSeats) || 100,
      status: status || 'Draft',
      certificateTemplate: certificateTemplate || '',
      nextCertificateNumber: nextCertificateNumber || '',
      signatures: signatures || [],
      certificateLayout: certificateLayout || {}
    });

    res.status(201).json(event);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error creating event' });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const { title, description, date, time, venue, category, poster, organizer, maxSeats, status, certificateTemplate, nextCertificateNumber, signatures, certificateLayout } = req.body;

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const updated = await Event.findByIdAndUpdate(req.params.id, {
      title,
      description,
      date,
      time,
      venue,
      category,
      poster,
      organizer,
      maxSeats: Number(maxSeats),
      status,
      certificateTemplate,
      nextCertificateNumber,
      signatures,
      certificateLayout
    }, { new: true });

    res.json(updated);
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server error updating event' });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error deleting event' });
  }
};
