const axios = require('axios');

const API_URL = 'http://localhost:5001/api';
let authToken = null;
let jobSeekerId = null;
let employerId = null;
let jobId = null;
let applicationId = null;

// Test results
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(name, passed, error = null) {
  results.tests.push({ name, passed, error });
  if (passed) {
    results.passed++;
    console.log(`✓ ${name}`);
  } else {
    results.failed++;
    console.log(`✗ ${name}`);
    if (error) console.log(`  Error: ${error.message}`);
  }
}

async function testHealthCheck() {
  try {
    const response = await axios.get(`${API_URL}/health`);
    logTest('Health Check', response.data.success === true);
  } catch (error) {
    logTest('Health Check', false, error);
  }
}

async function testJobSeekerRegistration() {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, {
      email: 'jobseeker@test.com',
      password: 'Test@123',
      role: 'job_seeker',
      firstName: 'John',
      lastName: 'Doe'
    });
    jobSeekerId = response.data.data.user.id;
    logTest('Job Seeker Registration', response.data.success === true);
  } catch (error) {
    logTest('Job Seeker Registration', false, error);
  }
}

async function testEmployerRegistration() {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, {
      email: 'employer@test.com',
      password: 'Test@123',
      role: 'employer',
      companyName: 'Test Company',
      contactPerson: 'Jane Smith'
    });
    employerId = response.data.data.user.id;
    logTest('Employer Registration', response.data.success === true);
  } catch (error) {
    logTest('Employer Registration', false, error);
  }
}

async function testJobSeekerLogin() {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'jobseeker@test.com',
      password: 'Test@123'
    });
    authToken = response.data.data.token;
    logTest('Job Seeker Login', response.data.success === true && authToken !== null);
  } catch (error) {
    logTest('Job Seeker Login', false, error);
  }
}

async function testEmployerLogin() {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'employer@test.com',
      password: 'Test@123'
    });
    authToken = response.data.data.token;
    logTest('Employer Login', response.data.success === true && authToken !== null);
  } catch (error) {
    logTest('Employer Login', false, error);
  }
}

async function testGetCurrentUser() {
  try {
    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    logTest('Get Current User', response.data.success === true);
  } catch (error) {
    logTest('Get Current User', false, error);
  }
}

async function testUpdateJobSeekerProfile() {
  try {
    // Login as job seeker first
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'jobseeker@test.com',
      password: 'Test@123'
    });
    authToken = loginResponse.data.data.token;

    const response = await axios.put(`${API_URL}/profile/job-seeker`, {
      phone: '1234567890',
      city: 'New York',
      skills: 'JavaScript, React, Node.js',
      experience: '3 years',
      education: 'Bachelor in CS'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    logTest('Update Job Seeker Profile', response.data.success === true);
  } catch (error) {
    logTest('Update Job Seeker Profile', false, error);
  }
}

async function testUpdateEmployerProfile() {
  try {
    // Login as employer first
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'employer@test.com',
      password: 'Test@123'
    });
    authToken = loginResponse.data.data.token;

    const response = await axios.put(`${API_URL}/profile/employer`, {
      phone: '9876543210',
      companyEmail: 'info@testcompany.com',
      website: 'https://testcompany.com',
      description: 'A great company',
      industry: 'Technology',
      companySize: '50-100'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    logTest('Update Employer Profile', response.data.success === true);
  } catch (error) {
    logTest('Update Employer Profile', false, error);
  }
}

async function testCreateJob() {
  try {
    // Login as employer
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'employer@test.com',
      password: 'Test@123'
    });
    authToken = loginResponse.data.data.token;

    const response = await axios.post(`${API_URL}/jobs`, {
      title: 'Senior Software Engineer',
      description: 'Looking for an experienced software engineer',
      qualifications: 'Bachelor degree in CS, 5+ years experience',
      responsibilities: 'Develop and maintain software applications',
      jobType: 'full-time',
      location: 'San Francisco, CA',
      salaryMin: 100000,
      salaryMax: 150000,
      salaryPeriod: 'yearly',
      experienceLevel: 'senior',
      skills: 'JavaScript, React, Node.js, MongoDB',
      benefits: 'Health insurance, 401k, Remote work'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    jobId = response.data.data.id;
    logTest('Create Job', response.data.success === true && jobId !== null);
  } catch (error) {
    logTest('Create Job', false, error);
  }
}

async function testGetAllJobs() {
  try {
    const response = await axios.get(`${API_URL}/jobs`);
    logTest('Get All Jobs', response.data.success === true && Array.isArray(response.data.data));
  } catch (error) {
    logTest('Get All Jobs', false, error);
  }
}

async function testSearchJobs() {
  try {
    const response = await axios.get(`${API_URL}/jobs?search=software&location=san francisco&jobType=full-time`);
    logTest('Search Jobs with Filters', response.data.success === true);
  } catch (error) {
    logTest('Search Jobs with Filters', false, error);
  }
}

async function testGetJobById() {
  try {
    const response = await axios.get(`${API_URL}/jobs/${jobId}`);
    logTest('Get Job by ID', response.data.success === true);
  } catch (error) {
    logTest('Get Job by ID', false, error);
  }
}

async function testUpdateJob() {
  try {
    // Login as employer
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'employer@test.com',
      password: 'Test@123'
    });
    authToken = loginResponse.data.data.token;

    const response = await axios.put(`${API_URL}/jobs/${jobId}`, {
      title: 'Senior Software Engineer - Updated',
      description: 'Updated job description'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    logTest('Update Job', response.data.success === true);
  } catch (error) {
    logTest('Update Job', false, error);
  }
}

async function testApplyForJob() {
  try {
    // Login as job seeker
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'jobseeker@test.com',
      password: 'Test@123'
    });
    authToken = loginResponse.data.data.token;

    const response = await axios.post(`${API_URL}/applications`, {
      jobId: jobId,
      coverLetter: 'I am very interested in this position and believe I would be a great fit.'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    applicationId = response.data.data.id;
    logTest('Apply for Job', response.data.success === true && applicationId !== null);
  } catch (error) {
    logTest('Apply for Job', false, error);
  }
}

async function testGetMyApplications() {
  try {
    // Already logged in as job seeker
    const response = await axios.get(`${API_URL}/applications/my-applications`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    logTest('Get My Applications (Job Seeker)', response.data.success === true);
  } catch (error) {
    logTest('Get My Applications (Job Seeker)', false, error);
  }
}

async function testGetJobApplications() {
  try {
    // Login as employer
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'employer@test.com',
      password: 'Test@123'
    });
    authToken = loginResponse.data.data.token;

    const response = await axios.get(`${API_URL}/applications/job/${jobId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    logTest('Get Job Applications (Employer)', response.data.success === true);
  } catch (error) {
    logTest('Get Job Applications (Employer)', false, error);
  }
}

async function testUpdateApplicationStatus() {
  try {
    // Already logged in as employer
    const response = await axios.put(`${API_URL}/applications/${applicationId}/status`, {
      status: 'reviewed'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    logTest('Update Application Status', response.data.success === true);
  } catch (error) {
    logTest('Update Application Status', false, error);
  }
}

async function testGetEmployerDashboard() {
  try {
    // Already logged in as employer
    const response = await axios.get(`${API_URL}/profile/employer/dashboard`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    logTest('Employer Dashboard', response.data.success === true);
  } catch (error) {
    logTest('Employer Dashboard', false, error);
  }
}

async function testGetJobSeekerDashboard() {
  try {
    // Login as job seeker
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'jobseeker@test.com',
      password: 'Test@123'
    });
    authToken = loginResponse.data.data.token;

    const response = await axios.get(`${API_URL}/profile/job-seeker/dashboard`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    logTest('Job Seeker Dashboard', response.data.success === true);
  } catch (error) {
    logTest('Job Seeker Dashboard', false, error);
  }
}

async function testDeleteJob() {
  try {
    // Login as employer
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'employer@test.com',
      password: 'Test@123'
    });
    authToken = loginResponse.data.data.token;

    const response = await axios.delete(`${API_URL}/jobs/${jobId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    logTest('Delete Job', response.data.success === true);
  } catch (error) {
    logTest('Delete Job', false, error);
  }
}

async function runTests() {
  console.log('\n========================================');
  console.log('Starting Job Portal API Tests');
  console.log('========================================\n');

  // Feature 1: User Authentication
  console.log('\n--- Feature 1: User Authentication ---');
  await testHealthCheck();
  await testJobSeekerRegistration();
  await testEmployerRegistration();
  await testJobSeekerLogin();
  await testEmployerLogin();
  await testGetCurrentUser();

  // Feature 2: Profile Management
  console.log('\n--- Feature 2: Profile Management ---');
  await testUpdateJobSeekerProfile();
  await testUpdateEmployerProfile();

  // Feature 3: Job Listings
  console.log('\n--- Feature 3: Job Listings ---');
  await testCreateJob();
  await testGetAllJobs();
  await testGetJobById();
  await testUpdateJob();

  // Feature 4: Job Search
  console.log('\n--- Feature 4: Job Search ---');
  await testSearchJobs();

  // Feature 5: Job Application
  console.log('\n--- Feature 5: Job Application ---');
  await testApplyForJob();
  await testGetMyApplications();
  await testGetJobApplications();
  await testUpdateApplicationStatus();

  // Feature 6: Dashboard
  console.log('\n--- Feature 6: Dashboard ---');
  await testEmployerDashboard();
  await testGetJobSeekerDashboard();

  // Cleanup
  console.log('\n--- Cleanup ---');
  await testDeleteJob();

  // Summary
  console.log('\n========================================');
  console.log('Test Summary');
  console.log('========================================');
  console.log(`Total Tests: ${results.tests.length}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.passed / results.tests.length) * 100).toFixed(2)}%`);
  console.log('========================================\n');

  if (results.failed > 0) {
    console.log('Failed Tests:');
    results.tests
      .filter(t => !t.passed)
      .forEach(t => console.log(`  - ${t.name}`));
  }

  process.exit(results.failed > 0 ? 1 : 0);
}

// Wait for server to be ready
setTimeout(() => {
  runTests().catch(console.error);
}, 2000);
