const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE_URL = 'http://localhost:5001/api';

// Test data
const testJobSeeker = {
  email: `jobseeker_${Date.now()}@test.com`,
  password: 'Password123!',
  firstName: 'John',
  lastName: 'Doe',
  role: 'jobseeker'
};

const testEmployer = {
  email: `employer_${Date.now()}@test.com`,
  password: 'Password123!',
  companyName: 'Tech Corp Inc.',
  role: 'employer'
};

let jobSeekerToken = '';
let employerToken = '';
let createdJobId = '';
let applicationId = '';

// Helper function to log test results
function logTest(testName, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`\n${status} - ${testName}`);
  if (details) console.log(`   ${details}`);
}

// Helper function to make API calls
async function apiCall(method, endpoint, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: {}
    };
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
}

// Test 1: User Registration - Job Seeker
async function testJobSeekerRegistration() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 1: JOB SEEKER REGISTRATION');
  console.log('='.repeat(60));
  
  const result = await apiCall('POST', '/auth/register', testJobSeeker);
  logTest('Job Seeker Registration', result.success, 
    result.success ? `User created: ${result.data.user?.email}` : result.error.message);
  
  if (result.success && result.data.data && result.data.data.token) {
    jobSeekerToken = result.data.data.token;
    console.log(`   Token captured: ${jobSeekerToken.substring(0, 20)}...`);
  } else {
    console.log('   WARNING: No token received');
  }
  
  return result.success;
}

// Test 2: User Registration - Employer
async function testEmployerRegistration() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 2: EMPLOYER REGISTRATION');
  console.log('='.repeat(60));
  
  const result = await apiCall('POST', '/auth/register', testEmployer);
  logTest('Employer Registration', result.success,
    result.success ? `User created: ${result.data.user?.email}` : result.error.message);
  
  if (result.success && result.data.data && result.data.data.token) {
    employerToken = result.data.data.token;
    console.log(`   Token captured: ${employerToken.substring(0, 20)}...`);
  } else {
    console.log('   WARNING: No token received');
  }
  
  return result.success;
}

// Test 3: User Login - Job Seeker
async function testJobSeekerLogin() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 3: JOB SEEKER LOGIN');
  console.log('='.repeat(60));
  
  const result = await apiCall('POST', '/auth/login', {
    email: testJobSeeker.email,
    password: testJobSeeker.password
  });
  
  logTest('Job Seeker Login', result.success,
    result.success ? 'Login successful' : result.error.message);
  
  if (result.success && result.data.data && result.data.data.token) {
    jobSeekerToken = result.data.data.token;
    console.log(`   Token captured: ${jobSeekerToken.substring(0, 20)}...`);
  } else {
    console.log('   WARNING: No token received');
  }
  
  return result.success;
}

// Test 4: User Login - Employer
async function testEmployerLogin() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 4: EMPLOYER LOGIN');
  console.log('='.repeat(60));
  
  const result = await apiCall('POST', '/auth/login', {
    email: testEmployer.email,
    password: testEmployer.password
  });
  
  logTest('Employer Login', result.success,
    result.success ? 'Login successful' : result.error.message);
  
  if (result.success && result.data.data && result.data.data.token) {
    employerToken = result.data.data.token;
    console.log(`   Token captured: ${employerToken.substring(0, 20)}...`);
  } else {
    console.log('   WARNING: No token received');
  }
  
  return result.success;
}

// Test 5: Create Job Seeker Profile
async function testCreateJobSeekerProfile() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 5: CREATE JOB SEEKER PROFILE');
  console.log('='.repeat(60));
  
  const profileData = {
    phone: '1234567890',
    location: 'New York, NY',
    bio: 'Experienced software developer',
    skills: ['JavaScript', 'React', 'Node.js'],
    experience: '5 years',
    education: 'Bachelor in Computer Science'
  };
  
  const result = await apiCall('POST', '/users/profile/jobseeker', profileData, jobSeekerToken);
  logTest('Create Job Seeker Profile', result.success,
    result.success ? 'Profile created successfully' : result.error.message);
  
  return result.success;
}

// Test 6: Create Employer Profile
async function testCreateEmployerProfile() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 6: CREATE EMPLOYER PROFILE');
  console.log('='.repeat(60));
  
  const profileData = {
    companyName: 'Tech Corp Inc.',
    companyDescription: 'Leading technology company',
    website: 'https://techcorp.com',
    location: 'San Francisco, CA',
    industry: 'Technology',
    companySize: '100-500'
  };
  
  const result = await apiCall('POST', '/users/profile/employer', profileData, employerToken);
  logTest('Create Employer Profile', result.success,
    result.success ? 'Employer profile created' : result.error.message);
  
  return result.success;
}

// Test 7: Get User Profile - Job Seeker
async function testGetJobSeekerProfile() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 7: GET JOB SEEKER PROFILE');
  console.log('='.repeat(60));
  
  const result = await apiCall('GET', '/users/profile', null, jobSeekerToken);
  logTest('Get Job Seeker Profile', result.success,
    result.success ? `Profile retrieved for ${result.data.profile?.firstName}` : result.error.message);
  
  return result.success;
}

// Test 8: Get User Profile - Employer
async function testGetEmployerProfile() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 8: GET EMPLOYER PROFILE');
  console.log('='.repeat(60));
  
  const result = await apiCall('GET', '/users/profile', null, employerToken);
  logTest('Get Employer Profile', result.success,
    result.success ? `Profile retrieved for ${result.data.profile?.companyName}` : result.error.message);
  
  return result.success;
}

// Test 9: Create Job Listing
async function testCreateJob() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 9: CREATE JOB LISTING');
  console.log('='.repeat(60));
  
  const jobData = {
    title: 'Senior Software Engineer',
    description: 'We are looking for an experienced software engineer to join our team.',
    requirements: ['5+ years experience', 'Strong JavaScript skills', 'React expertise'],
    responsibilities: ['Lead development', 'Code reviews', 'Mentoring'],
    location: 'San Francisco, CA',
    jobType: 'Full-time',
    salaryRange: {
      min: 120000,
      max: 180000
    },
    experienceLevel: 'Senior',
    category: 'Software Development'
  };
  
  const result = await apiCall('POST', '/jobs', jobData, employerToken);
  logTest('Create Job Listing', result.success,
    result.success ? `Job created: ${result.data.job?.title}` : result.error.message);
  
  if (result.success && result.data.job) {
    createdJobId = result.data.job._id || result.data.job.id;
  }
  
  return result.success;
}

// Test 10: Get All Job Listings
async function testGetAllJobs() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 10: GET ALL JOB LISTINGS');
  console.log('='.repeat(60));
  
  const result = await apiCall('GET', '/jobs');
  logTest('Get All Jobs', result.success,
    result.success ? `Retrieved ${result.data.jobs?.length || 0} jobs` : result.error.message);
  
  return result.success;
}

// Test 11: Get Single Job Details
async function testGetJobDetails() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 11: GET JOB DETAILS');
  console.log('='.repeat(60));
  
  if (!createdJobId) {
    logTest('Get Job Details', false, 'No job ID available');
    return false;
  }
  
  const result = await apiCall('GET', `/jobs/${createdJobId}`);
  logTest('Get Job Details', result.success,
    result.success ? `Retrieved job: ${result.data.job?.title}` : result.error.message);
  
  return result.success;
}

// Test 12: Search Jobs
async function testSearchJobs() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 12: SEARCH JOBS');
  console.log('='.repeat(60));
  
  const result = await apiCall('GET', '/jobs?keyword=software&location=San Francisco');
  logTest('Search Jobs', result.success,
    result.success ? `Found ${result.data.jobs?.length || 0} matching jobs` : result.error.message);
  
  return result.success;
}

// Test 13: Update Job Listing
async function testUpdateJob() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 13: UPDATE JOB LISTING');
  console.log('='.repeat(60));
  
  if (!createdJobId) {
    logTest('Update Job', false, 'No job ID available');
    return false;
  }
  
  const updateData = {
    description: 'Updated: We are looking for an exceptional software engineer.',
    salaryRange: {
      min: 130000,
      max: 190000
    }
  };
  
  const result = await apiCall('PUT', `/jobs/${createdJobId}`, updateData, employerToken);
  logTest('Update Job', result.success,
    result.success ? 'Job updated successfully' : result.error.message);
  
  return result.success;
}

// Test 14: Apply for Job
async function testApplyForJob() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 14: APPLY FOR JOB');
  console.log('='.repeat(60));
  
  if (!createdJobId) {
    logTest('Apply for Job', false, 'No job ID available');
    return false;
  }
  
  const applicationData = {
    coverLetter: 'I am very interested in this position and believe I would be a great fit.',
    additionalInfo: 'Available to start immediately'
  };
  
  const result = await apiCall('POST', `/applications/apply/${createdJobId}`, applicationData, jobSeekerToken);
  logTest('Apply for Job', result.success,
    result.success ? 'Application submitted successfully' : result.error.message);
  
  if (result.success && result.data.application) {
    applicationId = result.data.application._id || result.data.application.id;
  }
  
  return result.success;
}

// Test 15: Get Job Applications (Employer View)
async function testGetJobApplications() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 15: GET JOB APPLICATIONS (EMPLOYER)');
  console.log('='.repeat(60));
  
  if (!createdJobId) {
    logTest('Get Job Applications', false, 'No job ID available');
    return false;
  }
  
  const result = await apiCall('GET', `/applications/job/${createdJobId}`, null, employerToken);
  logTest('Get Job Applications', result.success,
    result.success ? `Retrieved ${result.data.applications?.length || 0} applications` : result.error.message);
  
  return result.success;
}

// Test 16: Get My Applications (Job Seeker View)
async function testGetMyApplications() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 16: GET MY APPLICATIONS (JOB SEEKER)');
  console.log('='.repeat(60));
  
  const result = await apiCall('GET', '/applications/my-applications', null, jobSeekerToken);
  logTest('Get My Applications', result.success,
    result.success ? `Retrieved ${result.data.applications?.length || 0} applications` : result.error.message);
  
  return result.success;
}

// Test 17: Update Application Status
async function testUpdateApplicationStatus() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 17: UPDATE APPLICATION STATUS');
  console.log('='.repeat(60));
  
  if (!applicationId) {
    logTest('Update Application Status', false, 'No application ID available');
    return false;
  }
  
  const result = await apiCall('PATCH', `/applications/${applicationId}/status`, 
    { status: 'reviewed' }, employerToken);
  logTest('Update Application Status', result.success,
    result.success ? 'Application status updated' : result.error.message);
  
  return result.success;
}

// Test 18: Get Employer Dashboard Stats
async function testEmployerDashboard() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 18: EMPLOYER DASHBOARD');
  console.log('='.repeat(60));
  
  const result = await apiCall('GET', '/users/dashboard/employer', null, employerToken);
  logTest('Employer Dashboard', result.success,
    result.success ? `Stats retrieved: ${result.data.stats?.totalJobs || 0} jobs` : result.error.message);
  
  return result.success;
}

// Test 19: Get Job Seeker Dashboard Stats
async function testJobSeekerDashboard() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 19: JOB SEEKER DASHBOARD');
  console.log('='.repeat(60));
  
  const result = await apiCall('GET', '/users/dashboard/jobseeker', null, jobSeekerToken);
  logTest('Job Seeker Dashboard', result.success,
    result.success ? `Stats retrieved: ${result.data.stats?.totalApplications || 0} applications` : result.error.message);
  
  return result.success;
}

// Test 20: Delete Job Listing
async function testDeleteJob() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST 20: DELETE JOB LISTING');
  console.log('='.repeat(60));
  
  if (!createdJobId) {
    logTest('Delete Job', false, 'No job ID available');
    return false;
  }
  
  const result = await apiCall('DELETE', `/jobs/${createdJobId}`, null, employerToken);
  logTest('Delete Job', result.success,
    result.success ? 'Job deleted successfully' : result.error.message);
  
  return result.success;
}

// Main test execution
async function runAllTests() {
  console.log('\n' + '='.repeat(60));
  console.log('STARTING COMPREHENSIVE JOB PORTAL API TESTS');
  console.log('='.repeat(60));
  
  const tests = [
    testJobSeekerRegistration,
    testEmployerRegistration,
    testJobSeekerLogin,
    testEmployerLogin,
    testCreateJobSeekerProfile,
    testCreateEmployerProfile,
    testGetJobSeekerProfile,
    testGetEmployerProfile,
    testCreateJob,
    testGetAllJobs,
    testGetJobDetails,
    testSearchJobs,
    testUpdateJob,
    testApplyForJob,
    testGetJobApplications,
    testGetMyApplications,
    testUpdateApplicationStatus,
    testEmployerDashboard,
    testJobSeekerDashboard,
    testDeleteJob
  ];
  
  let passedTests = 0;
  let failedTests = 0;
  
  for (const test of tests) {
    try {
      const result = await test();
      if (result) {
        passedTests++;
      } else {
        failedTests++;
      }
    } catch (error) {
      console.error(`\n❌ Test execution error: ${error.message}`);
      failedTests++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${tests.length}`);
  console.log(`Passed: ${passedTests} ✅`);
  console.log(`Failed: ${failedTests} ❌`);
  console.log(`Success Rate: ${((passedTests / tests.length) * 100).toFixed(2)}%`);
  console.log('='.repeat(60) + '\n');
}

// Run the tests
runAllTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
