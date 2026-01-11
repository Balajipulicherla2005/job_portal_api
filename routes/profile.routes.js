const express = require('express');
const router = express.Router();
const { verifyToken, isJobSeeker, isEmployer } = require('../middleware/auth.middleware');
const {
  getJobSeekerProfile,
  updateJobSeekerProfile,
  uploadResume
} = require('../controllers/jobseeker.controller');
const {
  getEmployerProfile,
  updateEmployerProfile
} = require('../controllers/employer.controller');

// Job Seeker routes
router.get('/jobseeker', verifyToken, isJobSeeker, getJobSeekerProfile);
router.put('/jobseeker', verifyToken, isJobSeeker, updateJobSeekerProfile);
router.post('/jobseeker/resume', verifyToken, isJobSeeker, uploadResume);

// Employer routes
router.get('/employer', verifyToken, isEmployer, getEmployerProfile);
router.put('/employer', verifyToken, isEmployer, updateEmployerProfile);

module.exports = router;
