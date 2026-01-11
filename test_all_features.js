const axios = require('axios');

const API_URL = 'http://localhost:5002/api';

// Test data
const jobSeekerData = {
  email: 'jobseeker@test.com',
  password: 'Test123!',
  role: 'job_seeker',
  fullName: 'John Doe'
};

const employerData = {
  email: 'employer@test.com',
  password: 'Test123!',
  role: 'employer',
  companyName: 'Tech Corp'
};

let jobSeekerToken, employerToken, jobId;

async function testFeature(name, testFn) {
  try {
    console.log(`\n📝 Testing: ${name}`);
    await testFn();
    console.log(`✅ PASSED: ${name}`);
    return true;
  } catch (error) {
    console.log(`❌ FAILED: ${name}`);
    console.log(`   Error: ${error.response?.data?.message || error.message}`);
    if (error.response?.data) {
      console.log(`   Details:`, JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting Comprehensive Feature Tests for Job Portal');
  console.log('='.repeat(60));

  const results = {
    passed: 0,
    failed: 0
  };

  // 1. User Authentication Tests
  console.log('\n\n📌 FEATURE 1: USER AUTHENTICATION');
  console.log('-'.repeat(60));

  if (await testFeature('User Registration - Job Seeker', async () => {
    const response = await axios.post(`${API_URL}/auth/register`, jobSeekerData);
    if (!response.data.success || !response.data.token) {
      throw new Error('Registration failed or no token returned');
    }
    jobSeekerToken = response.data.token;
  })) results.passed++; else results.failed++;

  if (await testFeature('User Registration - Employer', async () => {
    const response = await axios.post(`${API_URL}/auth/register`, employerData);
    if (!response.data.success || !response.data.token) {
      throw new Error('Registration failed or no token returned');
    }
    employerToken = response.data.token;
  })) results.passed++; else results.failed++;

  if (await testFeature('User Login - Job Seeker', async () => {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: jobSeekerData.email,
      password: jobSeekerData.password
    });
    if (!response.data.success || !response.data.token) {
      throw new Error('Login failed or no token returned');
    }
    jobSeekerToken = response.data.token;
  })) results.passed++; else results.failed++;

  if (await testFeature('User Login - Employer', async () => {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: employerData.email,
      password: employerData.password
    });
    if (!response.data.success || !response.data.token) {
      throw new Error('Login failed or no token returned');
    }
    employerToken = response.data.token;
  })) results.passed++; else results.failed++;

  // 2. Profile Management Tests
  console.log('\n\n📌 FEATURE 2: PROFILE MANAGEMENT');
  console.log('-'.repeat(60));

  if (await testFeature('Create Job Seeker Profile', async () => {
    const response = await axios.post(`${API_URL}/profile/jobseeker`, {
      phone: '1234567890',
      location: 'New York',
      skills: ['JavaScript', 'React', 'Node.js'],
      experience: '2 years',
      education: 'Bachelor in Computer Science',
      bio: 'Passionate developer'
    }, {
      headers: { Authorization: `Bearer ${jobSeekerToken}` }
    });
    if (!response.data.success) {
      throw new Error('Profile creation failed');
    }
  })) results.passed++; else results.failed++;

  if (await testFeature('Create Employer Profile', async () => {
    const response = await axios.post(`${API_URL}/profile/employer`, {
      companyName: 'Tech Corp',
      companyDescription: 'Leading tech company',
      industry: 'Information Technology',
      companySize: '100-500',
      website: 'https://techcorp.com',
      location: 'San Francisco'
    }, {
      headers: { Authorization: `Bearer ${employerToken}` }
    });
    if (!response.data.success) {
      throw new Error('Profile creation failed');
    }
  })) results.passed++; else results.failed++;

  if (await testFeature('Get Job Seeker Profile', async () => {
    const response = await axios.get(`${API_URL}/profile/me`, {
      headers: { Authorization: `Bearer ${jobSeekerToken}` }
    });
    if (!response.data.success || !response.data.profile) {
      throw new Error('Failed to get profile');
    }
  })) results.passed++; else results.failed++;

  if (await testFeature('Get Employer Profile', async () => {
    const response = await axios.get(`${API_URL}/profile/me`, {
      headers: { Authorization: `Bearer ${employerToken}` }
    });
    if (!response.data.success || !response.data.profile) {
      throw new Error('Failed to get profile');
    }
  })) results.passed++; else results.failed++;

  // 3. Job Listing Tests
  console.log('\n\n📌 FEATURE 3: JOB LISTINGS');
  console.log('-'.repeat(60));

  if (await testFeature('Create Job Listing', async () => {
    const response = await axios.post(`${API_URL}/jobs`, {
      title: 'Senior Frontend Developer',
      description: 'We are looking for an experienced frontend developer',
      requirements: ['React', 'TypeScript', '3+ years experience'],
      responsibilities: ['Develop UI components', 'Code reviews', 'Mentor juniors'],
      location: 'San Francisco, CA',
      jobType: 'full-time',
      experienceLevel: 'senior',
      salaryRange: '$120,000 - $150,000',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }, {
      headers: { Authorization: `Bearer ${employerToken}` }
    });
    if (!response.data.success || !response.data.job) {
      throw new Error('Job creation failed');
    }
    jobId = response.data.job.id;
  })) results.passed++; else results.failed++;

  if (await testFeature('Get All Jobs (Public)', async () => {
    const response = await axios.get(`${API_URL}/jobs`);
    if (!response.data.success || !Array.isArray(response.data.jobs)) {
      throw new Error('Failed to get jobs');
    }
    if (response.data.jobs.length === 0) {
      throw new Error('No jobs found');
    }
  })) results.passed++; else results.failed++;

  if (await testFeature('Get Job by ID', async () => {
    const response = await axios.get(`${API_URL}/jobs/${jobId}`);
    if (!response.data.success || !response.data.job) {
      throw new Error('Failed to get job details');
    }
  })) results.passed++; else results.failed++;

  if (await testFeature('Update Job Listing', async () => {
    const response = await axios.put(`${API_URL}/jobs/${jobId}`, {
      title: 'Senior Frontend Developer (Updated)',
      description: 'Updated description'
    }, {
      headers: { Authorization: `Bearer ${employerToken}` }
    });
    if (!response.data.success) {
      throw new Error('Job update failed');
    }
  })) results.passed++; else results.failed++;

  // 4. Job Search Tests
  console.log('\n\n📌 FEATURE 4: JOB SEARCH');
  console.log('-'.repeat(60));

  if (await testFeature('Search Jobs by Keyword', async () => {
    const response = await axios.get(`${API_URL}/jobs?search=Frontend`);
    if (!response.data.success || !Array.isArray(response.data.jobs)) {
      throw new Error('Search failed');
    }
  })) results.passed++; else results.failed++;

  if (await testFeature('Filter Jobs by Location', async () => {
    const response = await axios.get(`${API_URL}/jobs?location=San Francisco`);
    if (!response.data.success || !Array.isArray(response.data.jobs)) {
      throw new Error('Location filter failed');
    }
  })) results.passed++; else results.failed++;

  if (await testFeature('Filter Jobs by Type', async () => {
    const response = await axios.get(`${API_URL}/jobs?jobType=full-time`);
    if (!response.data.success || !Array.isArray(response.data.jobs)) {
      throw new Error('Job type filter failed');
    }
  })) results.passed++; else results.failed++;

  // 5. Job Application Tests
  console.log('\n\n📌 FEATURE 5: JOB APPLICATION');
  console.log('-'.repeat(60));

  if (await testFeature('Apply for Job', async () => {
    const response = await axios.post(`${API_URL}/applications`, {
      jobId: jobId,
      coverLetter: 'I am very interested in this position and believe my skills align perfectly.'
    }, {
      headers: { Authorization: `Bearer ${jobSeekerToken}` }
    });
    if (!response.data.success) {
      throw new Error('Application failed');
    }
  })) results.passed++; else results.failed++;

  if (await testFeature('Get Job Seeker Applications', async () => {
    const response = await axios.get(`${API_URL}/applications/my-applications`, {
      headers: { Authorization: `Bearer ${jobSeekerToken}` }
    });
    if (!response.data.success || !Array.isArray(response.data.applications)) {
      throw new Error('Failed to get applications');
    }
    if (response.data.applications.length === 0) {
      throw new Error('No applications found');
    }
  })) results.passed++; else results.failed++;

  if (await testFeature('Get Job Applications (Employer)', async () => {
    const response = await axios.get(`${API_URL}/applications/job/${jobId}`, {
      headers: { Authorization: `Bearer ${employerToken}` }
    });
    if (!response.data.success || !Array.isArray(response.data.applications)) {
      throw new Error('Failed to get job applications');
    }
  })) results.passed++; else results.failed++;

  // 6. Dashboard Tests
  console.log('\n\n📌 FEATURE 6: DASHBOARD');
  console.log('-'.repeat(60));

  if (await testFeature('Job Seeker Dashboard', async () => {
    const response = await axios.get(`${API_URL}/dashboard/jobseeker`, {
      headers: { Authorization: `Bearer ${jobSeekerToken}` }
    });
    if (!response.data.success || !response.data.stats) {
      throw new Error('Failed to get dashboard stats');
    }
  })) results.passed++; else results.failed++;

  if (await testFeature('Employer Dashboard', async () => {
    const response = await axios.get(`${API_URL}/dashboard/employer`, {
      headers: { Authorization: `Bearer ${employerToken}` }
    });
    if (!response.data.success || !response.data.stats) {
      throw new Error('Failed to get dashboard stats');
    }
  })) results.passed++; else results.failed++;

  // 7. Delete Job (as part of job management)
  console.log('\n\n📌 ADDITIONAL: JOB MANAGEMENT');
  console.log('-'.repeat(60));

  if (await testFeature('Delete Job Listing', async () => {
    const response = await axios.delete(`${API_URL}/jobs/${jobId}`, {
      headers: { Authorization: `Bearer ${employerToken}` }
    });
    if (!response.data.success) {
      throw new Error('Job deletion failed');
    }
  })) results.passed++; else results.failed++;

  // Final Results
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Total: ${results.passed + results.failed}`);
  console.log(`🎯 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(2)}%`);
  console.log('='.repeat(60));

  if (results.failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! The Job Portal is fully functional.');
  } else {
    console.log(`\n⚠️  ${results.failed} test(s) failed. Please review the errors above.`);
  }
}

runTests().catch(error => {
  console.error('\n💥 Test runner crashed:', error.message);
  process.exit(1);
});
