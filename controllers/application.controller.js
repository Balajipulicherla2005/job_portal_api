const Application = require('../models/Application.model');
const Job = require('../models/Job.model');

// @desc    Apply for a job
// @route   POST /api/applications
// @access  Private (Job Seeker only)
const applyForJob = async (req, res) => {
  try {
    const { jobId, coverLetter } = req.body;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Job ID is required'
      });
    }

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (!job.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This job is no longer accepting applications'
      });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      jobSeeker: req.user._id
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    // Create application
    const applicationData = {
      job: jobId,
      jobSeeker: req.user._id,
      coverLetter,
      resume: req.user.resume // Use profile resume by default
    };

    // If a new resume is uploaded with the application
    if (req.file) {
      applicationData.resume = `/uploads/resumes/${req.file.filename}`;
    }

    const application = await Application.create(applicationData);

    // Increment application count on job
    await Job.findByIdAndUpdate(jobId, {
      $inc: { applicationCount: 1 }
    });

    // Populate the application before sending response
    await application.populate('job', 'title location jobType');

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });
  } catch (error) {
    console.error('Apply for job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting application',
      error: error.message
    });
  }
};

// @desc    Get job seeker's applications
// @route   GET /api/applications/my-applications
// @access  Private (Job Seeker only)
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ jobSeeker: req.user._id })
      .populate('job', 'title location jobType salaryRange createdAt')
      .populate('job.employer', 'companyName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting applications',
      error: error.message
    });
  }
};

// @desc    Get applications for a specific job
// @route   GET /api/applications/job/:jobId
// @access  Private (Employer only - own jobs)
const getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Check if job exists and belongs to employer
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these applications'
      });
    }

    const applications = await Application.find({ job: jobId })
      .populate('jobSeeker', 'firstName lastName email phone resume skills experience education')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting applications',
      error: error.message
    });
  }
};

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private (Employer only)
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
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
        message: 'Invalid status'
      });
    }

    const application = await Application.findById(id).populate('job');
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user is the job owner
    if (application.job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this application'
      });
    }

    application.status = status;
    if (notes) application.notes = notes;
    
    await application.save();

    res.status(200).json({
      success: true,
      message: 'Application status updated successfully',
      data: application
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating application status',
      error: error.message
    });
  }
};

// @desc    Get single application details
// @route   GET /api/applications/:id
// @access  Private
const getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('job', 'title description qualifications responsibilities location jobType salaryRange')
      .populate('jobSeeker', 'firstName lastName email phone resume skills experience education')
      .populate('job.employer', 'companyName companyLogo email');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check authorization
    const isJobSeeker = application.jobSeeker._id.toString() === req.user._id.toString();
    const isEmployer = application.job.employer._id.toString() === req.user._id.toString();

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
    console.error('Get application error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting application',
      error: error.message
    });
  }
};

// @desc    Get all applications for employer's jobs
// @route   GET /api/applications/employer/all
// @access  Private (Employer only)
const getAllEmployerApplications = async (req, res) => {
  try {
    // Get all jobs by employer
    const employerJobs = await Job.find({ employer: req.user._id }).select('_id');
    const jobIds = employerJobs.map(job => job._id);

    // Get all applications for these jobs
    const applications = await Application.find({ job: { $in: jobIds } })
      .populate('job', 'title location jobType')
      .populate('jobSeeker', 'firstName lastName email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('Get all employer applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting applications',
      error: error.message
    });
  }
};

module.exports = {
  applyForJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  getApplicationById,
  getAllEmployerApplications
};
