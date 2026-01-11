const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5002/api';

// Test data
let jobSeekerToken = '';
let employerToken = '';
let jobSeekerId = '';
let employerId = '';
let createdJobId = '';
let applicationId = '';

// Utility functions
const log = (message, type = 'info') => {
  const colors = {
    success: '\x1b[32m',
    error: '\x1b[31m',
    info: '\x1b[36m',
    warning: '\x1b[33m',
    reset: '\x1b[0m'
  };
  console.log(`${colors[type]}${message}${colors.reset}`);
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Test functions
async function testHealthCheck() {
  try {
    log('\n=== Testing Health Check ===', 'info');
    const response = await axios.get(`${API_URL}/health`);
    if (response.data.success) {
      log('✓ Health check passed', 'success');
      return true;
    }
    throw new Error('Health check failed');
  } catch (error) {
    log(`✗ Health check failed: ${error.message}`, 'error');
    return false;
  }
}

async function testJobSeekerRegistration() {
  try {
    log('\n=== Testing Job Seeker Registration ===', 'info');
    const timestamp = Date.now();
    const response = await axios.post(`${API_URL}/auth/register`, {
      email: `jobseeker${timestamp}@test.com`,
      password: 'password123',
      role: 'job_seeker',
      fullName: 'Test Job Seeker'
    });
    
    if (response.data.success && response.data.token) {
      jobSeekerToken = response.data.token;
      jobSeekerId = response.data.user.id;
      log('✓ Job Seeker registration successful', 'success');
      log(`  Token: ${jobSeekerToken.substring(0, 20)}...`, 'info');
      log(`  User ID: ${jobSeekerId}`, 'info');
      return true;
    }
    throw new Error('Registration failed');
  } catch (error) {
    log(`✗ Job Seeker registration failed: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
}

async function testEmployerRegistration() {
  try {
    log('\n=== Testing Employer Registration ===', 'info');
    const timestamp = Date.now();
    const response = await axios.post(`${API_URL}/auth/register`, {
      email: `employer${timestamp}@test.com`,
      password: 'password123',
      role: 'employer',
      fullName: 'Test Employer'
    });
    
    if (response.data.success && response.data.token) {
      employerToken = response.data.token;
      employerId = response.data.user.id;
      log('✓ Employer registration successful', 'success');
      log(`  Token: ${employerToken.substring(0, 20)}...`, 'info');
      log(`  User ID: ${employerId}`, 'info');
      return true;
    }
    throw new Error('Registration failed');
  } catch (error) {
    log(`✗ Employer registration failed: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
}

async function testLogin() {
  try {
    log('\n=== Testing Login ===', 'info');
    // We'll use the tokens from registration, but let's verify the login endpoint works
    const timestamp = Date.now();
    const testEmail = `logintest${timestamp}@test.com`;
    
    // Register a test user first
    await axios.post(`${API_URL}/auth/register`, {
      email: testEmail,
      password: 'password123',
      role: 'job_seeker',
      fullName: 'Login Test User'
    });
    
    // Now try to login
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: testEmail,
      password: 'password123'
    });
    
    if (response.data.success && response.data.token) {
      log('✓ Login successful', 'success');
      log(`  Token received: ${response.data.token.substring(0, 20)}...`, 'info');
      return true;
    }
    throw new Error('Login failed');
  } catch (error) {
    log(`✗ Login failed: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
}

async function testGetAuthenticatedUser() {
  try {
    log('\n=== Testing Get Authenticated User ===', 'info');
    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${jobSeekerToken}` }
    });
    
    if (response.data.success && response.data.user) {
      log('✓ Get authenticated user successful', 'success');
      log(`  Email: ${response.data.user.email}`, 'info');
      log(`  Role: ${response.data.user.role}`, 'info');
      return true;
    }
    throw new Error('Get user failed');
  } catch (error) {
    log(`✗ Get authenticated user failed: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
}

async function testJobSeekerProfileManagement() {
  try {
    log('\n=== Testing Job Seeker Profile Management ===', 'info');
    
    // Get initial profile
    log('Getting initial profile...', 'info');
    let response = await axios.get(`${API_URL}/profile/job-seeker`, {
      headers: { Authorization: `Bearer ${jobSeekerToken}` }
    });
    log('✓ Initial profile retrieved', 'success');
    
    // Update profile
    log('Updating profile...', 'info');
    response = await axios.put(`${API_URL}/profile/job-seeker`, {
      fullName: 'Updated Job Seeker Name',
      phone: '1234567890',
      location: 'New York, NY',
      bio: 'I am a software developer with 5 years of experience',
      skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
      experience: [{
        title: 'Software Developer',
        company: 'Tech Corp',
        startDate: '2020-01-01',
        endDate: '2023-12-31',
        description: 'Developed web applications'
      }],
      education: [{
        degree: 'Bachelor of Science',
        institution: 'University of Technology',
        fieldOfStudy: 'Computer Science',
        graduationYear: '2019'
      }]
    }, {
      headers: { Authorization: `Bearer ${jobSeekerToken}` }
    });
    
    if (response.data.success) {
      log('✓ Profile updated successfully', 'success');
      log(`  Full Name: ${response.data.profile.fullName}`, 'info');
      log(`  Skills: ${response.data.profile.skills?.join(', ')}`, 'info');
      return true;
    }
    throw new Error('Profile update failed');
  } catch (error) {
    log(`✗ Job Seeker profile management failed: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
}

async function testEmployerProfileManagement() {
  try {
    log('\n=== Testing Employer Profile Management ===', 'info');
    
    // Get initial profile
    log('Getting initial profile...', 'info');
    let response = await axios.get(`${API_URL}/profile/employer`, {
      headers: { Authorization: `Bearer ${employerToken}` }
    });
    log('✓ Initial profile retrieved', 'success');
    
    // Update profile
    log('Updating profile...', 'info');
    response = await axios.put(`${API_URL}/profile/employer`, {
      companyName: 'Tech Innovations Inc',
      companyDescription: 'We are a leading technology company',
      website: 'https://techinnovations.com',
      location: 'San Francisco, CA',
      phone: '9876543210'
    }, {
      headers: { Authorization: `Bearer ${employerToken}` }
    });
    
    if (response.data.success) {
      log('✓ Employer profile updated successfully', 'success');
      log(`  Company: ${response.data.profile.companyName}`, 'info');
      log(`  Location: ${response.data.profile.location}`, 'info');
      return true;
    }
    throw new Error('Employer profile update failed');
  } catch (error) {
    log(`✗ Employer profile management failed: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
}

async function testJobCreation() {
  try {
    log('\n=== Testing Job Creation ===', 'info');
    const response = await axios.post(`${API_URL}/jobs`, {
      title: 'Senior Full Stack Developer',
      description: 'We are looking for an experienced full stack developer to join our team.',
      qualifications: ['5+ years of experience', 'Proficient in React and Node.js', 'Strong problem-solving skills'],
      responsibilities: ['Develop and maintain web applications', 'Collaborate with team members', 'Write clean, maintainable code'],
      location: 'San Francisco, CA',
      jobType: 'full-time',
      salaryRange: {
        min: 100000,
        max: 150000,
        currency: 'USD'
      }
    }, {
      headers: { Authorization: `Bearer ${employerToken}` }
    });
    
    if (response.data.success && response.data.job) {
      createdJobId = response.data.job.id;
      log('✓ Job created successfully', 'success');
      log(`  Job ID: ${createdJobId}`, 'info');
      log(`  Title: ${response.data.job.title}`, 'info');
      return true;
    }
    throw new Error('Job creation failed');
  } catch (error) {
    log(`✗ Job creation failed: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
}

async function testJobListing() {
  try {
    log('\n=== Testing Job Listing ===', 'info');
    const response = await axios.get(`${API_URL}/jobs`);
    
    if (response.data.success && Array.isArray(response.data.jobs)) {
      log('✓ Job listing retrieved successfully', 'success');
      log(`  Total jobs: ${response.data.pagination?.total || response.data.jobs.length}`, 'info');
      if (response.data.jobs.length > 0) {
        log(`  First job: ${response.data.jobs[0].title}`, 'info');
      }
      return true;
    }
    throw new Error('Job listing failed');
  } catch (error) {
    log(`✗ Job listing failed: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
}

async function testJobSearch() {
  try {
    log('\n=== Testing Job Search with Filters ===', 'info');
    
    // Test keyword search
    log('Testing keyword search...', 'info');
    let response = await axios.get(`${API_URL}/jobs?keyword=developer`);
    if (response.data.success) {
      log(`✓ Keyword search successful (found ${response.data.jobs?.length || 0} jobs)`, 'success');
    }
    
    // Test location filter
    log('Testing location filter...', 'info');
    response = await axios.get(`${API_URL}/jobs?location=San Francisco`);
    if (response.data.success) {
      log(`✓ Location filter successful (found ${response.data.jobs?.length || 0} jobs)`, 'success');
    }
    
    // Test job type filter
    log('Testing job type filter...', 'info');
    response = await axios.get(`${API_URL}/jobs?jobType=full-time`);
    if (response.data.success) {
      log(`✓ Job type filter successful (found ${response.data.jobs?.length || 0} jobs)`, 'success');
    }
    
    return true;
  } catch (error) {
    log(`✗ Job search failed: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
}

async function testJobDetail() {
  try {
    log('\n=== Testing Job Detail ===', 'info');
    const response = await axios.get(`${API_URL}/jobs/${createdJobId}`);
    
    if (response.data.success && response.data.job) {
      log('✓ Job detail retrieved successfully', 'success');
      log(`  Title: ${response.data.job.title}`, 'info');
      log(`  Location: ${response.data.job.location}`, 'info');
      return true;
    }
    throw new Error('Job detail retrieval failed');
  } catch (error) {
    log(`✗ Job detail failed: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
}

async function testJobUpdate() {
  try {
    log('\n=== Testing Job Update ===', 'info');
    const response = await axios.put(`${API_URL}/jobs/${createdJobId}`, {
      title: 'Senior Full Stack Developer (Updated)',
      description: 'Updated job description',
      location: 'Remote',
      salaryRange: {
        min: 120000,
        max: 180000,
        currency: 'USD'
      }
    }, {
      headers: { Authorization: `Bearer ${employerToken}` }
    });
    
    if (response.data.success) {
      log('✓ Job updated successfully', 'success');
      log(`  Updated title: ${response.data.job.title}`, 'info');
      return true;
    }
    throw new Error('Job update failed');
  } catch (error) {
    log(`✗ Job update failed: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
}

async function testJobApplication() {
  try {
    log('\n=== Testing Job Application ===', 'info');
    const response = await axios.post(`${API_URL}/applications`, {
      jobId: createdJobId,
      coverLetter: 'I am very interested in this position and believe I would be a great fit.'
    }, {
      headers: { Authorization: `Bearer ${jobSeekerToken}` }
    });
    
    if (response.data.success && response.data.application) {
      applicationId = response.data.application.id;
      log('✓ Job application submitted successfully', 'success');
      log(`  Application ID: ${applicationId}`, 'info');
      log(`  Status: ${response.data.application.status}`, 'info');
      return true;
    }
    throw new Error('Job application failed');
  } catch (error) {
    log(`✗ Job application failed: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
}

async function testMyApplications() {
  try {
    log('\n=== Testing My Applications ===', 'info');
    const response = await axios.get(`${API_URL}/applications/my-applications`, {
      headers: { Authorization: `Bearer ${jobSeekerToken}` }
    });
    
    if (response.data.success && Array.isArray(response.data.applications)) {
      log('✓ Applications retrieved successfully', 'success');
      log(`  Total applications: ${response.data.applications.length}`, 'info');
      if (response.data.applications.length > 0) {
        log(`  First application status: ${response.data.applications[0].status}`, 'info');
      }
      return true;
    }
    throw new Error('Get applications failed');
  } catch (error) {
    log(`✗ Get my applications failed: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
}

async function testJobApplicationsByEmployer() {
  try {
    log('\n=== Testing Job Applications (Employer View) ===', 'info');
    const response = await axios.get(`${API_URL}/applications/job/${createdJobId}`, {
      headers: { Authorization: `Bearer ${employerToken}` }
    });
    
    if (response.data.success && Array.isArray(response.data.applications)) {
      log('✓ Job applications retrieved successfully', 'success');
      log(`  Total applications: ${response.data.applications.length}`, 'info');
      return true;
    }
    throw new Error('Get job applications failed');
  } catch (error) {
    log(`✗ Get job applications failed: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
}

async function testApplicationStatusUpdate() {
  try {
    log('\n=== Testing Application Status Update ===', 'info');
    const response = await axios.put(`${API_URL}/applications/${applicationId}/status`, {
      status: 'reviewed'
    }, {
      headers: { Authorization: `Bearer ${employerToken}` }
    });
    
    if (response.data.success) {
      log('✓ Application status updated successfully', 'success');
      log(`  New status: ${response.data.application.status}`, 'info');
      return true;
    }
    throw new Error('Status update failed');
  } catch (error) {
    log(`✗ Application status update failed: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
}

async function testJobSeekerDashboard() {
  try {
    log('\n=== Testing Job Seeker Dashboard ===', 'info');
    const response = await axios.get(`${API_URL}/dashboard/job-seeker`, {
      headers: { Authorization: `Bearer ${jobSeekerToken}` }
    });
    
    if (response.data.success && response.data.dashboard) {
      log('✓ Job seeker dashboard retrieved successfully', 'success');
      log(`  Total applications: ${response.data.dashboard.totalApplications || 0}`, 'info');
      log(`  Profile completion: ${response.data.dashboard.profileCompletion || 0}%`, 'info');
      return true;
    }
    throw new Error('Dashboard retrieval failed');
  } catch (error) {
    log(`✗ Job seeker dashboard failed: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
}

async function testEmployerDashboard() {
  try {
    log('\n=== Testing Employer Dashboard ===', 'info');
    const response = await axios.get(`${API_URL}/dashboard/employer`, {
      headers: { Authorization: `Bearer ${employerToken}` }
    });
    
    if (response.data.success && response.data.dashboard) {
      log('✓ Employer dashboard retrieved successfully', 'success');
      log(`  Total jobs: ${response.data.dashboard.totalJobs || 0}`, 'info');
      log(`  Total applications: ${response.data.dashboard.totalApplications || 0}`, 'info');
      return true;
    }
    throw new Error('Dashboard retrieval failed');
  } catch (error) {
    log(`✗ Employer dashboard failed: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
}

async function testGetMyJobs() {
  try {
    log('\n=== Testing Get My Jobs (Employer) ===', 'info');
    const response = await axios.get(`${API_URL}/jobs/employer/my-jobs`, {
      headers: { Authorization: `Bearer ${employerToken}` }
    });
    
    if (response.data.success && Array.isArray(response.data.jobs)) {
      log('✓ My jobs retrieved successfully', 'success');
      log(`  Total jobs: ${response.data.jobs.length}`, 'info');
      return true;
    }
    throw new Error('Get my jobs failed');
  } catch (error) {
    log(`✗ Get my jobs failed: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
}

async function testJobDeletion() {
  try {
    log('\n=== Testing Job Deletion ===', 'info');
    
    // Create a job to delete
    const createResponse = await axios.post(`${API_URL}/jobs`, {
      title: 'Job to Delete',
      description: 'This job will be deleted',
      location: 'Test Location',
      jobType: 'contract'
    }, {
      headers: { Authorization: `Bearer ${employerToken}` }
    });
    
    const jobToDelete = createResponse.data.job.id;
    
    // Delete the job
    const response = await axios.delete(`${API_URL}/jobs/${jobToDelete}`, {
      headers: { Authorization: `Bearer ${employerToken}` }
    });
    
    if (response.data.success) {
      log('✓ Job deleted successfully', 'success');
      return true;
    }
    throw new Error('Job deletion failed');
  } catch (error) {
    log(`✗ Job deletion failed: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
}

async function testWithdrawApplication() {
  try {
    log('\n=== Testing Withdraw Application ===', 'info');
    
    // Create a new application to withdraw
    const createResponse = await axios.post(`${API_URL}/applications`, {
      jobId: createdJobId,
      coverLetter: 'Application to be withdrawn'
    }, {
      headers: { Authorization: `Bearer ${jobSeekerToken}` }
    });
    
    const appToWithdraw = createResponse.data.application.id;
    
    // Withdraw the application
    const response = await axios.delete(`${API_URL}/applications/${appToWithdraw}`, {
      headers: { Authorization: `Bearer ${jobSeekerToken}` }
    });
    
    if (response.data.success) {
      log('✓ Application withdrawn successfully', 'success');
      return true;
    }
    throw new Error('Application withdrawal failed');
  } catch (error) {
    log(`✗ Application withdrawal failed: ${error.response?.data?.message || error.message}`, 'error');
    return false;
  }
}

// Main test runner
async function runAllTests() {
  log('\n╔═══════════════════════════════════════════════════════════════╗', 'info');
  log('║         JOB PORTAL - COMPREHENSIVE FEATURE TEST              ║', 'info');
  log('╚═══════════════════════════════════════════════════════════════╝', 'info');
  
  const results = {
    passed: 0,
    failed: 0,
    total: 0
  };
  
  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'Job Seeker Registration', fn: testJobSeekerRegistration },
    { name: 'Employer Registration', fn: testEmployerRegistration },
    { name: 'Login', fn: testLogin },
    { name: 'Get Authenticated User', fn: testGetAuthenticatedUser },
    { name: 'Job Seeker Profile Management', fn: testJobSeekerProfileManagement },
    { name: 'Employer Profile Management', fn: testEmployerProfileManagement },
    { name: 'Job Creation', fn: testJobCreation },
    { name: 'Job Listing', fn: testJobListing },
    { name: 'Job Search', fn: testJobSearch },
    { name: 'Job Detail', fn: testJobDetail },
    { name: 'Job Update', fn: testJobUpdate },
    { name: 'Job Application', fn: testJobApplication },
    { name: 'My Applications', fn: testMyApplications },
    { name: 'Job Applications by Employer', fn: testJobApplicationsByEmployer },
    { name: 'Application Status Update', fn: testApplicationStatusUpdate },
    { name: 'Job Seeker Dashboard', fn: testJobSeekerDashboard },
    { name: 'Employer Dashboard', fn: testEmployerDashboard },
    { name: 'Get My Jobs', fn: testGetMyJobs },
    { name: 'Job Deletion', fn: testJobDeletion },
    { name: 'Withdraw Application', fn: testWithdrawApplication }
  ];
  
  for (const test of tests) {
    results.total++;
    const passed = await test.fn();
    if (passed) {
      results.passed++;
    } else {
      results.failed++;
    }
    await delay(500); // Small delay between tests
  }
  
  // Print summary
  log('\n╔═══════════════════════════════════════════════════════════════╗', 'info');
  log('║                        TEST SUMMARY                           ║', 'info');
  log('╚═══════════════════════════════════════════════════════════════╝', 'info');
  log(`\nTotal Tests: ${results.total}`, 'info');
  log(`Passed: ${results.passed}`, 'success');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'error' : 'success');
  log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(2)}%\n`, 
    results.failed > 0 ? 'warning' : 'success');
  
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  log(`\n✗ Test runner failed: ${error.message}`, 'error');
  console.error(error);
  process.exit(1);
});
