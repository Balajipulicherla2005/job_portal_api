const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5002/api';

// Test data
let jobSeekerToken = '';
let employerToken = '';
let jobSeekerUserId = '';
let employerUserId = '';
let jobId = '';
let applicationId = '';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  test: (msg) => console.log(`${colors.cyan}\n▶ Testing: ${msg}${colors.reset}`)
};

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
      if (data instanceof FormData) {
        config.data = data;
        config.headers = { ...config.headers, ...data.getHeaders() };
      } else {
        config.data = data;
        config.headers['Content-Type'] = 'application/json';
      }
    }

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response ? error.response.data : error.message
    };
  }
}

// Test 1: User Registration
async function testUserRegistration() {
  log.test('User Registration');

  // Register Job Seeker
  log.info('Registering job seeker...');
  const jobSeekerData = {
    email: `jobseeker_${Date.now()}@test.com`,
    password: 'Test@123',
    role: 'job_seeker',
    fullName: 'John Doe'
  };

  const jobSeekerResult = await apiCall('POST', '/auth/register', jobSeekerData);
  if (jobSeekerResult.success) {
    log.success('Job seeker registered successfully');
    jobSeekerToken = jobSeekerResult.data.data.token;
    jobSeekerUserId = jobSeekerResult.data.data.user.id;
  } else {
    log.error(`Job seeker registration failed: ${JSON.stringify(jobSeekerResult.error)}`);
    return false;
  }

  // Register Employer
  log.info('Registering employer...');
  const employerData = {
    email: `employer_${Date.now()}@test.com`,
    password: 'Test@123',
    role: 'employer',
    fullName: 'ABC Company'
  };

  const employerResult = await apiCall('POST', '/auth/register', employerData);
  if (employerResult.success) {
    log.success('Employer registered successfully');
    employerToken = employerResult.data.data.token;
    employerUserId = employerResult.data.data.user.id;
  } else {
    log.error(`Employer registration failed: ${JSON.stringify(employerResult.error)}`);
    return false;
  }

  return true;
}

// Test 2: User Login
async function testUserLogin() {
  log.test('User Login');

  // Test invalid login
  log.info('Testing invalid login...');
  const invalidLoginResult = await apiCall('POST', '/auth/login', {
    email: 'invalid@test.com',
    password: 'wrongpassword'
  });

  if (!invalidLoginResult.success) {
    log.success('Invalid login correctly rejected');
  } else {
    log.error('Invalid login was not rejected');
    return false;
  }

  return true;
}

// Test 3: Profile Management
async function testProfileManagement() {
  log.test('Profile Management');

  // Create Job Seeker Profile
  log.info('Creating job seeker profile...');
  const jobSeekerProfileData = {
    fullName: 'John Doe',
    phone: '1234567890',
    location: 'New York',
    skills: ['JavaScript', 'React', 'Node.js'],
    experience: '3 years',
    education: 'Bachelor in Computer Science'
  };

  const jobSeekerProfileResult = await apiCall(
    'PUT',
    '/profile/job-seeker',
    jobSeekerProfileData,
    jobSeekerToken
  );

  if (jobSeekerProfileResult.success) {
    log.success('Job seeker profile created successfully');
  } else {
    log.error(`Job seeker profile creation failed: ${JSON.stringify(jobSeekerProfileResult.error)}`);
    return false;
  }

  // Create Employer Profile
  log.info('Creating employer profile...');
  const employerProfileData = {
    companyName: 'ABC Tech Corp',
    companyDescription: 'Leading tech company',
    website: 'https://abc-tech.com',
    location: 'San Francisco',
    companySize: '100-500',
    industry: 'Technology'
  };

  const employerProfileResult = await apiCall(
    'PUT',
    '/profile/employer',
    employerProfileData,
    employerToken
  );

  if (employerProfileResult.success) {
    log.success('Employer profile created successfully');
  } else {
    log.error(`Employer profile creation failed: ${JSON.stringify(employerProfileResult.error)}`);
    return false;
  }

  // Update Job Seeker Profile
  log.info('Updating job seeker profile...');
  const updatedProfileData = {
    ...jobSeekerProfileData,
    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB']
  };

  const updateResult = await apiCall(
    'PUT',
    '/profile/job-seeker',
    updatedProfileData,
    jobSeekerToken
  );

  if (updateResult.success) {
    log.success('Job seeker profile updated successfully');
  } else {
    log.error(`Job seeker profile update failed: ${JSON.stringify(updateResult.error)}`);
    return false;
  }

  // Get Job Seeker Profile
  log.info('Getting job seeker profile...');
  const getProfileResult = await apiCall('GET', '/profile/job-seeker', null, jobSeekerToken);

  if (getProfileResult.success) {
    log.success('Job seeker profile retrieved successfully');
  } else {
    log.error(`Failed to get job seeker profile: ${JSON.stringify(getProfileResult.error)}`);
    return false;
  }

  return true;
}

// Test 4: Job Listings
async function testJobListings() {
  log.test('Job Listings');

  // Create Job
  log.info('Creating job listing...');
  const jobData = {
    title: 'Senior Full Stack Developer',
    description: 'We are looking for an experienced full stack developer',
    qualifications: 'Bachelor degree in Computer Science, 5+ years experience',
    responsibilities: 'Develop and maintain web applications',
    location: 'San Francisco, CA',
    jobType: 'full-time',
    salaryRange: '$100,000 - $150,000'
  };

  const createJobResult = await apiCall('POST', '/jobs', jobData, employerToken);

  if (createJobResult.success) {
    log.success('Job created successfully');
    jobId = createJobResult.data.data.job.id;
  } else {
    log.error(`Job creation failed: ${JSON.stringify(createJobResult.error)}`);
    return false;
  }

  // Get All Jobs
  log.info('Getting all jobs...');
  const getAllJobsResult = await apiCall('GET', '/jobs');

  if (getAllJobsResult.success) {
    log.success(`Retrieved ${getAllJobsResult.data.data.jobs.length} jobs`);
  } else {
    log.error(`Failed to get jobs: ${JSON.stringify(getAllJobsResult.error)}`);
    return false;
  }

  // Get Job by ID
  log.info('Getting job by ID...');
  const getJobResult = await apiCall('GET', `/jobs/${jobId}`);

  if (getJobResult.success) {
    log.success('Job retrieved successfully');
  } else {
    log.error(`Failed to get job: ${JSON.stringify(getJobResult.error)}`);
    return false;
  }

  // Update Job
  log.info('Updating job...');
  const updatedJobData = {
    ...jobData,
    salaryRange: '$110,000 - $160,000'
  };

  const updateJobResult = await apiCall('PUT', `/jobs/${jobId}`, updatedJobData, employerToken);

  if (updateJobResult.success) {
    log.success('Job updated successfully');
  } else {
    log.error(`Job update failed: ${JSON.stringify(updateJobResult.error)}`);
    return false;
  }

  return true;
}

// Test 5: Job Search
async function testJobSearch() {
  log.test('Job Search');

  // Search by keyword
  log.info('Searching jobs by keyword...');
  const searchResult = await apiCall('GET', '/jobs?search=developer');

  if (searchResult.success) {
    log.success(`Found ${searchResult.data.data.jobs.length} jobs matching keyword`);
  } else {
    log.error(`Job search failed: ${JSON.stringify(searchResult.error)}`);
    return false;
  }

  // Search by location
  log.info('Searching jobs by location...');
  const locationResult = await apiCall('GET', '/jobs?location=San Francisco');

  if (locationResult.success) {
    log.success(`Found ${locationResult.data.data.jobs.length} jobs in location`);
  } else {
    log.error(`Location search failed: ${JSON.stringify(locationResult.error)}`);
    return false;
  }

  // Search by job type
  log.info('Searching jobs by type...');
  const typeResult = await apiCall('GET', '/jobs?jobType=full-time');

  if (typeResult.success) {
    log.success(`Found ${typeResult.data.data.jobs.length} full-time jobs`);
  } else {
    log.error(`Job type search failed: ${JSON.stringify(typeResult.error)}`);
    return false;
  }

  return true;
}

// Test 6: Job Applications
async function testJobApplications() {
  log.test('Job Applications');

  // Apply for Job
  log.info('Applying for job...');
  const applicationData = {
    jobId: jobId,
    coverLetter: 'I am very interested in this position and believe I would be a great fit.'
  };

  const applyResult = await apiCall(
    'POST',
    '/applications',
    applicationData,
    jobSeekerToken
  );

  if (applyResult.success) {
    log.success('Job application submitted successfully');
    applicationId = applyResult.data.data.application.id;
  } else {
    log.error(`Job application failed: ${JSON.stringify(applyResult.error)}`);
    return false;
  }

  // Get My Applications (Job Seeker)
  log.info('Getting job seeker applications...');
  const myApplicationsResult = await apiCall(
    'GET',
    '/applications/my-applications',
    null,
    jobSeekerToken
  );

  if (myApplicationsResult.success) {
    log.success(`Retrieved ${myApplicationsResult.data.data.applications.length} applications`);
  } else {
    log.error(`Failed to get applications: ${JSON.stringify(myApplicationsResult.error)}`);
    return false;
  }

  // Get Job Applications (Employer)
  log.info('Getting applications for job...');
  const jobApplicationsResult = await apiCall(
    'GET',
    `/applications/job/${jobId}`,
    null,
    employerToken
  );

  if (jobApplicationsResult.success) {
    log.success(`Retrieved ${jobApplicationsResult.data.data.applications.length} applications for job`);
  } else {
    log.error(`Failed to get job applications: ${JSON.stringify(jobApplicationsResult.error)}`);
    return false;
  }

  // Update Application Status
  log.info('Updating application status...');
  const updateStatusResult = await apiCall(
    'PUT',
    `/applications/${applicationId}/status`,
    { status: 'reviewed' },
    employerToken
  );

  if (updateStatusResult.success) {
    log.success('Application status updated successfully');
  } else {
    log.error(`Application status update failed: ${JSON.stringify(updateStatusResult.error)}`);
    return false;
  }

  return true;
}

// Test 7: Dashboards
async function testDashboards() {
  log.test('Dashboards');

  // Job Seeker Dashboard
  log.info('Getting job seeker dashboard...');
  const jobSeekerDashResult = await apiCall(
    'GET',
    '/dashboard/job-seeker',
    null,
    jobSeekerToken
  );

  if (jobSeekerDashResult.success) {
    log.success('Job seeker dashboard data retrieved successfully');
    log.info(`Applications: ${jobSeekerDashResult.data.data.totalApplications}`);
  } else {
    log.error(`Failed to get job seeker dashboard: ${JSON.stringify(jobSeekerDashResult.error)}`);
    return false;
  }

  // Employer Dashboard
  log.info('Getting employer dashboard...');
  const employerDashResult = await apiCall(
    'GET',
    '/dashboard/employer',
    null,
    employerToken
  );

  if (employerDashResult.success) {
    log.success('Employer dashboard data retrieved successfully');
    log.info(`Total Jobs: ${employerDashResult.data.data.totalJobs}`);
    log.info(`Total Applications: ${employerDashResult.data.data.totalApplications}`);
  } else {
    log.error(`Failed to get employer dashboard: ${JSON.stringify(employerDashResult.error)}`);
    return false;
  }

  return true;
}

// Test 8: Job Deletion
async function testJobDeletion() {
  log.test('Job Deletion');

  log.info('Deleting job...');
  const deleteResult = await apiCall('DELETE', `/jobs/${jobId}`, null, employerToken);

  if (deleteResult.success) {
    log.success('Job deleted successfully');
  } else {
    log.error(`Job deletion failed: ${JSON.stringify(deleteResult.error)}`);
    return false;
  }

  // Verify job is deleted
  log.info('Verifying job is deleted...');
  const verifyResult = await apiCall('GET', `/jobs/${jobId}`);

  if (!verifyResult.success) {
    log.success('Job deletion verified - job not found');
  } else {
    log.error('Job still exists after deletion');
    return false;
  }

  return true;
}

// Run all tests
async function runAllTests() {
  console.log('\n' + '='.repeat(60));
  console.log('COMPREHENSIVE JOB PORTAL API TEST SUITE');
  console.log('='.repeat(60) + '\n');

  const tests = [
    { name: 'User Registration', fn: testUserRegistration },
    { name: 'User Login', fn: testUserLogin },
    { name: 'Profile Management', fn: testProfileManagement },
    { name: 'Job Listings', fn: testJobListings },
    { name: 'Job Search', fn: testJobSearch },
    { name: 'Job Applications', fn: testJobApplications },
    { name: 'Dashboards', fn: testDashboards },
    { name: 'Job Deletion', fn: testJobDeletion }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
        log.success(`${test.name} - PASSED\n`);
      } else {
        failed++;
        log.error(`${test.name} - FAILED\n`);
      }
    } catch (error) {
      failed++;
      log.error(`${test.name} - ERROR: ${error.message}\n`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  console.log(`Total: ${tests.length}`);
  console.log('='.repeat(60) + '\n');

  process.exit(failed > 0 ? 1 : 0);
}

// Start tests
runAllTests();
