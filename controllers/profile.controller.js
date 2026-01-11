const { User, JobSeekerProfile, EmployerProfile } = require('../models');
const { sendSuccess, sendError } = require('../utils/functions');
const { HTTP_STATUS } = require('../config/constants');
const path = require('path');
const fs = require('fs');

/**
 * @route   GET /api/profile
 * @desc    Get user profile
 * @access  Private
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: JobSeekerProfile,
          as: 'jobSeekerProfile',
          required: false
        },
        {
          model: EmployerProfile,
          as: 'employerProfile',
          required: false
        }
      ]
    });

    if (!user) {
      return sendError(res, 'User not found', HTTP_STATUS.NOT_FOUND);
    }

    return sendSuccess(res, { user }, 'Profile retrieved successfully');

  } catch (error) {
    console.error('Get profile error:', error);
    return sendError(res, error.message || 'Failed to get profile', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

/**
 * @route   GET /api/profile/job-seeker
 * @desc    Get job seeker profile
 * @access  Private (Job Seeker only)
 */
exports.getJobSeekerProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      attributes: ['email']
    });

    let profile = await JobSeekerProfile.findOne({ where: { userId } });

    // If profile doesn't exist, create a default one
    if (!profile) {
      profile = await JobSeekerProfile.create({
        userId,
        fullName: user.email.split('@')[0], // Use email username as default name
        phone: '',
        location: '',
        skills: '',
        experience: '',
        education: '',
        bio: ''
      });
    }

    // Map the data to match frontend expectations
    const responseData = {
      name: profile.fullName,
      email: user.email,
      phone: profile.phone || '',
      location: profile.location || '',
      skills: profile.skills || '',
      experience: profile.experience || '',
      education: profile.education || '',
      bio: profile.bio || '',
      resume_url: profile.resumePath ? `${process.env.API_URL || 'http://localhost:5002'}${profile.resumePath}` : null
    };

    return sendSuccess(res, responseData, 'Profile retrieved successfully');

  } catch (error) {
    console.error('Get job seeker profile error:', error);
    return sendError(res, error.message || 'Failed to get profile', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

/**
 * @route   GET /api/profile/employer
 * @desc    Get employer profile
 * @access  Private (Employer only)
 */
exports.getEmployerProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      attributes: ['email']
    });

    let profile = await EmployerProfile.findOne({ where: { userId } });

    // If profile doesn't exist, create a default one
    if (!profile) {
      profile = await EmployerProfile.create({
        userId,
        companyName: 'Company',
        companyWebsite: '',
        companySize: '',
        industry: '',
        location: '',
        phone: '',
        description: ''
      });
    }

    // Map the data to match frontend expectations
    const responseData = {
      name: user.email.split('@')[0], // Use email username as contact name
      email: user.email,
      phone: profile.phone || '',
      company_name: profile.companyName || '',
      company_description: profile.description || '',
      company_website: profile.companyWebsite || '',
      company_location: profile.location || '',
      company_size: profile.companySize || '',
      industry: profile.industry || ''
    };

    return sendSuccess(res, responseData, 'Profile retrieved successfully');

  } catch (error) {
    console.error('Get employer profile error:', error);
    return sendError(res, error.message || 'Failed to get profile', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

/**
 * @route   PUT /api/profile/job-seeker
 * @desc    Update job seeker profile
 * @access  Private (Job Seeker only)
 */
exports.updateJobSeekerProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, location, skills, experience, education, bio } = req.body;

    // Verify user is a job seeker
    const user = await User.findByPk(userId);
    if (!user || user.role !== 'job_seeker') {
      return sendError(res, 'Access denied. Job seeker only', HTTP_STATUS.FORBIDDEN);
    }

    // Find or create profile
    let profile = await JobSeekerProfile.findOne({ where: { userId } });

    const updateData = {
      fullName: name || profile?.fullName || user.email.split('@')[0],
      phone: phone || '',
      location: location || '',
      skills: skills || '',
      experience: experience || '',
      education: education || '',
      bio: bio || ''
    };

    // Handle resume upload
    if (req.file) {
      // Delete old resume if exists
      if (profile && profile.resumePath) {
        const oldResumePath = path.join(__dirname, '..', profile.resumePath);
        if (fs.existsSync(oldResumePath)) {
          fs.unlinkSync(oldResumePath);
        }
      }
      updateData.resumePath = `/uploads/${req.file.filename}`;
    }

    if (profile) {
      await profile.update(updateData);
    } else {
      updateData.userId = userId;
      profile = await JobSeekerProfile.create(updateData);
    }

    // Return mapped data
    const responseData = {
      name: profile.fullName,
      email: user.email,
      phone: profile.phone,
      location: profile.location,
      skills: profile.skills,
      experience: profile.experience,
      education: profile.education,
      bio: profile.bio,
      resume_url: profile.resumePath ? `${process.env.API_URL || 'http://localhost:5002'}${profile.resumePath}` : null
    };

    return sendSuccess(res, responseData, 'Profile updated successfully');

  } catch (error) {
    console.error('Update job seeker profile error:', error);
    return sendError(res, error.message || 'Failed to update profile', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

/**
 * @route   PUT /api/profile/employer
 * @desc    Update employer profile
 * @access  Private (Employer only)
 */
exports.updateEmployerProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { company_name, company_website, company_size, industry, company_location, phone, company_description } = req.body;

    // Verify user is an employer
    const user = await User.findByPk(userId);
    if (!user || user.role !== 'employer') {
      return sendError(res, 'Access denied. Employer only', HTTP_STATUS.FORBIDDEN);
    }

    // Find or create profile
    let profile = await EmployerProfile.findOne({ where: { userId } });

    const updateData = {
      companyName: company_name || profile?.companyName || 'Company',
      companyWebsite: company_website || '',
      companySize: company_size || '',
      industry: industry || '',
      location: company_location || '',
      phone: phone || '',
      description: company_description || ''
    };

    if (profile) {
      await profile.update(updateData);
    } else {
      updateData.userId = userId;
      profile = await EmployerProfile.create(updateData);
    }

    // Return mapped data
    const responseData = {
      name: user.email.split('@')[0],
      email: user.email,
      phone: profile.phone,
      company_name: profile.companyName,
      company_description: profile.description,
      company_website: profile.companyWebsite,
      company_location: profile.location,
      company_size: profile.companySize,
      industry: profile.industry
    };

    return sendSuccess(res, responseData, 'Profile updated successfully');

  } catch (error) {
    console.error('Update employer profile error:', error);
    return sendError(res, error.message || 'Failed to update profile', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

/**
 * @route   DELETE /api/profile/resume
 * @desc    Delete resume
 * @access  Private (Job Seeker only)
 */
exports.deleteResume = async (req, res) => {
  try {
    const userId = req.user.id;

    // Verify user is a job seeker
    const user = await User.findByPk(userId);
    if (!user || user.role !== 'job_seeker') {
      return sendError(res, 'Access denied. Job seeker only', HTTP_STATUS.FORBIDDEN);
    }

    const profile = await JobSeekerProfile.findOne({ where: { userId } });
    if (!profile || !profile.resumePath) {
      return sendError(res, 'No resume found', HTTP_STATUS.NOT_FOUND);
    }

    // Delete file from filesystem
    const resumePath = path.join(__dirname, '..', profile.resumePath);
    if (fs.existsSync(resumePath)) {
      fs.unlinkSync(resumePath);
    }

    // Update profile
    profile.resumePath = null;
    await profile.save();

    return sendSuccess(res, {}, 'Resume deleted successfully');

  } catch (error) {
    console.error('Delete resume error:', error);
    return sendError(res, error.message || 'Failed to delete resume', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

module.exports = exports;
