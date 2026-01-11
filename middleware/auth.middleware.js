const jwt = require('jsonwebtoken');
const { User, JobSeekerProfile, EmployerProfile } = require('../models');

// Verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route. Please login.'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from token
      const user = await User.findByPk(decoded.id, {
        include: [
          { model: JobSeekerProfile, as: 'jobSeekerProfile' },
          { model: EmployerProfile, as: 'employerProfile' }
        ]
      });
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User no longer exists'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User account is deactivated'
        });
      }

      // Attach user to request (without password)
      req.user = user.toJSON();
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error in authentication',
      error: error.message
    });
  }
};

// Check if user is a job seeker
const isJobSeeker = (req, res, next) => {
  if (req.user && (req.user.role === 'jobseeker' || req.user.role === 'job_seeker')) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only job seekers can access this route.'
    });
  }
};

// Check if user is an employer
const isEmployer = (req, res, next) => {
  if (req.user && req.user.role === 'employer') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only employers can access this route.'
    });
  }
};

module.exports = {
  verifyToken,
  isJobSeeker,
  isEmployer
};
