const express = require('express');
const router = express.Router();
const { verifyToken, isJobSeeker, isEmployer } = require('../middleware/auth.middleware');
const {
  submitApplication,
  getMyApplications,
  getApplicationById,
  getJobApplications,
  updateApplicationStatus,
  withdrawApplication,
  getEmployerApplications
} = require('../controllers/application.controller');

// Job Seeker routes
router.post('/', verifyToken, isJobSeeker, submitApplication);
router.get('/my-applications', verifyToken, isJobSeeker, getMyApplications);
router.delete('/:id', verifyToken, isJobSeeker, withdrawApplication);

// Employer routes
router.get('/employer/all', verifyToken, isEmployer, getEmployerApplications);
router.get('/job/:jobId', verifyToken, isEmployer, getJobApplications);
router.put('/:id/status', verifyToken, isEmployer, updateApplicationStatus);

// Shared routes (both job seeker and employer can view)
router.get('/:id', verifyToken, getApplicationById);

module.exports = router;
