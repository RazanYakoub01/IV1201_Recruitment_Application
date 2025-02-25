const bcrypt = require('bcrypt');
const userDAO = require('../integration/UserDAO');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');


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
const verifyEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await userDAO.findUserByEmail(email);

    if (!user) {
      console.error('email not found');
      return res.status(404).json({ 
        success: false, 
        message: 'email not found' 
      });
    }

    console.log('email verified:', {
      Email: '***',
      timestamp: new Date().toISOString()
    });

    res.status(200).json({ 
      success: true, 
      message: 'email verified' 
    });
  } catch (err) {
    console.error('Error verifying email:', err);
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
    const { token, username, newPassword } = req.body;

    if (!token || !username || !newPassword) {
      console.error('Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.error('Invalid or expired token');
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    const email = decoded.email; // Get email from token

    // Ensure email exists 
    const user = await userDAO.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if username is already taken (excluding current user)
    const existingUser = await userDAO.findUserByUsername(username);
    if (existingUser && existingUser.email !== email) {
      return res.status(409).json({
        success: false,
        message: 'Username already taken',
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update credentials
    const result = await userDAO.updateUserCredentials(email, username, hashedPassword);

    if (!result) {
      console.error('Failed to update credentials');
      return res.status(500).json({ success: false, message: 'Failed to update credentials' });
    }

    console.log('Credentials updated successfully');
    res.status(200).json({ success: true, message: 'Credentials updated successfully' });

  } catch (err) {
    console.error('Error updating credentials:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


/**
 * Generates and returns an update credentials link via email.
 * 
 * This function checks if a user exists with the provided email.
 * If found, it generates a signed JWT token (valid for 15 minutes),
 * creates a credentials update link, and returns the email content 
 * in the response without actually sending the email.
 *
 * @async
 * @function sendUpdateCredentialsEmail
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body containing user email.
 * @param {string} req.body.email - The email address of the user requesting credential updates.
 * @param {Object} res - The response object.
 * @returns {void} Sends a JSON response with either the email content or an error message.
 */
const sendUpdateCredentialsEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userDAO.findUserByEmail(email);

    if (!user) {
      return res.status(404).json({
        success: false,
        code: 'EMAIL_NOT_FOUND',
        message: 'No account found with this email',
      });
    }

    // Generate a signed JWT token (valid for 15 minutes)
    const token = jwt.sign(
      { personId: user.person_id, email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Create update credentials link
    const updateLink = `${process.env.FRONTEND_URL}/update-credentials?token=${token}`;

    // Prepare the email content
    const emailText = `
    Hello,
    
    We received a request to update your account credentials. To proceed, please click the link below:
    
    🔗 ${updateLink}
    
    For security reasons, this link will expire in 15 minutes. If you did not request this change, please ignore this email. No action is required from you.
    
    If you experience any issues, feel free to contact our support team.
    
    Best regards,  
    HireFlow Support Team
    `;

    /** 
     * Here we add logic to actually send the email 
    */

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"HireFlow Support" <${process.env.EMAIL_USER}>`, 
      to: email,
      subject: 'Update Your Credentials - HireFlow',
      text: emailText, 
      html: `
        <p>Hello,</p>
        <p>We received a request to update your account credentials. To proceed, please click the link below:</p>
        <p><a href="${updateLink}" target="_blank">Update Your Credentials</a></p>
        <p><strong>Note:</strong> This link will expire in 15 minutes. If you did not request this change, please ignore this email. No action is required from you.</p>
        <p>If you experience any issues, feel free to contact our support team.</p>
        <p>Best regards,<br>HireFlow Support Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);


    // Return the email text as part of the response
    res.status(200).json({
      success: true,
      message: 'Update credentials link generated successfully',
      emailText, 
    });

  } catch (err) {
    console.error('Error generating update credentials link:', err);
    res.status(500).json({ success: false, message: 'Failed to generate update link' });
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

module.exports = { login, signup, verifyEmail, updateCredentials, sendUpdateCredentialsEmail };
