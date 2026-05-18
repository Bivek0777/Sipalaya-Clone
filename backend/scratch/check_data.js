const axios = require('axios');

const checkData = async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/courses');
    console.log('Public Courses:', res.data.length);
    
    const resBlogs = await axios.get('http://localhost:5000/api/blogs');
    console.log('Public Blogs:', resBlogs.data.length);

    const resJobs = await axios.get('http://localhost:5000/api/jobs');
    console.log('Public Jobs:', resJobs.data.length);
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
};

checkData();
