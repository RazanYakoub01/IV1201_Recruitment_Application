/**
 * Load environment variables from .env file
 */
require('dotenv').config();

/**
 * Set up the backend server with necessary modules:
 * Import the express module to create an Express application for the backend server.
 * This server handles the API requests for user authentication and other backend functionalities.
 */
const express = require('express');
const pool = require('./db');
const cors = require("cors");
const authController = require('./controller/authController');

const app = express();

/**
 * Configure middleware
 */
app.use(express.json());

app.use(cors());

/**
 * Database connection check
 */
pool.connect((err, client, done) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Successfully connected to PostgreSQL');
    done();
  }
});

/**
 * Health check route
 */
app.get('/ping', (req, res) => {
  res.send('Server is running');
});

/**
 * Define authentication routes
 */
app.post('/users/login', authController.login);
app.post('/users/signin')



/**
 * Error handling middleware
 */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error' 
  });
});

/**
 * Start the server
 */
const port = process.env.SERVER_PORT;
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = { server };