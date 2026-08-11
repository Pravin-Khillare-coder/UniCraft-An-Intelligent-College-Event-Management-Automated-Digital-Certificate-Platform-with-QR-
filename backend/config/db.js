const mongoose = require('mongoose');

let isConnected = false;
let useMock = false;

const connectDB = async () => {
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB Connected successfully.');
      isConnected = true;
      useMock = false;
      process.env.USE_MOCK_DB = 'false';
    } catch (error) {
      console.error('MongoDB Connection Error:', error.message);
      console.log('Falling back to local JSON File database...');
      useMock = true;
      process.env.USE_MOCK_DB = 'true';
    }
  } else {
    console.log('No MONGODB_URI found in env. Falling back to local JSON File database...');
    useMock = true;
    process.env.USE_MOCK_DB = 'true';
  }
};

module.exports = { connectDB, isConnected: () => isConnected, useMock: () => useMock };
