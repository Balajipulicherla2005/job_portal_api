const axios = require('axios');

const testLogin = async () => {
  try {
    console.log('Testing login endpoint...');
    const response = await axios.post('http://localhost:5002/api/auth/login', {
      email: 'job@gmail.com',
      password: 'password'
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    if (response.data && response.data.data && response.data.data.token) {
      console.log('\n✓ Login successful!');
      console.log('Token:', response.data.data.token.substring(0, 20) + '...');
      console.log('User:', response.data.data.user);
    }
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
};

testLogin();
