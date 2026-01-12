const { User, Job, Application } = require('../models');
const { Op } = require('sequelize');

// @desc    Get platform statistics
// @route   GET /api/stats
// @access  Public
const getStats = async (req, res) => {
  try {
    // Count total active jobs
    const totalJobs = await Job.count({
      where: { status: 'active' }
    });

    // Count total employers (users with role 'employer')
    const totalEmployers = await User.count({
      where: { role: 'employer' }
    });

    // Count total applications
    const totalApplications = await Application.count();

    res.status(200).json({
      success: true,
      data: {
        totalJobs,
        totalEmployers,
        totalApplications
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};

module.exports = {
  getStats
};
