let app;
try {
  app = require('../backend/server');
} catch (error) {
  console.error('Error requiring backend server:', error);
  const express = require('express');
  app = express();
  app.use((req, res) => {
    res.status(500).json({
      message: 'Serverless Function Load Error',
      error: error.message || String(error)
    });
  });
}

module.exports = app;

