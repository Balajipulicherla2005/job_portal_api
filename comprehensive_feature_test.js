const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE_URL = 'http://localhost:5001/api';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Test data storage
const testData = {
  jobSeeker: {
    email: `jobseeker_${Date.now()}@test.com`,
    password: 'Test@123456',
    token: '',
    userId: null
  },
  employer: {
    email: `employer_${Date.now()}@test.com`,
    password: 'Test@123456',
    token: '',
    userId: null
  },
  job: {
    id: null
  },
  application: {
    id: null
  }
};

// Helper functions
const log = {
  header: (text) => console.log(`\n${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}`),
  test: (text) => console.log(`${colors.blue}TEST:${colors.reset} ${text}`),
  success: (text) => console.log(`${colors.green}✓ PASS:${colors.reset} ${text}`),
  error: (text) => console.log(`${colors.red}✗ FAIL:${colors.reset} ${text}`),
  info: (text) => console.log(`${colors.yellow}INFO:${colors.reset} ${text}`),
  result: (text) => console.log(`${colors.cyan}→${colors.reset} ${text}`)
};

// API request wrapper
async function makeRequest(method, endpoint, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (data) {
      if (data instanceof FormData) {
        config.data = data;
        config.headers = { ...config.headers, ...data.getHeaders() };
      } else {
        config.data = data;
      }
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status
    };
  }
}

// ============================================
// 1. USER AUTHENTICATION TESTS
// ============================================
async function testUserAuthentication() {
  log.header();
  console.log(`${colors.bright}1. USER AUTHENTICATION TESTS${colors.reset}`);
  log.header();

  // Test 1.1: Register Job Seeker
  log.test('Register Job Seeker');
  const registerJobSeeker = await makeRequest('POST', '/auth/register', {
    email: testData.jobSeeker.email,
    password: testData.jobSeeker.password,
    role: 'job_seeker'
  });

  if (registerJobSeeker.success) {
    testData.jobSeeker.token = registerJobSeeker.data.token;
    testData.jobSeeker.userId = registerJobSeeker.data.user.id;
    log.success('Job Seeker registered successfully');
    log.result(`User ID: ${testData.jobSeeker.userId}`);
  } else {
    log.error(`Failed to register job seeker: ${JSON.stringify(registerJobSeeker.error)}`);
    return false;
  }

  // Test 1.2: Register Employer
  log.test('Register Employer');
  const registerEmployer = await makeRequest('POST', '/auth/register', {
    email: testData.employer.email,
    password: testData.employer.password,
    role: 'employer'
  });

  if (registerEmployer.success) {
    testData.employer.token = registerEmployer.data.token;
    testData.employer.userId = registerEmployer.data.user.id;
    log.success('Employer registered successfully');
    log.result(`User ID: ${testData.employer.userId}`);
  } else {
    log.error(`Failed to register employer: ${JSON.stringify(registerEmployer.error)}`);
    return false;
  }

  // Test 1.3: Login Job Seeker
  log.test('Login Job Seeker');
  const loginJobSeeker = await makeRequest('POST', '/auth/login', {
    email: testData.jobSeeker.email,
    password: testData.jobSeeker.password
  });

  if (loginJobSeeker.success) {
    log.success('Job Seeker logged in successfully');
  } else {
    log.error(`Failed to login job seeker: ${JSON.stringify(loginJobSeeker.error)}`);
    return false;
  }

  // Test 1.4: Login Employer
  log.test('Login Employer');
  const loginEmployer = await makeRequest('POST', '/auth/login', {
    email: testData.employer.email,
    password: testData.employer.password
  });

  if (loginEmployer.success) {
    log.success('Employer logged in successfully');
  } else {
    log.error(`Failed to login employer: ${JSON.stringify(loginEmployer.error)}`);
    return false;
  }

  // Test 1.5: Duplicate Registration Prevention
  log.test('Prevent Duplicate Registration');
  const duplicateRegister = await makeRequest('POST', '/auth/register', {
    email: testData.jobSeeker.email,
    password: 'AnotherPass@123',
    role: 'job_seeker'
  });

  if (!duplicateRegister.success && duplicateRegister.status === 400) {
    log.success('Duplicate registration prevented correctly');
  } else {
    log.error('Failed to prevent duplicate registration');
    return false;
  }

  // Test 1.6: Invalid Login
  log.test('Invalid Login Credentials');
  const invalidLogin = await makeRequest('POST', '/auth/login', {
    email: testData.jobSeeker.email,
    password: 'WrongPassword@123'
  });

  if (!invalidLogin.success && invalidLogin.status === 401) {
    log.success('Invalid login prevented correctly');
  } else {
    log.error('Failed to prevent invalid login');
    return false;
  }

  return true;
}

// ============================================
// 2. PROFILE MANAGEMENT TESTS
// ============================================
async function testProfileManagement() {
  log.header();
  console.log(`${colors.bright}2. PROFILE MANAGEMENT TESTS${colors.reset}`);
  log.header();

  // Test 2.1: Create Job Seeker Profile
  log.test('Create Job Seeker Profile');
  const createJobSeekerProfile = await makeRequest(
    'POST',
    '/profile/job-seeker',
    {
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
      address: '123 Test Street',
      city: 'Test City',
      state: 'Test State',
      country: 'Test Country',
      zipCode: '12345',
      skills: 'JavaScript, React, Node.js',
      experience: '3 years of web development',
      education: 'Bachelor in Computer Science',
      bio: 'Passionate web developer'
    },
    { Authorization: `Bearer ${testData.jobSeeker.token}` }
  );

  if (createJobSeekerProfile.success) {
    log.success('Job Seeker profile created successfully');
    log.result(`Profile ID: ${createJobSeekerProfile.data.profile.id}`);
  } else {
    log.error(`Failed to create job seeker profile: ${JSON.stringify(createJobSeekerProfile.error)}`);
    return false;
  }

  // Test 2.2: Get Job Seeker Profile
  log.test('Get Job Seeker Profile');
  const getJobSeekerProfile = await makeRequest(
    'GET',
    '/profile/job-seeker',
    null,
    { Authorization: `Bearer ${testData.jobSeeker.token}` }
  );

  if (getJobSeekerProfile.success) {
    log.success('Job Seeker profile retrieved successfully');
    log.result(`Name: ${getJobSeekerProfile.data.profile.firstName} ${getJobSeekerProfile.data.profile.lastName}`);
  } else {
    log.error(`Failed to get job seeker profile: ${JSON.stringify(getJobSeekerProfile.error)}`);
    return false;
  }

  // Test 2.3: Update Job Seeker Profile
  log.test('Update Job Seeker Profile');
  const updateJobSeekerProfile = await makeRequest(
    'PUT',
    '/profile/job-seeker',
    {
      bio: 'Updated bio - Experienced web developer with 5+ years',
      skills: 'JavaScript, React, Node.js, TypeScript, MongoDB'
    },
    { Authorization: `Bearer ${testData.jobSeeker.token}` }
  );

  if (updateJobSeekerProfile.success) {
    log.success('Job Seeker profile updated successfully');
  } else {
    log.error(`Failed to update job seeker profile: ${JSON.stringify(updateJobSeekerProfile.error)}`);
    return false;
  }

  // Test 2.4: Create Employer Profile
  log.test('Create Employer Profile');
  const createEmployerProfile = await makeRequest(
    'POST',
    '/profile/employer',
    {
      companyName: 'Test Company Inc.',
      contactPerson: 'Jane Smith',
      phone: '+1987654321',
      companyEmail: 'contact@testcompany.com',
      website: 'https://testcompany.com',
      address: '456 Business Ave',
      city: 'Business City',
      state: 'Business State',
      country: 'Business Country',
      zipCode: '54321',
      description: 'Leading technology company',
      industry: 'Technology',
      companySize: '100-500'
    },
    { Authorization: `Bearer ${testData.employer.token}` }
  );

  if (createEmployerProfile.success) {
    log.success('Employer profile created successfully');
    log.result(`Company: ${createEmployerProfile.data.profile.companyName}`);
  } else {
    log.error(`Failed to create employer profile: ${JSON.stringify(createEmployerProfile.error)}`);
    return false;
  }

  // Test 2.5: Get Employer Profile
  log.test('Get Employer Profile');
  const getEmployerProfile = await makeRequest(
    'GET',
    '/profile/employer',
    null,
    { Authorization: `Bearer ${testData.employer.token}` }
  );

  if (getEmployerProfile.success) {
    log.success('Employer profile retrieved successfully');
    log.result(`Company: ${getEmployerProfile.data.profile.companyName}`);
  } else {
    log.error(`Failed to get employer profile: ${JSON.stringify(getEmployerProfile.error)}`);
    return false;
  }

  // Test 2.6: Update Employer Profile
  log.test('Update Employer Profile');
  const updateEmployerProfile = await makeRequest(
    'PUT',
    '/profile/employer',
    {
      description: 'Updated description - Leading technology company specializing in AI',
      companySize: '500-1000'
    },
    { Authorization: `Bearer ${testData.employer.token}` }
  );

  if (updateEmployerProfile.success) {
    log.success('Employer profile updated successfully');
  } else {
    log.error(`Failed to update employer profile: ${JSON.stringify(updateEmployerProfile.error)}`);
    return false;
  }

  return true;
}

// ============================================
// 3. JOB LISTINGS TESTS
// ============================================
async function testJobListings() {
  log.header();
  console.log(`${colors.bright}3. JOB LISTINGS TESTS${colors.reset}`);
  log.header();

  // Test 3.1: Create Job Listing
  log.test('Create Job Listing');
  const createJob = await makeRequest(
    'POST',
    '/jobs',
    {
      title: 'Senior Full Stack Developer',
      description: 'We are looking for an experienced full stack developer to join our team.',
      qualifications: 'Bachelor\'s degree in Computer Science, 5+ years experience',
      responsibilities: 'Develop and maintain web applications, Lead technical discussions',
      jobType: 'full-time',
      location: 'San Francisco, CA',
      salaryMin: 100000,
      salaryMax: 150000,
      salaryPeriod: 'yearly',
      experienceLevel: 'senior',
      skills: 'JavaScript, React, Node.js, MongoDB, AWS',
      benefits: 'Health insurance, 401k, Remote work',
      status: 'active'
    },
    { Authorization: `Bearer ${testData.employer.token}` }
  );

  if (createJob.success) {
    testData.job.id = createJob.data.job.id;
    log.success('Job listing created successfully');
    log.result(`Job ID: ${testData.job.id}`);
    log.result(`Title: ${createJob.data.job.title}`);
  } else {
    log.error(`Failed to create job listing: ${JSON.stringify(createJob.error)}`);
    return false;
  }

  // Test 3.2: Get All Jobs (Public)
  log.test('Get All Jobs (Public)');
  const getAllJobs = await makeRequest('GET', '/jobs');

  if (getAllJobs.success) {
    log.success(`Retrieved ${getAllJobs.data.jobs.length} job listings`);
  } else {
    log.error(`Failed to get job listings: ${JSON.stringify(getAllJobs.error)}`);
    return false;
  }

  // Test 3.3: Get Job by ID
  log.test('Get Job by ID');
  const getJobById = await makeRequest('GET', `/jobs/${testData.job.id}`);

  if (getJobById.success) {
    log.success('Job details retrieved successfully');
    log.result(`Title: ${getJobById.data.job.title}`);
    log.result(`Company: ${getJobById.data.job.employer.companyName}`);
  } else {
    log.error(`Failed to get job by ID: ${JSON.stringify(getJobById.error)}`);
    return false;
  }

  // Test 3.4: Update Job Listing
  log.test('Update Job Listing');
  const updateJob = await makeRequest(
    'PUT',
    `/jobs/${testData.job.id}`,
    {
      title: 'Senior Full Stack Developer (Updated)',
      salaryMax: 160000
    },
    { Authorization: `Bearer ${testData.employer.token}` }
  );

  if (updateJob.success) {
    log.success('Job listing updated successfully');
    log.result(`Updated Title: ${updateJob.data.job.title}`);
  } else {
    log.error(`Failed to update job listing: ${JSON.stringify(updateJob.error)}`);
    return false;
  }

  // Test 3.5: Get Employer's Jobs
  log.test('Get Employer\'s Jobs');
  const getEmployerJobs = await makeRequest(
    'GET',
    '/jobs/employer/my-jobs',
    null,
    { Authorization: `Bearer ${testData.employer.token}` }
  );

  if (getEmployerJobs.success) {
    log.success(`Retrieved ${getEmployerJobs.data.jobs.length} employer's jobs`);
  } else {
    log.error(`Failed to get employer's jobs: ${JSON.stringify(getEmployerJobs.error)}`);
    return false;
  }

  return true;
}

// ============================================
// 4. JOB SEARCH TESTS
// ============================================
async function testJobSearch() {
  log.header();
  console.log(`${colors.bright}4. JOB SEARCH TESTS${colors.reset}`);
  log.header();

  // Test 4.1: Search by Keyword
  log.test('Search Jobs by Keyword');
  const searchByKeyword = await makeRequest('GET', '/jobs?keyword=developer');

  if (searchByKeyword.success) {
    log.success(`Found ${searchByKeyword.data.jobs.length} jobs with keyword 'developer'`);
  } else {
    log.error(`Failed to search by keyword: ${JSON.stringify(searchByKeyword.error)}`);
    return false;
  }

  // Test 4.2: Search by Location
  log.test('Search Jobs by Location');
  const searchByLocation = await makeRequest('GET', '/jobs?location=San Francisco');

  if (searchByLocation.success) {
    log.success(`Found ${searchByLocation.data.jobs.length} jobs in 'San Francisco'`);
  } else {
    log.error(`Failed to search by location: ${JSON.stringify(searchByLocation.error)}`);
    return false;
  }

  // Test 4.3: Search by Job Type
  log.test('Search Jobs by Job Type');
  const searchByJobType = await makeRequest('GET', '/jobs?jobType=full-time');

  if (searchByJobType.success) {
    log.success(`Found ${searchByJobType.data.jobs.length} full-time jobs`);
  } else {
    log.error(`Failed to search by job type: ${JSON.stringify(searchByJobType.error)}`);
    return false;
  }

  // Test 4.4: Combined Search
  log.test('Combined Search (Keyword + Location + Job Type)');
  const combinedSearch = await makeRequest(
    'GET',
    '/jobs?keyword=developer&location=San Francisco&jobType=full-time'
  );

  if (combinedSearch.success) {
    log.success(`Found ${combinedSearch.data.jobs.length} jobs with combined filters`);
  } else {
    log.error(`Failed combined search: ${JSON.stringify(combinedSearch.error)}`);
    return false;
  }

  return true;
}

// ============================================
// 5. JOB APPLICATION TESTS
// ============================================
async function testJobApplication() {
  log.header();
  console.log(`${colors.bright}5. JOB APPLICATION TESTS${colors.reset}`);
  log.header();

  // Test 5.1: Apply for Job
  log.test('Apply for Job');
  const applyForJob = await makeRequest(
    'POST',
    `/applications/${testData.job.id}`,
    {
      coverLetter: 'I am very interested in this position and believe I am a great fit.'
    },
    { Authorization: `Bearer ${testData.jobSeeker.token}` }
  );

  if (applyForJob.success) {
    testData.application.id = applyForJob.data.application.id;
    log.success('Job application submitted successfully');
    log.result(`Application ID: ${testData.application.id}`);
  } else {
    log.error(`Failed to apply for job: ${JSON.stringify(applyForJob.error)}`);
    return false;
  }

  // Test 5.2: Get Job Seeker's Applications
  log.test('Get Job Seeker\'s Applications');
  const getMyApplications = await makeRequest(
    'GET',
    '/applications/my-applications',
    null,
    { Authorization: `Bearer ${testData.jobSeeker.token}` }
  );

  if (getMyApplications.success) {
    log.success(`Retrieved ${getMyApplications.data.applications.length} applications`);
  } else {
    log.error(`Failed to get applications: ${JSON.stringify(getMyApplications.error)}`);
    return false;
  }

  // Test 5.3: Get Job Applications (Employer)
  log.test('Get Job Applications (Employer View)');
  const getJobApplications = await makeRequest(
    'GET',
    `/applications/job/${testData.job.id}`,
    null,
    { Authorization: `Bearer ${testData.employer.token}` }
  );

  if (getJobApplications.success) {
    log.success(`Retrieved ${getJobApplications.data.applications.length} applications for this job`);
  } else {
    log.error(`Failed to get job applications: ${JSON.stringify(getJobApplications.error)}`);
    return false;
  }

  // Test 5.4: Update Application Status
  log.test('Update Application Status');
  const updateApplicationStatus = await makeRequest(
    'PUT',
    `/applications/${testData.application.id}/status`,
    {
      status: 'reviewed',
      notes: 'Good candidate, moving forward'
    },
    { Authorization: `Bearer ${testData.employer.token}` }
  );

  if (updateApplicationStatus.success) {
    log.success('Application status updated successfully');
    log.result(`New Status: ${updateApplicationStatus.data.application.status}`);
  } else {
    log.error(`Failed to update application status: ${JSON.stringify(updateApplicationStatus.error)}`);
    return false;
  }

  // Test 5.5: Prevent Duplicate Application
  log.test('Prevent Duplicate Application');
  const duplicateApplication = await makeRequest(
    'POST',
    `/applications/${testData.job.id}`,
    {
      coverLetter: 'Applying again'
    },
    { Authorization: `Bearer ${testData.jobSeeker.token}` }
  );

  if (!duplicateApplication.success && duplicateApplication.status === 400) {
    log.success('Duplicate application prevented correctly');
  } else {
    log.error('Failed to prevent duplicate application');
    return false;
  }

  return true;
}

// ============================================
// 6. DASHBOARD TESTS
// ============================================
async function testDashboard() {
  log.header();
  console.log(`${colors.bright}6. DASHBOARD TESTS${colors.reset}`);
  log.header();

  // Test 6.1: Job Seeker Dashboard Stats
  log.test('Get Job Seeker Dashboard Stats');
  const jobSeekerStats = await makeRequest(
    'GET',
    '/applications/stats',
    null,
    { Authorization: `Bearer ${testData.jobSeeker.token}` }
  );

  if (jobSeekerStats.success) {
    log.success('Job Seeker dashboard stats retrieved');
    log.result(`Total Applications: ${jobSeekerStats.data.total || 0}`);
    log.result(`Pending: ${jobSeekerStats.data.pending || 0}`);
    log.result(`Reviewed: ${jobSeekerStats.data.reviewed || 0}`);
  } else {
    log.error(`Failed to get job seeker stats: ${JSON.stringify(jobSeekerStats.error)}`);
    return false;
  }

  // Test 6.2: Employer Dashboard Stats
  log.test('Get Employer Dashboard Stats');
  const employerStats = await makeRequest(
    'GET',
    '/jobs/stats',
    null,
    { Authorization: `Bearer ${testData.employer.token}` }
  );

  if (employerStats.success) {
    log.success('Employer dashboard stats retrieved');
    log.result(`Total Jobs: ${employerStats.data.totalJobs || 0}`);
    log.result(`Active Jobs: ${employerStats.data.activeJobs || 0}`);
  } else {
    log.error(`Failed to get employer stats: ${JSON.stringify(employerStats.error)}`);
    return false;
  }

  return true;
}

// ============================================
// 7. CLEANUP AND DELETE TESTS
// ============================================
async function testCleanup() {
  log.header();
  console.log(`${colors.bright}7. CLEANUP TESTS${colors.reset}`);
  log.header();

  // Test 7.1: Delete Job (should also delete applications)
  log.test('Delete Job Listing');
  const deleteJob = await makeRequest(
    'DELETE',
    `/jobs/${testData.job.id}`,
    null,
    { Authorization: `Bearer ${testData.employer.token}` }
  );

  if (deleteJob.success) {
    log.success('Job listing deleted successfully');
  } else {
    log.error(`Failed to delete job: ${JSON.stringify(deleteJob.error)}`);
    return false;
  }

  // Test 7.2: Verify Job is Deleted
  log.test('Verify Job is Deleted');
  const verifyDeleted = await makeRequest('GET', `/jobs/${testData.job.id}`);

  if (!verifyDeleted.success && verifyDeleted.status === 404) {
    log.success('Job deletion verified');
  } else {
    log.error('Failed to verify job deletion');
    return false;
  }

  return true;
}

// ============================================
// MAIN TEST RUNNER
// ============================================
async function runAllTests() {
  console.log(`\n${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.bright}JOB PORTAL - COMPREHENSIVE FEATURE TEST${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);

  log.info(`Testing API at: ${API_BASE_URL}`);
  log.info(`Start Time: ${new Date().toLocaleString()}\n`);

  const testResults = {
    total: 0,
    passed: 0,
    failed: 0
  };

  const tests = [
    { name: 'User Authentication', fn: testUserAuthentication },
    { name: 'Profile Management', fn: testProfileManagement },
    { name: 'Job Listings', fn: testJobListings },
    { name: 'Job Search', fn: testJobSearch },
    { name: 'Job Application', fn: testJobApplication },
    { name: 'Dashboard', fn: testDashboard },
    { name: 'Cleanup', fn: testCleanup }
  ];

  for (const test of tests) {
    testResults.total++;
    try {
      const result = await test.fn();
      if (result) {
        testResults.passed++;
        log.success(`${test.name} tests completed successfully`);
      } else {
        testResults.failed++;
        log.error(`${test.name} tests failed`);
      }
    } catch (error) {
      testResults.failed++;
      log.error(`${test.name} tests encountered an error: ${error.message}`);
    }
  }

  // Summary
  log.header();
  console.log(`${colors.bright}TEST SUMMARY${colors.reset}`);
  log.header();
  console.log(`Total Test Suites: ${testResults.total}`);
  console.log(`${colors.green}Passed: ${testResults.passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${testResults.failed}${colors.reset}`);
  console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(2)}%`);
  log.info(`End Time: ${new Date().toLocaleString()}\n`);

  if (testResults.failed === 0) {
    console.log(`${colors.bright}${colors.green}✓ ALL TESTS PASSED!${colors.reset}\n`);
  } else {
    console.log(`${colors.bright}${colors.red}✗ SOME TESTS FAILED${colors.reset}\n`);
  }
}

// Run tests
runAllTests().catch(error => {
  console.error('Fatal error running tests:', error);
  process.exit(1);
});
