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

    // Input validation
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username and password are required' 
      });
    }

    // Find user in database
    const user = await userDAO.findUserByUsername(username);
    
    if (!user || user.password !== password) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // For now, using a simple token
    const token = 'dummy-token';

    res.json({
      success: true,
      message: 'Login successful',
      token,
    });

  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

module.exports = { login };