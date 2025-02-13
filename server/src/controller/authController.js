const bcrypt = require('bcrypt');
const userDAO = require('../integration/UserDAO');

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

module.exports = { login, signup };
