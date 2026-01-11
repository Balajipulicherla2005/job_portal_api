#!/usr/bin/env node

const axios = require('axios');
const { spawn } = require('child_process');

const API_URL = 'http://localhost:5001/api';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

const log = {
  header: (text) => console.log(`\n${colors.bold}${colors.cyan}${'='.repeat(70)}${colors.reset}\n${colors.bold}${text}${colors.reset}\n${colors.cyan}${'='.repeat(70)}${colors.reset}`),
  success: (text) => console.log(`${colors.green}✓ ${text}${colors.reset}`),
  error: (text) => console.log(`${colors.red}✗ ${text}${colors.reset}`),
  info: (text) => console.log(`${colors.blue}ℹ ${text}${colors.reset}`),
  warning: (text) => console.log(`${colors.yellow}⚠ ${text}${colors.reset}`)
};

// Test data
const testData = {
  jobSeeker: {
    email: `seeker${Date.now()}@test.com`,
    password: 'Test@123456'
  },
  employer: {
    email: `employer${Date.now()}@test.com`,
    password: 'Test@123456'
  }
};

let tokens = {};
let jobId = null;
let applicationId = null;

// Helper function to make API calls
async function apiCall(method, endpoint, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${API_URL}${endpoint}`,
      headers: {}
    };
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
}

// Wait for server to be ready
async function waitForServer(maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await axios.get(`${API_URL}/health`);
      log.success('Server is ready!');
      return true;
    } catch (error) {
      if (i === 0) {
        log.info('Waiting for server to start...');
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  log.error('Server failed to start within timeout period');
  return false;
}

// Test functions
async function testHealthCheck() {
  log.header('1. HEALTH CHECK TEST');
  const result = await apiCall('GET', '/health');
  if (result.success) {
    log.success('Health check passed');
    return true;
  } else {
    log.error('Health check failed: ' + result.error);
    return false;
  }
}

async function testJobSeekerRegistration() {
  log.header('2. JOB SEEKER REGISTRATION TEST');
  const result = await apiCall('POST', '/auth/register', {
    email: testData.jobSeeker.email,
    password: testData.jobSeeker.password,
    role: 'job_seeker'
  });
  
  if (result.success && result.data.token) {
    tokens.jobSeeker = result.data.token;
    log.success(`Job seeker registered: ${testData.jobSeeker.email}`);
    return true;
  } else {
    log.error('Job seeker registration failed: ' + result.error);
    return false;
  }
}

async function testEmployerRegistration() {
  log.header('3. EMPLOYER REGISTRATION TEST');
  const result = await apiCall('POST', '/auth/register', {
    email: testData.employer.email,
    password: testData.employer.password,
    role: 'employer'
  });
  
  if (result.success && result.data.token) {
    tokens.employer = result.data.token;
    log.success(`Employer registered: ${testData.employer.email}`);
    return true;
  } else {
    log.error('Employer registration failed: ' + result.error);
    return false;
  }
}

async function testJobSeekerLogin() {
  log.header('4. JOB SEEKER LOGIN TEST');
  const result = await apiCall('POST', '/auth/login', {
    email: testData.jobSeeker.email,
    password: testData.jobSeeker.password
  });
  
  if (result.success && result.data.token) {
    log.success('Job seeker login successful');
    return true;
  } else {
    log.error('Job seeker login failed: ' + result.error);
    return false;
  }
}

async function testEmployerLogin() {
  log.header('5. EMPLOYER LOGIN TEST');
  const result = await apiCall('POST', '/auth/login', {
    email: testData.employer.email,
    password: testData.employer.password
  });
  
  if (result.success && result.data.token) {
    log.success('Employer login successful');
    return true;
  } else {
    log.error('Employer login failed: ' + result.error);
    return false;
  }
}

async function testJobSeekerProfile() {
  log.header('6. JOB SEEKER PROFILE TEST');
  
  // Update profile
  const updateResult = await apiCall('PUT', '/profile/job-seeker', {
    firstName: 'Test',
    lastName: 'Seeker',
    phone: '+1234567890',
    location: 'New York, NY',
    skills: 'JavaScript, React, Node.js',
    bio: 'Test bio for job seeker'
  }, tokens.jobSeeker);
  
  if (!updateResult.success) {
    log.error('Profile update failed: ' + updateResult.error);
    return false;
  }
  log.success('Profile updated successfully');
  
  // Get profile
  const getResult = await apiCall('GET', '/profile/job-seeker', null, tokens.jobSeeker);
  if (getResult.success) {
    log.success('Profile retrieved successfully');
    return true;
  } else {
    log.error('Profile retrieval failed: ' + getResult.error);
    return false;
  }
}

async function testEmployerProfile() {
  log.header('7. EMPLOYER PROFILE TEST');
  
  // Update profile
  const updateResult = await apiCall('PUT', '/profile/employer', {
    companyName: 'Test Company Inc',
    contactPerson: 'Test Employer',
    phone: '+0987654321',
    location: 'San Francisco, CA',
    description: 'A test company',
    industry: 'Technology'
  }, tokens.employer);
  
  if (!updateResult.success) {
    log.error('Profile update failed: ' + updateResult.error);
    return false;
  }
  log.success('Profile updated successfully');
  
  // Get profile
  const getResult = await apiCall('GET', '/profile/employer', null, tokens.employer);
  if (getResult.success) {
    log.success('Profile retrieved successfully');
    return true;
  } else {
    log.error('Profile retrieval failed: ' + getResult.error);
    return false;
  }
}

async function testJobCreation() {
  log.header('8. JOB CREATION TEST');
  const result = await apiCall('POST', '/jobs', {
    title: 'Senior Full Stack Developer',
    description: 'We are looking for an experienced full stack developer to join our team.',
    requirements: 'Bachelor\'s degree in CS, 5+ years experience with React and Node.js',
    responsibilities: 'Develop and maintain web applications, lead technical discussions',
    location: 'San Francisco, CA',
    jobType: 'full-time',
    experienceLevel: 'senior',
    salaryMin: 100000,
    salaryMax: 150000,
    skills: 'JavaScript, React, Node.js, MySQL'
  }, tokens.employer);
  
  if (result.success && result.data.job) {
    jobId = result.data.job.id;
    log.success(`Job created with ID: ${jobId}`);
    return true;
  } else {
    log.error('Job creation failed: ' + result.error);
    return false;
  }
}

async function testJobListing() {
  log.header('9. JOB LISTING TEST');
  const result = await apiCall('GET', '/jobs');
  
  if (result.success && result.data.jobs) {
    log.success(`Found ${result.data.jobs.length} jobs`);
    return true;
  } else {
    log.error('Job listing failed: ' + result.error);
    return false;
  }
}

async function testJobSearch() {
  log.header('10. JOB SEARCH TEST');
  const result = await apiCall('GET', '/jobs?search=Full Stack&location=San Francisco');
  
  if (result.success) {
    log.success('Job search completed successfully');
    return true;
  } else {
    log.error('Job search failed: ' + result.error);
    return false;
  }
}

async function testJobDetails() {
  log.header('11. JOB DETAILS TEST');
  if (!jobId) {
    log.warning('Skipping - No job ID available');
    return true;
  }
  
  const result = await apiCall('GET', `/jobs/${jobId}`);
  
  if (result.success && result.data.job) {
    log.success('Job details retrieved successfully');
    return true;
  } else {
    log.error('Job details retrieval failed: ' + result.error);
    return false;
  }
}

async function testJobApplication() {
  log.header('12. JOB APPLICATION TEST');
  if (!jobId) {
    log.warning('Skipping - No job ID available');
    return true;
  }
  
  const result = await apiCall('POST', `/applications/${jobId}`, {
    coverLetter: 'I am very interested in this position and believe I would be a great fit.'
  }, tokens.jobSeeker);
  
  if (result.success && result.data.application) {
    applicationId = result.data.application.id;
    log.success(`Application submitted with ID: ${applicationId}`);
    return true;
  } else {
    log.error('Job application failed: ' + result.error);
    return false;
  }
}

async function testMyApplications() {
  log.header('13. MY APPLICATIONS TEST (Job Seeker)');
  const result = await apiCall('GET', '/applications/my-applications', null, tokens.jobSeeker);
  
  if (result.success && result.data.applications) {
    log.success(`Found ${result.data.applications.length} applications`);
    return true;
  } else {
    log.error('My applications retrieval failed: ' + result.error);
    return false;
  }
}

async function testJobApplications() {
  log.header('14. JOB APPLICATIONS TEST (Employer)');
  if (!jobId) {
    log.warning('Skipping - No job ID available');
    return true;
  }
  
  const result = await apiCall('GET', `/applications/job/${jobId}`, null, tokens.employer);
  
  if (result.success && result.data.applications) {
    log.success(`Found ${result.data.applications.length} applications for the job`);
    return true;
  } else {
    log.error('Job applications retrieval failed: ' + result.error);
    return false;
  }
}

async function testApplicationStatusUpdate() {
  log.header('15. APPLICATION STATUS UPDATE TEST');
  if (!applicationId) {
    log.warning('Skipping - No application ID available');
    return true;
  }
  
  const result = await apiCall('PATCH', `/applications/${applicationId}/status`, {
    status: 'reviewed'
  }, tokens.employer);
  
  if (result.success) {
    log.success('Application status updated successfully');
    return true;
  } else {
    log.error('Application status update failed: ' + result.error);
    return false;
  }
}

async function testEmployerJobs() {
  log.header('16. EMPLOYER JOBS TEST');
  const result = await apiCall('GET', '/jobs/my-jobs', null, tokens.employer);
  
  if (result.success && result.data.jobs) {
    log.success(`Found ${result.data.jobs.length} employer jobs`);
    return true;
  } else {
    log.error('Employer jobs retrieval failed: ' + result.error);
    return false;
  }
}

async function testJobUpdate() {
  log.header('17. JOB UPDATE TEST');
  if (!jobId) {
    log.warning('Skipping - No job ID available');
    return true;
  }
  
  const result = await apiCall('PUT', `/jobs/${jobId}`, {
    title: 'Senior Full Stack Developer (Updated)',
    description: 'Updated job description'
  }, tokens.employer);
  
  if (result.success) {
    log.success('Job updated successfully');
    return true;
  } else {
    log.error('Job update failed: ' + result.error);
    return false;
  }
}

async function testJobDelete() {
  log.header('18. JOB DELETE TEST');
  if (!jobId) {
    log.warning('Skipping - No job ID available');
    return true;
  }
  
  const result = await apiCall('DELETE', `/jobs/${jobId}`, null, tokens.employer);
  
  if (result.success) {
    log.success('Job deleted successfully');
    return true;
  } else {
    log.error('Job deletion failed: ' + result.error);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('\n');
  log.header('JOB PORTAL API - COMPREHENSIVE TEST SUITE');
  console.log('\n');
  
  const tests = [
    testHealthCheck,
    testJobSeekerRegistration,
    testEmployerRegistration,
    testJobSeekerLogin,
    testEmployerLogin,
    testJobSeekerProfile,
    testEmployerProfile,
    testJobCreation,
    testJobListing,
    testJobSearch,
    testJobDetails,
    testJobApplication,
    testMyApplications,
    testJobApplications,
    testApplicationStatusUpdate,
    testEmployerJobs,
    testJobUpdate,
    testJobDelete
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      log.error(`Test error: ${error.message}`);
      failed++;
    }
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
  }
  
  // Summary
  log.header('TEST SUMMARY');
  console.log(`\n${colors.bold}Total Tests: ${tests.length}${colors.reset}`);
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  console.log(`${colors.yellow}Success Rate: ${((passed / tests.length) * 100).toFixed(2)}%${colors.reset}\n`);
  
  return failed === 0;
}

// Start server and run tests
async function main() {
  log.info('Starting backend server...');
  
  const serverProcess = spawn('npm', ['start'], {
    cwd: __dirname,
    stdio: 'pipe',
    shell: true
  });
  
  serverProcess.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Server is running')) {
      log.success('Backend server started successfully');
    }
  });
  
  serverProcess.stderr.on('data', (data) => {
    const error = data.toString();
    if (!error.includes('DeprecationWarning')) {
      log.error('Server error: ' + error);
    }
  });
  
  // Wait for server to be ready
  const serverReady = await waitForServer();
  
  if (!serverReady) {
    log.error('Failed to start server. Exiting...');
    serverProcess.kill();
    process.exit(1);
  }
  
  // Run tests
  try {
    const success = await runTests();
    
    // Cleanup
    log.info('Stopping server...');
    serverProcess.kill();
    
    process.exit(success ? 0 : 1);
  } catch (error) {
    log.error('Test suite error: ' + error.message);
    serverProcess.kill();
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { runTests };
