const axios = require('axios');

const API_URL = 'http://localhost:5002/api';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  tests: [],
};

// Helper function to log test results
function logTest(testName, passed, message = '') {
  const status = passed ? `${colors.green}✓ PASSED${colors.reset}` : `${colors.red}✗ FAILED${colors.reset}`;
  console.log(`${status} - ${testName}`);
  if (message) {
    console.log(`  ${colors.yellow}${message}${colors.reset}`);
  }
  
  testResults.tests.push({ testName, passed, message });
  if (passed) testResults.passed++;
  else testResults.failed++;
}

// Helper function to create delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Test data
let jobSeekerToken = null;
let employerToken = null;
let jobSeekerId = null;
let employerId = null;
let jobId = null;
let applicationId = null;

const jobSeekerData = {
  email: `jobseeker_${Date.now()}@test.com`,
  password: 'Password123!',
  role: 'job_seeker',
};

const employerData = {
  email: `employer_${Date.now()}@test.com`,
  password: 'Password123!',
  role: 'employer',
};

// Feature 1: User Authentication Tests
async function testUserAuthentication() {
  console.log(`\n${colors.cyan}=== Testing Feature 1: User Authentication ===${colors.reset}\n`);

  try {
    // Test 1.1: Job Seeker Registration
    console.log('Test 1.1: Job Seeker Registration');
    const registerJobSeekerRes = await axios.post(`${API_URL}/auth/register`, jobSeekerData);
    const regSuccess = registerJobSeekerRes.data.status === 'success' && registerJobSeekerRes.data.data?.user?.id;
    logTest(
      'Job Seeker Registration',
      regSuccess,
      `User ID: ${registerJobSeekerRes.data.data?.user?.id}`
    );
    jobSeekerId = registerJobSeekerRes.data.data?.user?.id;

    // Test 1.2: Employer Registration
    console.log('\nTest 1.2: Employer Registration');
    const registerEmployerRes = await axios.post(`${API_URL}/auth/register`, employerData);
    const empRegSuccess = registerEmployerRes.data.status === 'success' && registerEmployerRes.data.data?.user?.id;
    logTest(
      'Employer Registration',
      empRegSuccess,
      `User ID: ${registerEmployerRes.data.data?.user?.id}`
    );
    employerId = registerEmployerRes.data.data?.user?.id;

    // Test 1.3: Job Seeker Login
    console.log('\nTest 1.3: Job Seeker Login');
    const loginJobSeekerRes = await axios.post(`${API_URL}/auth/login`, {
      email: jobSeekerData.email,
      password: jobSeekerData.password,
    });
    const jsLoginSuccess = loginJobSeekerRes.data.status === 'success' && loginJobSeekerRes.data.data?.token;
    logTest(
      'Job Seeker Login',
      jsLoginSuccess,
      'Token received'
    );
    jobSeekerToken = loginJobSeekerRes.data.data?.token;

    // Test 1.4: Employer Login
    console.log('\nTest 1.4: Employer Login');
    const loginEmployerRes = await axios.post(`${API_URL}/auth/login`, {
      email: employerData.email,
      password: employerData.password,
    });
    const empLoginSuccess = loginEmployerRes.data.status === 'success' && loginEmployerRes.data.data?.token;
    logTest(
      'Employer Login',
      empLoginSuccess,
      'Token received'
    );
    employerToken = loginEmployerRes.data.data?.token;

    // Test 1.5: Get Current User (Job Seeker)
    console.log('\nTest 1.5: Get Current User (Job Seeker)');
    const getCurrentUserRes = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${jobSeekerToken}` },
    });
    const getMeSuccess = getCurrentUserRes.data.status === 'success' && getCurrentUserRes.data.data?.user?.role === 'job_seeker';
    logTest(
      'Get Current User',
      getMeSuccess,
      `Role: ${getCurrentUserRes.data.data?.user?.role}`
    );

  } catch (error) {
    logTest('User Authentication Tests', false, error.response?.data?.error?.message || error.message);
  }
}

// Feature 2: Profile Management Tests
async function testProfileManagement() {
  console.log(`\n${colors.cyan}=== Testing Feature 2: Profile Management ===${colors.reset}\n`);

  try {
    // Test 2.1: Create/Update Job Seeker Profile
    console.log('Test 2.1: Create/Update Job Seeker Profile');
    const jobSeekerProfileData = {
      fullName: 'John Doe',
      phone: '+1234567890',
      location: 'New York, NY',
      skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
      experience: '3 years of software development experience',
      education: 'Bachelor of Science in Computer Science',
      bio: 'Passionate software developer looking for new opportunities',
    };

    const updateJobSeekerProfileRes = await axios.put(
      `${API_URL}/profile/job-seeker`,
      jobSeekerProfileData,
      {
        headers: { Authorization: `Bearer ${jobSeekerToken}` },
      }
    );
    const updateSuccess = updateJobSeekerProfileRes.data.status === 'success';
    logTest(
      'Job Seeker Profile Update',
      updateSuccess,
      `Profile created with name: ${jobSeekerProfileData.fullName}`
    );

    // Test 2.2: Get Job Seeker Profile
    console.log('\nTest 2.2: Get Job Seeker Profile');
    const getJobSeekerProfileRes = await axios.get(`${API_URL}/profile/job-seeker`, {
      headers: { Authorization: `Bearer ${jobSeekerToken}` },
    });
    const getSuccess = getJobSeekerProfileRes.data.status === 'success' && 
      getJobSeekerProfileRes.data.data?.fullName === jobSeekerProfileData.fullName;
    logTest(
      'Get Job Seeker Profile',
      getSuccess,
      `Skills: ${getJobSeekerProfileRes.data.data?.skills?.join(', ') || 'None'}`
    );

    // Test 2.3: Create/Update Employer Profile
    console.log('\nTest 2.3: Create/Update Employer Profile');
    const employerProfileData = {
      companyName: 'Tech Innovations Inc',
      phone: '+1987654321',
      companyWebsite: 'https://techinnovations.com',
      location: 'San Francisco, CA',
      description: 'Leading technology company specializing in innovative solutions',
      industry: 'Technology',
      companySize: '100-500',
    };

    const updateEmployerProfileRes = await axios.put(
      `${API_URL}/profile/employer`,
      employerProfileData,
      {
        headers: { Authorization: `Bearer ${employerToken}` },
      }
    );
    const empUpdateSuccess = updateEmployerProfileRes.data.status === 'success';
    logTest(
      'Employer Profile Update',
      empUpdateSuccess,
      `Company: ${employerProfileData.companyName}`
    );

    // Test 2.4: Get Employer Profile
    console.log('\nTest 2.4: Get Employer Profile');
    const getEmployerProfileRes = await axios.get(`${API_URL}/profile/employer`, {
      headers: { Authorization: `Bearer ${employerToken}` },
    });
    const empGetSuccess = getEmployerProfileRes.data.status === 'success' && 
      getEmployerProfileRes.data.data?.companyName === employerProfileData.companyName;
    logTest(
      'Get Employer Profile',
      empGetSuccess,
      `Industry: ${getEmployerProfileRes.data.data?.industry || 'None'}`
    );

  } catch (error) {
    logTest('Profile Management Tests', false, error.response?.data?.error?.message || error.message);
  }
}

// Feature 3: Job Listings Tests
async function testJobListings() {
  console.log(`\n${colors.cyan}=== Testing Feature 3: Job Listings ===${colors.reset}\n`);

  try {
    // Test 3.1: Create Job Listing
    console.log('Test 3.1: Create Job Listing');
    const jobData = {
      title: 'Senior Full Stack Developer',
      description: 'We are looking for an experienced Full Stack Developer to join our team.',
      qualifications: 'Bachelor\'s degree in Computer Science, 5+ years of experience',
      responsibilities: 'Develop and maintain web applications, collaborate with team members',
      jobType: 'full-time',
      location: 'San Francisco, CA',
      salaryMin: 100000,
      salaryMax: 150000,
      salaryPeriod: 'yearly',
      experienceLevel: 'senior',
      skills: 'React, Node.js, MongoDB, AWS',
      benefits: 'Health insurance, 401k, Remote work options',
      status: 'active',
    };

    const createJobRes = await axios.post(`${API_URL}/jobs`, jobData, {
      headers: { Authorization: `Bearer ${employerToken}` },
    });
    const createSuccess = createJobRes.data.status === 'success' && createJobRes.data.data?.id;
    logTest(
      'Create Job Listing',
      createSuccess,
      `Job ID: ${createJobRes.data.data?.id}`
    );
    jobId = createJobRes.data.data?.id;

    // Test 3.2: Get All Job Listings
    console.log('\nTest 3.2: Get All Job Listings');
    const getAllJobsRes = await axios.get(`${API_URL}/jobs`);
    const getAllSuccess = getAllJobsRes.data.status === 'success' && getAllJobsRes.data.data?.length > 0;
    logTest(
      'Get All Job Listings',
      getAllSuccess,
      `Total jobs: ${getAllJobsRes.data.data?.length || 0}`
    );

    // Test 3.3: Get Single Job Listing
    console.log('\nTest 3.3: Get Single Job Listing');
    const getJobRes = await axios.get(`${API_URL}/jobs/${jobId}`);
    const getSingleSuccess = getJobRes.data.status === 'success' && getJobRes.data.data?.id === jobId;
    logTest(
      'Get Single Job Listing',
      getSingleSuccess,
      `Title: ${getJobRes.data.data?.title}`
    );

    // Test 3.4: Update Job Listing
    console.log('\nTest 3.4: Update Job Listing');
    const updatedJobData = {
      title: 'Lead Full Stack Developer',
      description: 'Updated description for the position',
    };

    const updateJobRes = await axios.put(`${API_URL}/jobs/${jobId}`, updatedJobData, {
      headers: { Authorization: `Bearer ${employerToken}` },
    });
    const updateJobSuccess = updateJobRes.data.status === 'success' && updateJobRes.data.data?.title === updatedJobData.title;
    logTest(
      'Update Job Listing',
      updateJobSuccess,
      `Updated title: ${updatedJobData.title}`
    );

    // Test 3.5: Get My Jobs (Employer)
    console.log('\nTest 3.5: Get My Jobs (Employer)');
    const getMyJobsRes = await axios.get(`${API_URL}/jobs/my-jobs`, {
      headers: { Authorization: `Bearer ${employerToken}` },
    });
    const myJobsSuccess = getMyJobsRes.data.status === 'success' && getMyJobsRes.data.data?.length > 0;
    logTest(
      'Get My Jobs (Employer)',
      myJobsSuccess,
      `My jobs count: ${getMyJobsRes.data.data?.length || 0}`
    );

  } catch (error) {
    logTest('Job Listings Tests', false, error.response?.data?.error?.message || error.message);
  }
}

// Feature 4: Job Search Tests
async function testJobSearch() {
  console.log(`\n${colors.cyan}=== Testing Feature 4: Job Search ===${colors.reset}\n`);

  try {
    // Test 4.1: Search Jobs by Keyword
    console.log('Test 4.1: Search Jobs by Keyword');
    const searchByKeywordRes = await axios.get(`${API_URL}/jobs?search=Full Stack`);
    const searchSuccess = searchByKeywordRes.data.status === 'success';
    logTest(
      'Search Jobs by Keyword',
      searchSuccess,
      `Results: ${searchByKeywordRes.data.data?.length || 0} jobs found`
    );

    // Test 4.2: Filter Jobs by Type
    console.log('\nTest 4.2: Filter Jobs by Type');
    const filterByTypeRes = await axios.get(`${API_URL}/jobs?jobType=full-time`);
    const filterTypeSuccess = filterByTypeRes.data.status === 'success';
    logTest(
      'Filter Jobs by Type',
      filterTypeSuccess,
      `Full-time jobs: ${filterByTypeRes.data.data?.length || 0}`
    );

    // Test 4.3: Filter Jobs by Location
    console.log('\nTest 4.3: Filter Jobs by Location');
    const filterByLocationRes = await axios.get(`${API_URL}/jobs?location=San Francisco`);
    const filterLocSuccess = filterByLocationRes.data.status === 'success';
    logTest(
      'Filter Jobs by Location',
      filterLocSuccess,
      `Jobs in San Francisco: ${filterByLocationRes.data.data?.length || 0}`
    );

    // Test 4.4: Combined Search Filters
    console.log('\nTest 4.4: Combined Search Filters');
    const combinedSearchRes = await axios.get(
      `${API_URL}/jobs?search=Developer&jobType=full-time&location=San Francisco`
    );
    const combinedSuccess = combinedSearchRes.data.status === 'success';
    logTest(
      'Combined Search Filters',
      combinedSuccess,
      `Filtered results: ${combinedSearchRes.data.data?.length || 0}`
    );

  } catch (error) {
    logTest('Job Search Tests', false, error.response?.data?.error?.message || error.message);
  }
}

// Feature 5: Job Application Tests
async function testJobApplication() {
  console.log(`\n${colors.cyan}=== Testing Feature 5: Job Application ===${colors.reset}\n`);

  try {
    // Test 5.1: Apply for Job
    console.log('Test 5.1: Apply for Job');
    const applicationData = {
      coverLetter: 'I am very interested in this position and believe I would be a great fit...',
    };

    const applyJobRes = await axios.post(`${API_URL}/applications/apply/${jobId}`, applicationData, {
      headers: { Authorization: `Bearer ${jobSeekerToken}` },
    });
    const applySuccess = applyJobRes.data.status === 'success';
    logTest(
      'Apply for Job',
      applySuccess,
      `Application ID: ${applyJobRes.data.data?.id}`
    );
    applicationId = applyJobRes.data.data?.id;

    // Test 5.2: Get My Applications (Job Seeker)
    console.log('\nTest 5.2: Get My Applications (Job Seeker)');
    const getMyApplicationsRes = await axios.get(`${API_URL}/applications/my-applications`, {
      headers: { Authorization: `Bearer ${jobSeekerToken}` },
    });
    const myAppSuccess = getMyApplicationsRes.data.status === 'success' && getMyApplicationsRes.data.data?.length > 0;
    logTest(
      'Get My Applications',
      myAppSuccess,
      `Total applications: ${getMyApplicationsRes.data.data?.length || 0}`
    );

    // Test 5.3: Get Job Applications (Employer)
    console.log('\nTest 5.3: Get Job Applications (Employer)');
    const getJobApplicationsRes = await axios.get(`${API_URL}/applications/job/${jobId}`, {
      headers: { Authorization: `Bearer ${employerToken}` },
    });
    const jobAppSuccess = getJobApplicationsRes.data.status === 'success';
    logTest(
      'Get Job Applications (Employer)',
      jobAppSuccess,
      `Applications for this job: ${getJobApplicationsRes.data.data?.length || 0}`
    );

    // Test 5.4: Update Application Status
    console.log('\nTest 5.4: Update Application Status');
    const updateStatusRes = await axios.put(
      `${API_URL}/applications/${applicationId}/status`,
      { status: 'reviewed', notes: 'Candidate looks promising' },
      {
        headers: { Authorization: `Bearer ${employerToken}` },
      }
    );
    const statusSuccess = updateStatusRes.data.status === 'success' && updateStatusRes.data.data?.status === 'reviewed';
    logTest(
      'Update Application Status',
      statusSuccess,
      `New status: ${updateStatusRes.data.data?.status}`
    );

  } catch (error) {
    logTest('Job Application Tests', false, error.response?.data?.error?.message || error.message);
  }
}

// Feature 6: Dashboard Tests
async function testDashboard() {
  console.log(`\n${colors.cyan}=== Testing Feature 6: Dashboard ===${colors.reset}\n`);

  try {
    // Test 6.1: Job Seeker Dashboard Stats
    console.log('Test 6.1: Job Seeker Dashboard Stats');
    const jobSeekerDashboardRes = await axios.get(`${API_URL}/dashboard/job-seeker`, {
      headers: { Authorization: `Bearer ${jobSeekerToken}` },
    });
    const jsDashSuccess = jobSeekerDashboardRes.data.status === 'success';
    logTest(
      'Job Seeker Dashboard Stats',
      jsDashSuccess,
      `Applications: ${jobSeekerDashboardRes.data.data?.totalApplications || 0}, ` +
      `Pending: ${jobSeekerDashboardRes.data.data?.pendingApplications || 0}`
    );

    // Test 6.2: Employer Dashboard Stats
    console.log('\nTest 6.2: Employer Dashboard Stats');
    const employerDashboardRes = await axios.get(`${API_URL}/dashboard/employer`, {
      headers: { Authorization: `Bearer ${employerToken}` },
    });
    const empDashSuccess = employerDashboardRes.data.status === 'success';
    logTest(
      'Employer Dashboard Stats',
      empDashSuccess,
      `Jobs: ${employerDashboardRes.data.data?.totalJobs || 0}, ` +
      `Applications: ${employerDashboardRes.data.data?.totalApplications || 0}`
    );

  } catch (error) {
    logTest('Dashboard Tests', false, error.response?.data?.error?.message || error.message);
  }
}

// Additional Feature Tests
async function testAdditionalFeatures() {
  console.log(`\n${colors.cyan}=== Testing Additional Features ===${colors.reset}\n`);

  try {
    // Test 7.1: Duplicate Application Prevention
    console.log('Test 7.1: Duplicate Application Prevention');
    try {
      await axios.post(
        `${API_URL}/applications/apply/${jobId}`,
        { coverLetter: 'Another application' },
        {
          headers: { Authorization: `Bearer ${jobSeekerToken}` },
        }
      );
      logTest('Duplicate Application Prevention', false, 'Should have prevented duplicate application');
    } catch (error) {
      logTest(
        'Duplicate Application Prevention',
        error.response?.status === 400,
        'Correctly prevented duplicate application'
      );
    }

    // Test 7.2: Unauthorized Access (Job Seeker trying to create job)
    console.log('\nTest 7.2: Unauthorized Job Creation');
    try {
      await axios.post(
        `${API_URL}/jobs`,
        { title: 'Test Job' },
        {
          headers: { Authorization: `Bearer ${jobSeekerToken}` },
        }
      );
      logTest('Unauthorized Job Creation', false, 'Should have prevented job seeker from creating job');
    } catch (error) {
      logTest(
        'Unauthorized Job Creation',
        error.response?.status === 403,
        'Correctly prevented unauthorized access'
      );
    }

    // Test 7.3: Delete Job (Clean up)
    console.log('\nTest 7.3: Delete Job Listing');
    const deleteJobRes = await axios.delete(`${API_URL}/jobs/${jobId}`, {
      headers: { Authorization: `Bearer ${employerToken}` },
    });
    const deleteSuccess = deleteJobRes.data.status === 'success';
    logTest(
      'Delete Job Listing',
      deleteSuccess,
      'Job deleted successfully'
    );

  } catch (error) {
    logTest('Additional Features Tests', false, error.response?.data?.error?.message || error.message);
  }
}

// Print summary
function printSummary() {
  console.log(`\n${colors.cyan}======================================${colors.reset}`);
  console.log(`${colors.cyan}     TEST RESULTS SUMMARY${colors.reset}`);
  console.log(`${colors.cyan}======================================${colors.reset}\n`);

  console.log(`${colors.green}✓ Passed Tests: ${testResults.passed}${colors.reset}`);
  console.log(`${colors.red}✗ Failed Tests: ${testResults.failed}${colors.reset}`);
  console.log(`Total Tests: ${testResults.passed + testResults.failed}\n`);

  const successRate = ((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(2);
  console.log(`Success Rate: ${successRate}%\n`);

  if (testResults.failed > 0) {
    console.log(`${colors.red}Failed Tests:${colors.reset}`);
    testResults.tests
      .filter(test => !test.passed)
      .forEach(test => {
        console.log(`  - ${test.testName}`);
        if (test.message) {
          console.log(`    ${test.message}`);
        }
      });
    console.log('');
  }

  console.log(`${colors.cyan}======================================${colors.reset}\n`);
}

// Main test runner
async function runAllTests() {
  console.log(`${colors.blue}╔════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.blue}║  JOB PORTAL COMPREHENSIVE FEATURE TEST SUITE  ║${colors.reset}`);
  console.log(`${colors.blue}╚════════════════════════════════════════════════╝${colors.reset}\n`);
  console.log(`Testing against: ${API_URL}\n`);

  try {
    await testUserAuthentication();
    await delay(500);
    
    await testProfileManagement();
    await delay(500);
    
    await testJobListings();
    await delay(500);
    
    await testJobSearch();
    await delay(500);
    
    await testJobApplication();
    await delay(500);
    
    await testDashboard();
    await delay(500);
    
    await testAdditionalFeatures();
    
    printSummary();

    // Exit with appropriate code
    process.exit(testResults.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error(`\n${colors.red}Fatal error during testing:${colors.reset}`, error.message);
    process.exit(1);
  }
}

// Run tests
runAllTests();
