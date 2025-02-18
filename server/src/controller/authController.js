const bcrypt = require('bcrypt');
const userDAO = require('../integration/UserDAO');

/**
 * Validates if a password is properly hashed
 * @param {string} password - The password to check
 * @returns {boolean} - Whether the password is hashed
 */
const isPasswordHashed = (password) => {
  return password && (password.startsWith('$2a$') || password.startsWith('$2b$'));
};


/**
 * Verifies if the provided personal number exists in the system.
 * 
 * This function checks if the personal number is valid (only contains digits) and if it exists
 * in the database. If the person number is invalid or not found, it returns an appropriate error message.
 * 
 * @param {Object} req - The request object containing the body with the personal number.
 * @param {Object} res - The response object used to send a response back to the client.
 * @returns {void} Sends a response indicating whether the verification succeeded or failed.
 */
const verifyPersonNumber = async (req, res) => {
  try {
    const { personNumber } = req.body;

    const pnrRegex = /^\d{8}-\d{4}$/; 
    if (!pnrRegex.test(personNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Personal number must be in the format yyyyMMdd-xxxx.',
      });
    }

    const user = await userDAO.findUserByPersonNumber(personNumber);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Personal number not found' });
    }

    res.status(200).json({ success: true, message: 'Personal number verified' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


/**
 * Updates the credentials (username and password) for a user based on their personal number.
 * 
 * This function ensures that the personal number is valid, checks if the new username is available,
 * and then updates the user's credentials (username and password). Password is hashed before storing.
 * 
 * @param {Object} req - The request object containing the body with the personal number, new username, and new password.
 * @param {Object} res - The response object used to send a response back to the client.
 * @returns {void} Sends a response indicating whether the update succeeded or failed.
 */
const updateCredentials = async (req, res) => {
  try {
    const { personNumber, userName, newPassword } = req.body;

    const pnrRegex = /^\d{8}-\d{4}$/; 
    if (!pnrRegex.test(personNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Personal number must be in the format yyyyMMdd-xxxx.',
      });
    }

    const existingUser = await userDAO.findUserByUsername(userName);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Username is already taken',
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const result = await userDAO.updateUserCredentials(personNumber, userName, hashedPassword);
    if (!result) {
      return res.status(400).json({ success: false, message: 'Failed to update credentials' });
    }

    res.status(200).json({ success: true, message: 'Credentials updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


/**
 * Handles user login authentication and token generation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(`Received login attempt from ${username}`);

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required',
      });
    }

    const user = await userDAO.findUserByUsername(username);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    if (!isPasswordHashed(user.password)) {
      console.error(`User ${username} has unhashed password - this should not happen`);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const token = 'dummy-token';

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        username: user.username,
        person_id: user.person_id,
        role: user.role_id,
        application_status: user.status,
      },
    });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};


/**
 * Handles user sign-up by creating a new user in the database
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, personNumber, username, password } = req.body;

    if (!firstName || !lastName || !email || !personNumber || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format. Please enter a valid email.',
      });
    }

    const pnrRegex = /^\d+$/;
    if (!pnrRegex.test(personNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Personal number must contain only numbers.',
      });
    }

    const existingUser = await userDAO.findUserByUsername(username);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Username is already taken',
      });
    }

    const newUser = await userDAO.createUser({
      firstName,
      lastName,
      email,
      personNumber,
      username,
      password,
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      userId: newUser.person_id,
    });
  } catch (err) {
    console.error('Error during sign-up:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

module.exports = { login, signup, verifyPersonNumber, updateCredentials };