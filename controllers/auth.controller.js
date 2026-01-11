const jwt = require('jsonwebtoken');
const { User, JobSeekerProfile, EmployerProfile } = require('../models');
const { registerSchema, loginSchema } = require('../validators/auth.validator');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    // Validate request body
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { email, password, role, firstName, lastName, phone, companyName, companyDescription } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user
    const userData = {
      email,
      password,
      role: role || 'job_seeker' // Default to job_seeker if not provided
    };

    const user = await User.create(userData);

    // Create profile based on role
    if (role === 'job_seeker' || role === 'jobseeker') {
      // Create job seeker profile
      const fullName = firstName && lastName ? `${firstName} ${lastName}` : '';
      await JobSeekerProfile.create({
        userId: user.id,
        fullName: fullName || email.split('@')[0], // Use email username as fallback
        phone: phone || null
      });
    } else if (role === 'employer') {
      // Create employer profile
      await EmployerProfile.create({
        userId: user.id,
        companyName: companyName || email.split('@')[0], // Use email username as fallback
        description: companyDescription || null,
        phone: phone || null
      });
    }

    // Fetch user with profile
    const userWithProfile = await User.findByPk(user.id, {
      include: [
        { model: JobSeekerProfile, as: 'jobSeekerProfile' },
        { model: EmployerProfile, as: 'employerProfile' }
      ]
    });

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userWithProfile,
        token
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    // Validate request body
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ 
      where: { email },
      include: [
        { model: JobSeekerProfile, as: 'jobSeekerProfile' },
        { model: EmployerProfile, as: 'employerProfile' }
      ]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user.id);

    // Remove password from response
    const userJSON = user.toJSON();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userJSON,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        { model: JobSeekerProfile, as: 'jobSeekerProfile' },
        { model: EmployerProfile, as: 'employerProfile' }
      ]
    });
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting user data',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getMe
};
