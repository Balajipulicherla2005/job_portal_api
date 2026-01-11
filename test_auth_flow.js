const axios = require('axios');

const testAuth = async () => {
  try {
    // Register a new user
    console.log('1. Testing registration...');
    const registerResponse = await axios.post('http://localhost:5002/api/auth/register', {
      email: 'testuser@test.com',
      password: 'test123456',
      role: 'job_seeker',
      fullName: 'Test User',
      phone: '1234567890',
      location: 'Test City'
    });
    
    console.log('Registration response status:', registerResponse.status);
    console.log('Registration data:', JSON.stringify(registerResponse.data, null, 2));
    
    // Login with the newly created user
    console.log('\n2. Testing login...');
    const loginResponse = await axios.post('http://localhost:5002/api/auth/login', {
      email: 'testuser@test.com',
      password: 'test123456'
    });
    
    console.log('Login response status:', loginResponse.status);
    console.log('Login data:', JSON.stringify(loginResponse.data, null, 2));
    
    if (loginResponse.data && loginResponse.data.data && loginResponse.data.data.token) {
      console.log('\n✓ Authentication flow successful!');
      console.log('Token:', loginResponse.data.data.token.substring(0, 30) + '...');
      console.log('User:', loginResponse.data.data.user);
    }
    
  } catch (error) {
    if (error.response) {
      console.error('Error response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
  }
};

testAuth();
