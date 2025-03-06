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
const applicationController = require('./controller/applicationController'); 
const recruiterController = require('./controller/recruiterController'); 
const { verifyToken, requireApplicant, requireRecruiter} = require('./middleware/auth');

const app = express();

/**
 * Configure middleware
 */
app.use(express.json());

/**
 * Configure CORS with restrictions
 * Only allow specific origins, methods, and headers
 */
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://iv1201-recruitment-application-frontend.onrender.com/']
    : ['http://localhost:3000', 'http://127.0.0.1:3000'], 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400
};

app.use(cors(corsOptions));


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
app.post('/users/signup', authController.signup);
app.post('/users/verify-email', authController.verifyEmail);
app.post('/users/send-update-email', authController.sendUpdateCredentialsEmail);
app.post('/users/update-credentials', authController.updateCredentials);

app.post('/users/refresh-token', verifyToken, authController.refreshToken);
app.get('/competences', verifyToken, applicationController.getCompetences);
app.post('/applications/submit', verifyToken, requireApplicant, applicationController.submitApplication);
app.get('/applications/fetch', verifyToken, requireRecruiter, recruiterController.getApplications);
app.post('/applications/update', verifyToken, requireRecruiter, recruiterController.updateApplication);



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
const port = process.env.SERVER_PORT || 3001;
const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = { server };