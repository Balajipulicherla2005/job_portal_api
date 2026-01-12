const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/stats.controller');

// Public routes
router.get('/', getStats);

module.exports = router;
