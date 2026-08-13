const mongoose = require('mongoose');
const LocalModel = require('./localModel');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  time: { type: String, required: true }, // Format: HH:MM AM/PM - HH:MM AM/PM
  venue: { type: String, required: true },
  category: { type: String, required: true }, // Hackathons, Workshops, Technical, Cultural, Sports, Seminars
  poster: { type: String, default: '' }, // base64 or URL
  organizer: { type: String, required: true },
  maxSeats: { type: Number, default: 100 },
  status: { type: String, enum: ['Draft', 'Published'], default: 'Draft' },
  certificateTemplate: { type: String, default: '' }, // Scanned background image (Base64/URL)
  nextCertificateNumber: { type: String, default: '' }, // Starting serial, e.g. CERT-2026-0001
  signatures: [
    {
      name: { type: String, default: '' },
      title: { type: String, default: '' }, // e.g. HOD, Director
      signatureImage: { type: String, default: '' } // Base64 uploaded scanned signature
    }
  ],
  certificateLayout: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now }
});

const MongooseEvent = mongoose.models.Event || mongoose.model('Event', eventSchema);

class DynamicEvent {
  get model() {
    if (process.env.USE_MOCK_DB === 'true' || !process.env.MONGODB_URI) {
      return new LocalModel('events.json');
    }
    return MongooseEvent;
  }

  async find(query) { return this.model.find(query); }
  async findOne(query) { return this.model.findOne(query); }
  async findById(id) { return this.model.findById(id); }
  async create(doc) { return this.model.create(doc); }
  async findByIdAndUpdate(id, update, options) { return this.model.findByIdAndUpdate(id, update, options); }
  async findByIdAndDelete(id) { return this.model.findByIdAndDelete(id); }
  async deleteOne(query) { return this.model.deleteOne(query); }
  async countDocuments(query) { return this.model.countDocuments(query); }
}

module.exports = new DynamicEvent();
