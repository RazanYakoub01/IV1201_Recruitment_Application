/**
 * Middleware to authenticate JWT tokens and validate user authorization
 * @module middleware/auth
 */

const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token and add user data to request
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
        code: 'NO_TOKEN'
      });
    }

    const token = authHeader.split(' ')[1];
    

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Verifying the token by decoding...");
    
    req.user = {
      personId: decoded.personId,
      role: decoded.role
    };
    console.log("Auth middleware successed.");
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Invalid token.',
      code: 'INVALID_TOKEN'
    });
  }
};

/**
 * Middleware to verify user has recruiter role
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const requireRecruiter = (req, res, next) => {
  // Check if user exists and has role of 1 (recruiter)
  if (!req.user || req.user.role !== 1) {
    console.log('Unauthorized access attempt to recruiter resource:', {
      userId: req.user ? req.user.personId : 'Unknown',
      role: req.user ? req.user.role : 'Unknown',
      path: req.path,
      timestamp: new Date().toISOString()
    });
    
    return res.status(403).json({
      success: false,
      message: 'Access denied. Recruiter privileges required.',
      code: 'NOT_AUTHORIZED'
    });
  }
  
  next();
};

/**
 * Middleware to verify user has applicant role
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const requireApplicant = (req, res, next) => {
  if (!req.user || req.user.role !== 2) {
    console.log('Unauthorized access attempt to applicant resource:', {
      userId: req.user ? req.user.personId : 'Unknown',
      role: req.user ? req.user.role : 'Unknown',
      path: req.path,
      timestamp: new Date().toISOString()
    });
    
    return res.status(403).json({
      success: false,
      message: 'Access denied. Applicant privileges required.',
      code: 'NOT_AUTHORIZED'
    });
  }

  next();
};

/**
 * Middleware to verify a user can only access their own data
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const requireSelfOrRecruiter = (req, res, next) => {
  const userId = parseInt(req.params.userId || req.body.userId);
  
  if (req.user.role === 1) {
    return next();
  }
  
  if (req.user.personId === userId) {
    return next();
  }
  
  return res.status(403).json({
    success: false,
    message: 'Access denied. You can only access your own data.',
    code: 'NOT_AUTHORIZED'
  });
};

module.exports = {
  verifyToken,
  requireRecruiter,
  requireApplicant,
  requireSelfOrRecruiter
};