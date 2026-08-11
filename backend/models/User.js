const mongoose = require('mongoose');
const LocalModel = require('./localModel');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  googleId: { type: String },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  profile: {
    department: { type: String, default: '' },
    rollNumber: { type: String, default: '' },
    phone: { type: String, default: '' },
    avatar: { type: String, default: '' }
  },
  badges: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

const MongooseUser = mongoose.models.User || mongoose.model('User', userSchema);

class DynamicUser {
  get model() {
    if (process.env.USE_MOCK_DB === 'true') {
      return new LocalModel('users.json');
    }
    return MongooseUser;
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

module.exports = new DynamicUser();
