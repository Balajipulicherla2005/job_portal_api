const express = require('express');
const router = express.Router();
const { verifyToken, isEmployer } = require('../middleware/auth.middleware');
const {
  createJob,
  getAllJobs,
  getJobById,
  getEmployerJobs,
  updateJob,
  deleteJob
} = require('../controllers/job.controller');

// Employer routes (protected) - MUST come before /:id route
router.post('/', verifyToken, isEmployer, createJob);
router.get('/employer/my-jobs', verifyToken, isEmployer, getEmployerJobs);
router.put('/:id', verifyToken, isEmployer, updateJob);
router.delete('/:id', verifyToken, isEmployer, deleteJob);

// Public routes - /:id MUST come after /employer/my-jobs
router.get('/', getAllJobs);
router.get('/:id', getJobById);

module.exports = router;
