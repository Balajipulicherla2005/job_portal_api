const { User, Job, Application, JobSeekerProfile, EmployerProfile } = require('../models');
const { Op } = require('sequelize');

// @desc    Get job seeker dashboard statistics
// @route   GET /api/dashboard/jobseeker
// @access  Private (Job Seeker)
const getJobSeekerDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get total applications
    const totalApplications = await Application.count({
      where: { jobSeekerId: userId }
    });

    // Get applications by status
    const applicationsByStatus = await Application.findAll({
      where: { jobSeekerId: userId },
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('status')), 'count']
      ],
      group: ['status']
    });

    const statusCounts = {
      pending: 0,
      reviewing: 0,
      shortlisted: 0,
      rejected: 0,
      accepted: 0
    };

    applicationsByStatus.forEach(item => {
      statusCounts[item.status] = parseInt(item.dataValues.count);
    });

    // Get recent applications (last 5)
    const recentApplications = await Application.findAll({
      where: { jobSeekerId: userId },
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Job,
          as: 'job',
          attributes: ['id', 'title', 'location', 'jobType', 'salaryMin', 'salaryMax'],
          include: [
            {
              model: User,
              as: 'employer',
              attributes: ['id', 'email'],
              include: [
                {
                  model: EmployerProfile,
                  as: 'employerProfile',
                  attributes: ['companyName', 'location']
                }
              ]
            }
          ]
        }
      ]
    });

    // Get profile completion percentage
    const profile = await JobSeekerProfile.findOne({
      where: { userId }
    });

    let profileCompletion = 0;
    if (profile) {
      const fields = ['fullName', 'phone', 'location', 'skills', 'experience', 'education', 'resumePath', 'bio'];
      const completedFields = fields.filter(field => {
        const value = profile[field];
        return value !== null && value !== '' && value !== '[]';
      });
      profileCompletion = Math.round((completedFields.length / fields.length) * 100);
    }

    // Get recommended jobs (active jobs, not applied)
    const appliedJobIds = await Application.findAll({
      where: { jobSeekerId: userId },
      attributes: ['jobId']
    }).then(apps => apps.map(app => app.jobId));

    const recommendedJobs = await Job.findAll({
      where: {
        status: 'active',
        id: { [Op.notIn]: appliedJobIds.length > 0 ? appliedJobIds : [0] }
      },
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'employer',
          attributes: ['id', 'email'],
          include: [
            {
              model: EmployerProfile,
              as: 'employerProfile',
              attributes: ['companyName', 'location']
            }
          ]
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: {
        statistics: {
          totalApplications,
          statusCounts,
          profileCompletion
        },
        recentApplications,
        recommendedJobs
      }
    });
  } catch (error) {
    console.error('Get job seeker dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
};

// @desc    Get employer dashboard statistics
// @route   GET /api/dashboard/employer
// @access  Private (Employer)
const getEmployerDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get total jobs posted
    const totalJobs = await Job.count({
      where: { employerId: userId }
    });

    // Get jobs by status
    const jobsByStatus = await Job.findAll({
      where: { employerId: userId },
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('status')), 'count']
      ],
      group: ['status']
    });

    const jobStatusCounts = {
      active: 0,
      closed: 0,
      draft: 0
    };

    jobsByStatus.forEach(item => {
      jobStatusCounts[item.status] = parseInt(item.dataValues.count);
    });

    // Get all job IDs for this employer
    const jobIds = await Job.findAll({
      where: { employerId: userId },
      attributes: ['id']
    }).then(jobs => jobs.map(job => job.id));

    // Get total applications
    const totalApplications = await Application.count({
      where: { jobId: jobIds.length > 0 ? jobIds : [0] }
    });

    // Get applications by status
    const applicationsByStatus = await Application.findAll({
      where: { jobId: jobIds.length > 0 ? jobIds : [0] },
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('status')), 'count']
      ],
      group: ['status']
    });

    const applicationStatusCounts = {
      pending: 0,
      reviewing: 0,
      shortlisted: 0,
      rejected: 0,
      accepted: 0
    };

    applicationsByStatus.forEach(item => {
      applicationStatusCounts[item.status] = parseInt(item.dataValues.count);
    });

    // Get recent applications (last 5)
    const recentApplications = await Application.findAll({
      where: { jobId: jobIds.length > 0 ? jobIds : [0] },
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Job,
          as: 'job',
          attributes: ['id', 'title', 'location']
        },
        {
          model: User,
          as: 'jobSeeker',
          attributes: ['id', 'email'],
          include: [
            {
              model: JobSeekerProfile,
              as: 'jobSeekerProfile',
              attributes: ['fullName', 'phone', 'location']
            }
          ]
        }
      ]
    });

    // Get recent jobs (last 5)
    const recentJobs = await Job.findAll({
      where: { employerId: userId },
      limit: 5,
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'title', 'location', 'jobType', 'status', 'createdAt']
    });

    // Get profile completion
    const profile = await EmployerProfile.findOne({
      where: { userId }
    });

    let profileCompletion = 0;
    if (profile) {
      const fields = ['companyName', 'companyWebsite', 'companySize', 'industry', 'location', 'phone', 'description'];
      const completedFields = fields.filter(field => {
        const value = profile[field];
        return value !== null && value !== '';
      });
      profileCompletion = Math.round((completedFields.length / fields.length) * 100);
    }

    res.status(200).json({
      success: true,
      data: {
        statistics: {
          totalJobs,
          jobStatusCounts,
          totalApplications,
          applicationStatusCounts,
          profileCompletion
        },
        recentApplications,
        recentJobs
      }
    });
  } catch (error) {
    console.error('Get employer dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
};

module.exports = {
  getJobSeekerDashboard,
  getEmployerDashboard
};
