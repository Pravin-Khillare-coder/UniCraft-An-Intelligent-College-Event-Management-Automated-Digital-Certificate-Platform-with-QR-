const mongoose = require('mongoose');
const LocalModel = require('./localModel');

const registrationSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  status: { type: String, enum: ['Registered', 'Cancelled'], default: 'Registered' },
  attendance: { type: String, enum: ['Present', 'Absent', 'Pending'], default: 'Pending' },
  registeredAt: { type: Date, default: Date.now }
});

const MongooseRegistration = mongoose.models.Registration || mongoose.model('Registration', registrationSchema);

class DynamicRegistration {
  get model() {
    if (process.env.USE_MOCK_DB === 'true') {
      return new LocalModel('registrations.json');
    }
    return MongooseRegistration;
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

module.exports = new DynamicRegistration();
