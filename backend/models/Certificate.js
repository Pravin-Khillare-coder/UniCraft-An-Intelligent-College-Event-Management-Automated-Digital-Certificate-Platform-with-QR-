const mongoose = require('mongoose');
const LocalModel = require('./localModel');

const certificateSchema = new mongoose.Schema({
  certificateId: { type: String, required: true, unique: true }, // e.g. CERT-20260617-A3F1
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  issuedAt: { type: Date, default: Date.now },
  verificationCode: { type: String, required: true, unique: true }
});

const MongooseCertificate = mongoose.models.Certificate || mongoose.model('Certificate', certificateSchema);

class DynamicCertificate {
  get model() {
    if (process.env.USE_MOCK_DB === 'true' || !process.env.MONGODB_URI) {
      return new LocalModel('certificates.json');
    }
    return MongooseCertificate;
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

module.exports = new DynamicCertificate();
