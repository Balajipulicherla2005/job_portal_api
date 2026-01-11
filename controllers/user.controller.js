const User = require('../models/User.model');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting profile',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields based on role
    if (user.role === 'jobseeker') {
      const { firstName, lastName, phone, skills, experience, education } = req.body;
      
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (phone) user.phone = phone;
      if (skills) user.skills = skills;
      if (experience) user.experience = experience;
      if (education) user.education = education;
      
      // Handle resume upload
      if (req.file && req.file.fieldname === 'resume') {
        user.resume = `/uploads/resumes/${req.file.filename}`;
      }
    } else if (user.role === 'employer') {
      const { companyName, companyDescription, companyWebsite, companySize, industry } = req.body;
      
      if (companyName) user.companyName = companyName;
      if (companyDescription) user.companyDescription = companyDescription;
      if (companyWebsite) user.companyWebsite = companyWebsite;
      if (companySize) user.companySize = companySize;
      if (industry) user.industry = industry;
      
      // Handle company logo upload
      if (req.file && req.file.fieldname === 'companyLogo') {
        user.companyLogo = `/uploads/logos/${req.file.filename}`;
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// @desc    Upload resume
// @route   POST /api/users/upload-resume
// @access  Private (Job Seeker only)
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.resume = `/uploads/resumes/${req.file.filename}`;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully',
      data: {
        resumeUrl: user.resume
      }
    });
  } catch (error) {
    console.error('Upload resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading resume',
      error: error.message
    });
  }
};

// @desc    Upload company logo
// @route   POST /api/users/upload-logo
// @access  Private (Employer only)
const uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.companyLogo = `/uploads/logos/${req.file.filename}`;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Company logo uploaded successfully',
      data: {
        logoUrl: user.companyLogo
      }
    });
  } catch (error) {
    console.error('Upload logo error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading logo',
      error: error.message
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadResume,
  uploadLogo
};
