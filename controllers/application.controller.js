const { Application, Job, User, JobSeekerProfile } = require('../models');

// @desc    Submit job application
// @route   POST /api/applications
// @access  Private (Job Seeker)
const submitApplication = async (req, res) => {
  try {
    const { jobId, coverLetter } = req.body;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Job ID is required'
      });
    }

    // Check if job exists
    const job = await Job.findByPk(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if job is still active
    if (job.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This job is no longer accepting applications'
      });
    }

    // Check if deadline has passed
    if (job.applicationDeadline && new Date(job.applicationDeadline) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Application deadline has passed'
      });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      where: {
        jobId,
        jobSeekerId: req.user.id
      }
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    // Create application
    const application = await Application.create({
      jobId,
      jobSeekerId: req.user.id,
      coverLetter: coverLetter || '',
      status: 'pending'
    });

    // Fetch complete application with job and profile details
    const completeApplication = await Application.findByPk(application.id, {
      include: [
        {
          model: Job,
          as: 'job',
          attributes: ['id', 'title', 'location', 'jobType']
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

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: completeApplication
    });
  } catch (error) {
    console.error('Submit application error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting application',
      error: error.message
    });
  }
};

// @desc    Get job seeker's applications
// @route   GET /api/applications/my-applications
// @access  Private (Job Seeker)
const getMyApplications = async (req, res) => {
  try {
    const { status } = req.query;

    const where = { jobSeekerId: req.user.id };
    if (status) {
      where.status = status;
    }

    const applications = await Application.findAll({
      where,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Job,
          as: 'job',
          attributes: ['id', 'title', 'location', 'jobType', 'salaryMin', 'salaryMax', 'salaryPeriod'],
          include: [
            {
              model: User,
              as: 'employer',
              attributes: ['id', 'email'],
              include: [
                {
                  model: require('../models').EmployerProfile,
                  as: 'employerProfile',
                  attributes: ['companyName', 'location']
                }
              ]
            }
          ]
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: applications,
      count: applications.length
    });
  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message
    });
  }
};

// @desc    Get single application by ID
// @route   GET /api/applications/:id
// @access  Private (Job Seeker or Employer who owns the job)
const getApplicationById = async (req, res) => {
  try {
    const application = await Application.findByPk(req.params.id, {
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
                  model: require('../models').EmployerProfile,
                  as: 'employerProfile'
                }
              ]
            }
          ]
        },
        {
          model: User,
          as: 'jobSeeker',
          attributes: ['id', 'email'],
          include: [
            {
              model: JobSeekerProfile,
              as: 'jobSeekerProfile'
            }
          ]
        }
      ]
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check authorization: job seeker who applied or employer who owns the job
    const isJobSeeker = req.user.role === 'jobseeker' && application.jobSeekerId === req.user.id;
    const isEmployer = req.user.role === 'employer' && application.job.employerId === req.user.id;

    if (!isJobSeeker && !isEmployer) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this application'
      });
    }

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('Get application by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching application',
      error: error.message
    });
  }
};

// @desc    Get applications for a specific job
// @route   GET /api/applications/job/:jobId
// @access  Private (Employer who owns the job)
const getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status } = req.query;

    // Check if job exists and user owns it
    const job = await Job.findByPk(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.employerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view applications for this job'
      });
    }

    const where = { jobId };
    if (status) {
      where.status = status;
    }

    const applications = await Application.findAll({
      where,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'jobSeeker',
          attributes: ['id', 'email'],
          include: [
            {
              model: JobSeekerProfile,
              as: 'jobSeekerProfile',
              attributes: ['fullName', 'phone', 'location', 'skills', 'experience', 'resumePath']
            }
          ]
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: applications,
      count: applications.length
    });
  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message
    });
  }
};

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private (Employer who owns the job)
const updateApplicationStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const validStatuses = ['pending', 'reviewing', 'shortlisted', 'rejected', 'accepted'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    const application = await Application.findByPk(req.params.id, {
      include: [
        {
          model: Job,
          as: 'job'
        }
      ]
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user owns the job
    if (application.job.employerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this application'
      });
    }

    await application.update({
      status,
      notes: notes || application.notes
    });

    // Fetch updated application with complete details
    const updatedApplication = await Application.findByPk(application.id, {
      include: [
        {
          model: Job,
          as: 'job',
          attributes: ['id', 'title']
        },
        {
          model: User,
          as: 'jobSeeker',
          attributes: ['id', 'email'],
          include: [
            {
              model: JobSeekerProfile,
              as: 'jobSeekerProfile',
              attributes: ['fullName']
            }
          ]
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Application status updated successfully',
      data: updatedApplication
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating application',
      error: error.message
    });
  }
};

// @desc    Withdraw application
// @route   DELETE /api/applications/:id
// @access  Private (Job Seeker who submitted the application)
const withdrawApplication = async (req, res) => {
  try {
    const application = await Application.findByPk(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user owns the application
    if (application.jobSeekerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to withdraw this application'
      });
    }

    await application.destroy();

    res.status(200).json({
      success: true,
      message: 'Application withdrawn successfully'
    });
  } catch (error) {
    console.error('Withdraw application error:', error);
    res.status(500).json({
      success: false,
      message: 'Error withdrawing application',
      error: error.message
    });
  }
};

// @desc    Get all applications for employer (across all jobs)
// @route   GET /api/applications/employer/all
// @access  Private (Employer)
const getEmployerApplications = async (req, res) => {
  try {
    const { status } = req.query;

    // Get all jobs by this employer
    const jobs = await Job.findAll({
      where: { employerId: req.user.id },
      attributes: ['id']
    });

    const jobIds = jobs.map(job => job.id);

    const where = { jobId: jobIds };
    if (status) {
      where.status = status;
    }

    const applications = await Application.findAll({
      where,
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

    res.status(200).json({
      success: true,
      data: applications,
      count: applications.length
    });
  } catch (error) {
    console.error('Get employer applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message
    });
  }
};

module.exports = {
  submitApplication,
  getMyApplications,
  getApplicationById,
  getJobApplications,
  updateApplicationStatus,
  withdrawApplication,
  getEmployerApplications
};
