const express = require('express');
const router = express.Router();
const { 
  getProfile, 
  updateProfile, 
  uploadResume, 
  uploadLogo 
} = require('../controllers/user.controller');
const { verifyToken, isJobSeeker, isEmployer } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// All routes are protected
router.use(verifyToken);

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', upload.single('resume'), updateProfile);
router.put('/profile', upload.single('companyLogo'), updateProfile);

// File upload routes
router.post('/upload-resume', isJobSeeker, upload.single('resume'), uploadResume);
router.post('/upload-logo', isEmployer, upload.single('companyLogo'), uploadLogo);

module.exports = router;
