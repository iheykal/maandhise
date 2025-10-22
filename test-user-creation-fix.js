const axios = require('axios');

// Test user creation functionality
async function testUserCreation() {
  const baseURL = 'http://localhost:5000/api';
  
  // Test data
  const testUser = {
    fullName: 'Test User',
    phone: '+252123456789', // Exactly 9 digits after +252
    role: 'customer',
    idNumber: '123456789',
    location: 'Mogadishu'
  };

  try {
    console.log('🧪 Testing user creation...');
    console.log('📝 Test data:', testUser);
    
    // First, let's try to login as admin to get a token
    console.log('\n🔐 Attempting to login as admin...');
    
    // You'll need to replace this with actual admin credentials
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      phone: '+252123456789', // Replace with actual admin phone
      password: 'adminpassword' // Replace with actual admin password
    });
    
    const token = loginResponse.data.data.accessToken;
    console.log('✅ Login successful');
    
    // Now test user creation
    console.log('\n👤 Creating test user...');
    const createResponse = await axios.post(`${baseURL}/auth/create-user`, testUser, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ User creation successful!');
    console.log('📊 Response:', createResponse.data);
    
  } catch (error) {
    console.error('❌ Test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Test phone number validation
function testPhoneValidation() {
  console.log('\n📱 Testing phone number validation...');
  
  const testCases = [
    { phone: '+252123456789', expected: true, description: 'Valid 9-digit phone' },
    { phone: '+25212345678', expected: false, description: 'Invalid 8-digit phone' },
    { phone: '+2521234567890', expected: false, description: 'Invalid 10-digit phone' },
    { phone: '+2521234567a', expected: false, description: 'Invalid phone with letter' },
    { phone: '252123456789', expected: false, description: 'Missing + prefix' }
  ];
  
  const phoneRegex = /^\+252\d{9}$/;
  
  testCases.forEach(testCase => {
    const result = phoneRegex.test(testCase.phone);
    const status = result === testCase.expected ? '✅' : '❌';
    console.log(`${status} ${testCase.description}: ${testCase.phone} -> ${result}`);
  });
}

// Run tests
console.log('🚀 Starting user creation tests...\n');
testPhoneValidation();

// Uncomment the line below to test actual user creation (requires running backend)
// testUserCreation();

