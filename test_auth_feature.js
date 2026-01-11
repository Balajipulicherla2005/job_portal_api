const axios = require('axios');

const API_URL = 'http://localhost:5001/api';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.yellow}ℹ ${msg}${colors.reset}`)
};

// Test data
const jobSeekerData = {
  email: `jobseeker_${Date.now()}@test.com`,
  password: 'password123',
  role: 'jobseeker',
  firstName: 'John',
  lastName: 'Doe',
  phone: '+1234567890'
};

const employerData = {
  email: `employer_${Date.now()}@test.com`,
  password: 'password123',
  role: 'employer',
  companyName: 'Test Company Inc'
};

async function testAuthentication() {
  console.log('\n=== Testing User Authentication Feature ===\n');

  try {
    // Test 1: Register Job Seeker
    log.info('Test 1: Registering Job Seeker...');
    try {
      const registerResponse = await axios.post(`${API_URL}/auth/register`, jobSeekerData);
      if (registerResponse.data.success && registerResponse.data.data.token) {
        log.success('Job Seeker registered successfully');
        log.info(`User ID: ${registerResponse.data.data.user._id}`);
        log.info(`Email: ${registerResponse.data.data.user.email}`);
        log.info(`Role: ${registerResponse.data.data.user.role}`);
      } else {
        log.error('Job Seeker registration failed');
      }
    } catch (error) {
      log.error(`Job Seeker registration failed: ${error.response?.data?.message || error.message}`);
    }

    // Test 2: Register Employer
    log.info('\nTest 2: Registering Employer...');
    try {
      const registerResponse = await axios.post(`${API_URL}/auth/register`, employerData);
      if (registerResponse.data.success && registerResponse.data.data.token) {
        log.success('Employer registered successfully');
        log.info(`User ID: ${registerResponse.data.data.user._id}`);
        log.info(`Email: ${registerResponse.data.data.user.email}`);
        log.info(`Role: ${registerResponse.data.data.user.role}`);
      } else {
        log.error('Employer registration failed');
      }
    } catch (error) {
      log.error(`Employer registration failed: ${error.response?.data?.message || error.message}`);
    }

    // Test 3: Login with Job Seeker
    log.info('\nTest 3: Logging in as Job Seeker...');
    let jobSeekerToken = null;
    try {
      const loginResponse = await axios.post(`${API_URL}/auth/login`, {
        email: jobSeekerData.email,
        password: jobSeekerData.password
      });
      if (loginResponse.data.success && loginResponse.data.data.token) {
        jobSeekerToken = loginResponse.data.data.token;
        log.success('Job Seeker login successful');
        log.info(`Token: ${jobSeekerToken.substring(0, 20)}...`);
      } else {
        log.error('Job Seeker login failed');
      }
    } catch (error) {
      log.error(`Job Seeker login failed: ${error.response?.data?.message || error.message}`);
    }

    // Test 4: Login with Employer
    log.info('\nTest 4: Logging in as Employer...');
    let employerToken = null;
    try {
      const loginResponse = await axios.post(`${API_URL}/auth/login`, {
        email: employerData.email,
        password: employerData.password
      });
      if (loginResponse.data.success && loginResponse.data.data.token) {
        employerToken = loginResponse.data.data.token;
        log.success('Employer login successful');
        log.info(`Token: ${employerToken.substring(0, 20)}...`);
      } else {
        log.error('Employer login failed');
      }
    } catch (error) {
      log.error(`Employer login failed: ${error.response?.data?.message || error.message}`);
    }

    // Test 5: Get current user (Job Seeker)
    if (jobSeekerToken) {
      log.info('\nTest 5: Getting current user (Job Seeker)...');
      try {
        const meResponse = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${jobSeekerToken}` }
        });
        if (meResponse.data.success) {
          log.success('Retrieved Job Seeker profile');
          log.info(`User: ${meResponse.data.data.firstName} ${meResponse.data.data.lastName}`);
          log.info(`Email: ${meResponse.data.data.email}`);
        } else {
          log.error('Failed to get Job Seeker profile');
        }
      } catch (error) {
        log.error(`Failed to get Job Seeker profile: ${error.response?.data?.message || error.message}`);
      }
    }

    // Test 6: Get current user (Employer)
    if (employerToken) {
      log.info('\nTest 6: Getting current user (Employer)...');
      try {
        const meResponse = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${employerToken}` }
        });
        if (meResponse.data.success) {
          log.success('Retrieved Employer profile');
          log.info(`Company: ${meResponse.data.data.companyName}`);
          log.info(`Email: ${meResponse.data.data.email}`);
        } else {
          log.error('Failed to get Employer profile');
        }
      } catch (error) {
        log.error(`Failed to get Employer profile: ${error.response?.data?.message || error.message}`);
      }
    }

    // Test 7: Invalid login
    log.info('\nTest 7: Testing invalid login...');
    try {
      await axios.post(`${API_URL}/auth/login`, {
        email: jobSeekerData.email,
        password: 'wrongpassword'
      });
      log.error('Invalid login should have failed but succeeded');
    } catch (error) {
      if (error.response?.status === 401) {
        log.success('Invalid login correctly rejected');
      } else {
        log.error(`Invalid login test failed: ${error.response?.data?.message || error.message}`);
      }
    }

    // Test 8: Duplicate registration
    log.info('\nTest 8: Testing duplicate registration...');
    try {
      await axios.post(`${API_URL}/auth/register`, jobSeekerData);
      log.error('Duplicate registration should have failed but succeeded');
    } catch (error) {
      if (error.response?.status === 400) {
        log.success('Duplicate registration correctly rejected');
      } else {
        log.error(`Duplicate registration test failed: ${error.response?.data?.message || error.message}`);
      }
    }

    // Test 9: Password hashing verification
    log.info('\nTest 9: Verifying password is hashed in database...');
    const mongoose = require('mongoose');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/job_portal_db');
    const User = require('./models/User.model');
    const user = await User.findOne({ email: jobSeekerData.email }).select('+password');
    if (user && user.password !== jobSeekerData.password && user.password.startsWith('$2a$')) {
      log.success('Password is properly hashed in database');
    } else {
      log.error('Password is NOT properly hashed');
    }
    await mongoose.disconnect();

    console.log('\n=== Authentication Feature Tests Complete ===\n');

  } catch (error) {
    log.error(`Test suite failed: ${error.message}`);
    console.error(error);
  }
}

testAuthentication();
