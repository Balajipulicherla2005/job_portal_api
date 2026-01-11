const { User, Job, Application, JobSeekerProfile, EmployerProfile } = require('../models');
const { sendSuccess, sendError } = require('../utils/functions');
const { HTTP_STATUS } = require('../config/constants');
const { Op } = require('sequelize');

/**
 * @route   GET /api/dashboard/job-seeker
 * @desc    Get job seeker dashboard data
 * @access  Private (Job Seeker only)
 */
exports.getJobSeekerDashboard = async (req, res) => {
  try {
    const jobSeekerId = req.user.id;

    // Verify user is a job seeker
    const user = await User.findByPk(jobSeekerId);
    if (!user || user.role !== 'job_seeker') {
      return sendError(res, 'Access denied. Job seeker only', HTTP_STATUS.FORBIDDEN);
    }

    // Get profile completion status
    const profile = await JobSeekerProfile.findOne({ where: { userId: jobSeekerId } });
    const profileComplete = profile && profile.fullName && profile.phone && profile.resumePath;

    // Get application statistics
    const totalApplications = await Application.count({ where: { jobSeekerId } });
    
    const pendingApplications = await Application.count({
      where: { jobSeekerId, status: 'pending' }
    });

    const reviewedApplications = await Application.count({
      where: { jobSeekerId, status: 'reviewed' }
    });

    const shortlistedApplications = await Application.count({
      where: { jobSeekerId, status: 'shortlisted' }
    });

    const acceptedApplications = await Application.count({
      where: { jobSeekerId, status: 'accepted' }
    });

    const rejectedApplications = await Application.count({
      where: { jobSeekerId, status: 'rejected' }
    });

    // Get recent applications
    const recentApplications = await Application.findAll({
      where: { jobSeekerId },
      include: [
        {
          model: Job,
          as: 'job',
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
      ],
      order: [['appliedAt', 'DESC']],
      limit: 5
    });

    // Get recommended jobs (active jobs, not applied)
    const appliedJobIds = await Application.findAll({
      where: { jobSeekerId },
      attributes: ['jobId']
    }).then(apps => apps.map(app => app.jobId));

    const recommendedJobs = await Job.findAll({
      where: {
        status: 'active',
        id: { [Op.notIn]: appliedJobIds.length > 0 ? appliedJobIds : [0] }
      },
      include: [
        {
          model: User,
          as: 'employer',
          attributes: ['id', 'email'],
          include: [
            {
              model: EmployerProfile,
              as: 'employerProfile',
              attributes: ['companyName', 'location', 'industry']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 6
    });

    const dashboardData = {
      profile: {
        complete: profileComplete,
        data: profile
      },
      statistics: {
        totalApplications,
        pendingApplications,
        reviewedApplications,
        shortlistedApplications,
        acceptedApplications,
        rejectedApplications
      },
      recentApplications,
      recommendedJobs
    };

    return sendSuccess(res, dashboardData, 'Dashboard data retrieved successfully');

  } catch (error) {
    console.error('Get job seeker dashboard error:', error);
    return sendError(res, error.message || 'Failed to get dashboard data', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

/**
 * @route   GET /api/dashboard/employer
 * @desc    Get employer dashboard data
 * @access  Private (Employer only)
 */
exports.getEmployerDashboard = async (req, res) => {
  try {
    const employerId = req.user.id;

    // Verify user is an employer
    const user = await User.findByPk(employerId);
    if (!user || user.role !== 'employer') {
      return sendError(res, 'Access denied. Employer only', HTTP_STATUS.FORBIDDEN);
    }

    // Get profile completion status
    const profile = await EmployerProfile.findOne({ where: { userId: employerId } });
    const profileComplete = profile && profile.companyName && profile.phone && profile.location;

    // Get job statistics
    const totalJobs = await Job.count({ where: { employerId } });
    
    const activeJobs = await Job.count({
      where: { employerId, status: 'active' }
    });

    const closedJobs = await Job.count({
      where: { employerId, status: 'closed' }
    });

    const draftJobs = await Job.count({
      where: { employerId, status: 'draft' }
    });

    // Get application statistics
    const jobs = await Job.findAll({
      where: { employerId },
      attributes: ['id']
    });
    const jobIds = jobs.map(job => job.id);

    const totalApplications = await Application.count({
      where: { jobId: { [Op.in]: jobIds.length > 0 ? jobIds : [0] } }
    });

    const pendingApplications = await Application.count({
      where: {
        jobId: { [Op.in]: jobIds.length > 0 ? jobIds : [0] },
        status: 'pending'
      }
    });

    const reviewedApplications = await Application.count({
      where: {
        jobId: { [Op.in]: jobIds.length > 0 ? jobIds : [0] },
        status: 'reviewed'
      }
    });

    const shortlistedApplications = await Application.count({
      where: {
        jobId: { [Op.in]: jobIds.length > 0 ? jobIds : [0] },
        status: 'shortlisted'
      }
    });

    // Get recent jobs
    const recentJobs = await Job.findAll({
      where: { employerId },
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    // Get jobs with application counts
    const jobsWithApplications = await Promise.all(
      recentJobs.map(async (job) => {
        const applicationCount = await Application.count({ where: { jobId: job.id } });
        return {
          ...job.toJSON(),
          applicationCount
        };
      })
    );

    // Get recent applications
    const recentApplications = await Application.findAll({
      where: { jobId: { [Op.in]: jobIds.length > 0 ? jobIds : [0] } },
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
      ],
      order: [['appliedAt', 'DESC']],
      limit: 10
    });

    const dashboardData = {
      profile: {
        complete: profileComplete,
        data: profile
      },
      statistics: {
        jobs: {
          total: totalJobs,
          active: activeJobs,
          closed: closedJobs,
          draft: draftJobs
        },
        applications: {
          total: totalApplications,
          pending: pendingApplications,
          reviewed: reviewedApplications,
          shortlisted: shortlistedApplications
        }
      },
      recentJobs: jobsWithApplications,
      recentApplications
    };

    return sendSuccess(res, dashboardData, 'Dashboard data retrieved successfully');

  } catch (error) {
    console.error('Get employer dashboard error:', error);
    return sendError(res, error.message || 'Failed to get dashboard data', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

module.exports = exports;
