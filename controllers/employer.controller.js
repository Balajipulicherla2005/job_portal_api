const { User, EmployerProfile } = require('../models');

// @desc    Get employer profile
// @route   GET /api/profile/employer
// @access  Private (Employer)
const getEmployerProfile = async (req, res) => {
  try {
    const profile = await EmployerProfile.findOne({
      where: { userId: req.user.id },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'role', 'isActive']
      }]
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Get employer profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
};

// @desc    Update employer profile
// @route   PUT /api/profile/employer
// @access  Private (Employer)
const updateEmployerProfile = async (req, res) => {
  try {
    const {
      companyName,
      companyWebsite,
      companySize,
      industry,
      location,
      phone,
      description
    } = req.body;

    let profile = await EmployerProfile.findOne({
      where: { userId: req.user.id }
    });

    if (!profile) {
      // Create profile if it doesn't exist
      profile = await EmployerProfile.create({
        userId: req.user.id,
        companyName: companyName || req.user.email.split('@')[0],
        companyWebsite,
        companySize,
        industry,
        location,
        phone,
        description
      });
    } else {
      // Update existing profile
      await profile.update({
        companyName: companyName || profile.companyName,
        companyWebsite: companyWebsite || profile.companyWebsite,
        companySize: companySize || profile.companySize,
        industry: industry || profile.industry,
        location: location || profile.location,
        phone: phone || profile.phone,
        description: description || profile.description
      });
    }

    // Fetch updated profile
    const updatedProfile = await EmployerProfile.findOne({
      where: { userId: req.user.id },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'role']
      }]
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedProfile
    });
  } catch (error) {
    console.error('Update employer profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

module.exports = {
  getEmployerProfile,
  updateEmployerProfile
};
