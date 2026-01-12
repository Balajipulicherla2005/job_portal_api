const express = require('express');
const router = express.Router();
const { verifyToken, isJobSeeker, isEmployer } = require('../middleware/auth.middleware');
const {
  getJobSeekerDashboard,
  getEmployerDashboard
} = require('../controllers/dashboard.controller');

// Job Seeker dashboard
router.get('/jobseeker', verifyToken, isJobSeeker, getJobSeekerDashboard);

// Employer dashboard
router.get('/employer', verifyToken, isEmployer, getEmployerDashboard);

module.exports = router;
