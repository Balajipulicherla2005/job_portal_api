const express = require('express');
const router = express.Router();
const { 
  applyForJob, 
  getMyApplications, 
  getJobApplications, 
  updateApplicationStatus,
  getApplicationById,
  getAllEmployerApplications
} = require('../controllers/application.controller');
const { verifyToken, isJobSeeker, isEmployer } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// All routes are protected
router.use(verifyToken);

// Job seeker routes
router.post('/', isJobSeeker, upload.single('resume'), applyForJob);
router.get('/my-applications', isJobSeeker, getMyApplications);

// Employer routes
router.get('/job/:jobId', isEmployer, getJobApplications);
router.put('/:id/status', isEmployer, updateApplicationStatus);
router.get('/employer/all', isEmployer, getAllEmployerApplications);

// Shared route
router.get('/:id', getApplicationById);

module.exports = router;
