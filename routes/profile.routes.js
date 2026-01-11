const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');
const { protect, authorize } = require('../middleware/auth');
const { uploadResume, handleMulterError } = require('../middleware/upload');

// General profile route
router.get('/', protect, profileController.getProfile);

// Job Seeker routes
router.get(
  '/job-seeker',
  protect,
  authorize('job_seeker'),
  profileController.getJobSeekerProfile
);

router.put(
  '/job-seeker',
  protect,
  authorize('job_seeker'),
  uploadResume,
  handleMulterError,
  profileController.updateJobSeekerProfile
);

// Employer routes
router.get(
  '/employer',
  protect,
  authorize('employer'),
  profileController.getEmployerProfile
);

router.put(
  '/employer',
  protect,
  authorize('employer'),
  profileController.updateEmployerProfile
);

// Resume management
router.delete(
  '/resume',
  protect,
  authorize('job_seeker'),
  profileController.deleteResume
);

module.exports = router;
