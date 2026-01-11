const express = require('express');
const router = express.Router();
const { 
  createJob, 
  getAllJobs, 
  getJobById, 
  updateJob, 
  deleteJob,
  getMyJobs 
} = require('../controllers/job.controller');
const { verifyToken, isEmployer } = require('../middleware/auth.middleware');

// Public routes
router.get('/', getAllJobs);
router.get('/:id', getJobById);

// Protected routes - Employer only
router.post('/', verifyToken, isEmployer, createJob);
router.put('/:id', verifyToken, isEmployer, updateJob);
router.delete('/:id', verifyToken, isEmployer, deleteJob);
router.get('/employer/my-jobs', verifyToken, isEmployer, getMyJobs);

module.exports = router;
