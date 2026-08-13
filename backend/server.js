const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Database connection
connectDB();

// Import Routes
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const certificateRoutes = require('./routes/certificateRoutes');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/certificates', certificateRoutes);

// Simple Welcome Route
app.get(['/', '/api'], (req, res) => {
  res.json({ message: 'Welcome to the College Event Management API', status: 'online' });
});

// Start Server if called directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Fallback mock database status: ${process.env.USE_MOCK_DB === 'true' ? 'ACTIVE' : 'INACTIVE'}`);
  });
}

module.exports = app;
