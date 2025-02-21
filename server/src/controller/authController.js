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

    // First check if it's a 12-digit number
    const digitOnlyRegex = /^\d{12}$/;
    if (!digitOnlyRegex.test(personNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Personal number must be exactly 12 digits'
      });
    }

    // Format it to yyyyMMdd-XXXX
    const formattedPersonNumber = `${personNumber.slice(0, 8)}-${personNumber.slice(8)}`;

    const user = await userDAO.findUserByPersonNumber(formattedPersonNumber);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Personal number not found' 
      });
    }

    console.log('Person number verified:', {
      personNumber: '***',
      timestamp: new Date().toISOString()
    });

    res.status(200).json({ 
      success: true, 
      message: 'Personal number verified' 
    });
  } catch (err) {
    console.error('Error verifying person number:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
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
    const { personNumber, username, newPassword } = req.body;

    console.log('Processing credential update request:', {
      personNumber: personNumber ? '***' : 'missing',
      username,
      timestamp: new Date().toISOString()
    });

    // Check all required fields
    if (!personNumber || !username || !newPassword) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_FIELDS',
        message: 'All fields are required',
      });
    }

    const digitOnlyRegex = /^\d{12}$/;
    if (!digitOnlyRegex.test(personNumber)) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_PNR',
        message: 'Personal number must be exactly 12 digits'
      });
    }

    const formattedPersonNumber = `${personNumber.slice(0, 8)}-${personNumber.slice(8)}`;

    if (username.length < 3) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_USERNAME',
        message: 'Username must be at least 3 characters long',
      });
    }

    const existingUser = await userDAO.findUserByUsername(username);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        code: 'USERNAME_TAKEN',
        message: 'Username is already taken',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_PASSWORD',
        message: 'Password must be at least 8 characters long',
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const result = await userDAO.updateUserCredentials(formattedPersonNumber, username, hashedPassword);

    if (!result) {
      return res.status(404).json({ 
        success: false, 
        code: 'UPDATE_FAILED',
        message: 'User not found or update failed' 
      });
    }

    console.log('Credentials updated successfully:', {
      username,
      timestamp: new Date().toISOString()
    });

    res.status(200).json({ 
      success: true, 
      message: 'Credentials updated successfully' 
    });

  } catch (err) {
    console.error('Error updating credentials:', err);
    res.status(500).json({ 
      success: false, 
      code: 'SERVER_ERROR',
      message: 'Internal server error' 
    });
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
    console.log('Login attempt received:', {
      username,
      timestamp: new Date().toISOString()
    });

    if (!username?.trim() || !password?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required',
        code: 'MISSING_CREDENTIALS'
      });
    }

    const user = await userDAO.findUserByUsername(username);

    if (!user) {
      console.log('Login failed: User not found:', { username });
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    if (!isPasswordHashed(user.password)) {
      console.error('Security issue: Unhashed password:', { username });
      return res.status(500).json({
        success: false,
        message: 'Security error. Please contact support.',
        code: 'SECURITY_ERROR'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Login failed: Invalid password:', { username });
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    console.log('Login successful:', {
      username,
      userId: user.person_id,
      timestamp: new Date().toISOString()
    });

    const token = 'dummy-token';

    res.json({
      success: true,
      message: 'Login successful',
      token: 'dummy-token',
      user: {
        username: user.username,
        person_id: user.person_id,
        role: user.role_id,
        application_status: user.status,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      code: 'SERVER_ERROR'
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

    const validationErrors = [];
    
    if (!firstName?.trim()) validationErrors.push('First name is required');
    if (!lastName?.trim()) validationErrors.push('Last name is required');
    if (!email?.trim()) validationErrors.push('Email is required');
    if (!personNumber?.trim()) validationErrors.push('Person number is required');
    if (!username?.trim()) validationErrors.push('Username is required');
    if (!password?.trim()) validationErrors.push('Password is required');

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_FIELDS',
        message: 'All fields are required',
        errors: validationErrors
      });
    }

    const [existingUsername] = await Promise.all([
      userDAO.findUserByUsername(username)
    ]);


    if (existingUsername) {
      return res.status(409).json({
        success: false,
        code: 'USERNAME_TAKEN',
        message: 'Username is already taken'
      });
    }

    const formattedPersonNumber = `${personNumber.slice(0, 8)}-${personNumber.slice(8)}`;

    const newUser = await userDAO.createUser({
      firstName,
      lastName,
      email,
      personNumber: formattedPersonNumber,
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

    if (err.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Username or email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal Server Error. Registration failed. Please try again later.',
    });
  }
};

module.exports = { login, signup, verifyPersonNumber, updateCredentials };
