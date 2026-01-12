const { Job, User, EmployerProfile } = require('../models');
const { Op } = require('sequelize');
const { createJobSchema, updateJobSchema } = require('../validators/job.validator');

// @desc    Create a new job
// @route   POST /api/jobs
// @access  Private (Employer)
const createJob = async (req, res) => {
  try {
    // Validate request body
    const { error } = createJobSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const {
      title,
      description,
      qualifications,
      responsibilities,
      jobType,
      location,
      salaryMin,
      salaryMax,
      salaryPeriod,
      experienceLevel,
      skills,
      benefits,
      applicationDeadline
    } = req.body;

    const job = await Job.create({
      employerId: req.user.id,
      title,
      description,
      qualifications,
      responsibilities,
      jobType: jobType || 'full-time',
      location,
      salaryMin,
      salaryMax,
      salaryPeriod: salaryPeriod || 'yearly',
      experienceLevel,
      skills: skills || [],
      benefits,
      status: 'active',
      applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null
    });

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: job
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating job',
      error: error.message
    });
  }
};

// @desc    Get all jobs (public)
// @route   GET /api/jobs
// @access  Public
const getAllJobs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status = 'active',
      jobType,
      location,
      experienceLevel,
      search,
      minSalary,
      maxSalary
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Build where clause
    const where = { status };
    
    if (jobType) {
      where.jobType = jobType;
    }
    
    if (location) {
      where.location = { [Op.like]: `%${location}%` };
    }
    
    if (experienceLevel) {
      where.experienceLevel = experienceLevel;
    }
    
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }
    
    // Salary range filters
    if (minSalary) {
      where.salaryMax = { [Op.gte]: parseInt(minSalary) };
    }
    
    if (maxSalary) {
      where.salaryMin = { [Op.lte]: parseInt(maxSalary) };
    }

    const { count, rows } = await Job.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
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
              attributes: ['companyName', 'companyWebsite', 'location', 'industry']
            }
          ]
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get all jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching jobs',
      error: error.message
    });
  }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'employer',
          attributes: ['id', 'email'],
          include: [
            {
              model: EmployerProfile,
              as: 'employerProfile',
              attributes: ['companyName', 'companyWebsite', 'companySize', 'industry', 'location', 'description']
            }
          ]
        }
      ]
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Get job by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching job',
      error: error.message
    });
  }
};

// @desc    Get jobs by employer
// @route   GET /api/jobs/employer/my-jobs
// @access  Private (Employer)
const getEmployerJobs = async (req, res) => {
  try {
    const { status } = req.query;
    
    const where = { employerId: req.user.id };
    if (status) {
      where.status = status;
    }

    const jobs = await Job.findAll({
      where,
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
              attributes: ['companyName']
            }
          ]
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: jobs,
      count: jobs.length
    });
  } catch (error) {
    console.error('Get employer jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching jobs',
      error: error.message
    });
  }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private (Employer)
const updateJob = async (req, res) => {
  try {
    // Validate request body
    const { error } = updateJobSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const job = await Job.findByPk(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user owns the job
    if (job.employerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this job'
      });
    }

    const {
      title,
      description,
      qualifications,
      responsibilities,
      jobType,
      location,
      salaryMin,
      salaryMax,
      salaryPeriod,
      experienceLevel,
      skills,
      benefits,
      status,
      applicationDeadline
    } = req.body;

    await job.update({
      title: title || job.title,
      description: description || job.description,
      qualifications: qualifications !== undefined ? qualifications : job.qualifications,
      responsibilities: responsibilities !== undefined ? responsibilities : job.responsibilities,
      jobType: jobType || job.jobType,
      location: location || job.location,
      salaryMin: salaryMin !== undefined ? salaryMin : job.salaryMin,
      salaryMax: salaryMax !== undefined ? salaryMax : job.salaryMax,
      salaryPeriod: salaryPeriod || job.salaryPeriod,
      experienceLevel: experienceLevel !== undefined ? experienceLevel : job.experienceLevel,
      skills: skills !== undefined ? skills : job.skills,
      benefits: benefits !== undefined ? benefits : job.benefits,
      status: status || job.status,
      applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : job.applicationDeadline
    });

    // Fetch updated job with employer details
    const updatedJob = await Job.findByPk(job.id, {
      include: [
        {
          model: User,
          as: 'employer',
          attributes: ['id', 'email'],
          include: [
            {
              model: EmployerProfile,
              as: 'employerProfile',
              attributes: ['companyName']
            }
          ]
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      data: updatedJob
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating job',
      error: error.message
    });
  }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private (Employer)
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user owns the job
    if (job.employerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this job'
      });
    }

    await job.destroy();

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting job',
      error: error.message
    });
  }
};

module.exports = {
  createJob,
  getAllJobs,
  getJobById,
  getEmployerJobs,
  updateJob,
  deleteJob
};
