const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { protect, authorize } = require('../middleware/auth');

// Protected routes
router.get(
  '/job-seeker',
  protect,
  authorize('job_seeker'),
  dashboardController.getJobSeekerDashboard
);

router.get(
  '/employer',
  protect,
  authorize('employer'),
  dashboardController.getEmployerDashboard
);

module.exports = router;
