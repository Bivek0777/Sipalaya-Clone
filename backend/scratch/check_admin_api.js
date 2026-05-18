const jwt = require('jsonwebtoken');
const axios = require('axios');

const JWT_SECRET = 'super_secret_key_change_me'; // From .env

const checkAdmin = async () => {
  try {
    // Generate a mock admin token
    const token = jwt.sign({ id: 'mockadmin', role: 'admin' }, JWT_SECRET);
    console.log('Mock Token generated.');

    const cfg = { headers: { Authorization: `Bearer ${token}` } };
    
    const res = await axios.get('http://localhost:5000/api/admin/courses', cfg);
    console.log('Admin Courses Fetch Status:', res.status);
    console.log('Data count:', res.data.length);
  } catch (err) {
    console.error('Admin Fetch Error:', err.response?.status, err.response?.data || err.message);
  }
};

checkAdmin();
