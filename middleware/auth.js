const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { sendError } = require('../utils/functions');
const { HTTP_STATUS } = require('../config/constants');

/**
 * Protect routes - verify JWT token
 */
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return sendError(res, 'Not authorized, no token provided', HTTP_STATUS.UNAUTHORIZED);
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        return sendError(res, 'User not found', HTTP_STATUS.UNAUTHORIZED);
      }

      if (!user.isActive) {
        return sendError(res, 'Account is deactivated', HTTP_STATUS.UNAUTHORIZED);
      }

      // Attach user to request
      req.user = user;
      next();
    } catch (error) {
      return sendError(res, 'Not authorized, token failed', HTTP_STATUS.UNAUTHORIZED);
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return sendError(res, 'Server error in authentication', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Check user role
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        `User role '${req.user.role}' is not authorized to access this route`,
        HTTP_STATUS.FORBIDDEN
      );
    }
    next();
  };
};

module.exports = exports;
