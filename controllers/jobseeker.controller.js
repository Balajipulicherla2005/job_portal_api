const { User, JobSeekerProfile } = require('../models');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for resume uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = './uploads/resumes';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF and DOC files are allowed'));
    }
  }
}).single('resume');

// @desc    Get job seeker profile
// @route   GET /api/profile/jobseeker
// @access  Private (Job Seeker)
const getJobSeekerProfile = async (req, res) => {
  try {
    const profile = await JobSeekerProfile.findOne({
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
    console.error('Get job seeker profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
};

// @desc    Update job seeker profile
// @route   PUT /api/profile/jobseeker
// @access  Private (Job Seeker)
const updateJobSeekerProfile = async (req, res) => {
  try {
    const { fullName, phone, location, skills, experience, education, bio } = req.body;

    let profile = await JobSeekerProfile.findOne({
      where: { userId: req.user.id }
    });

    if (!profile) {
      // Create profile if it doesn't exist
      profile = await JobSeekerProfile.create({
        userId: req.user.id,
        fullName: fullName || req.user.email.split('@')[0],
        phone,
        location,
        skills: skills || [],
        experience,
        education,
        bio
      });
    } else {
      // Update existing profile
      await profile.update({
        fullName: fullName || profile.fullName,
        phone: phone || profile.phone,
        location: location || profile.location,
        skills: skills || profile.skills,
        experience: experience || profile.experience,
        education: education || profile.education,
        bio: bio || profile.bio
      });
    }

    // Fetch updated profile
    const updatedProfile = await JobSeekerProfile.findOne({
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
    console.error('Update job seeker profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// @desc    Upload resume
// @route   POST /api/profile/jobseeker/resume
// @access  Private (Job Seeker)
const uploadResume = async (req, res) => {
  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: 'File upload error: ' + err.message
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    try {
      let profile = await JobSeekerProfile.findOne({
        where: { userId: req.user.id }
      });

      if (!profile) {
        // Create profile if it doesn't exist
        profile = await JobSeekerProfile.create({
          userId: req.user.id,
          fullName: req.user.email.split('@')[0],
          resumePath: `/uploads/resumes/${req.file.filename}`
        });
      } else {
        // Delete old resume if exists
        if (profile.resumePath) {
          const oldPath = path.join(__dirname, '..', profile.resumePath);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }

        // Update with new resume
        await profile.update({
          resumePath: `/uploads/resumes/${req.file.filename}`
        });
      }

      res.status(200).json({
        success: true,
        message: 'Resume uploaded successfully',
        data: {
          resumePath: profile.resumePath
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
  });
};

module.exports = {
  getJobSeekerProfile,
  updateJobSeekerProfile,
  uploadResume
};
