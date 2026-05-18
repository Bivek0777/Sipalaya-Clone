const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');
const Course = require('./models/Course');
const Blog = require('./models/Blog');
const Job = require('./models/Job');
const Admission = require('./models/Admission');
const Demo = require('./models/Demo');
const Testimonial = require('./models/Testimonial');
const Review = require('./models/Review');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sipalaya_it_training';

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // 1. Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Blog.deleteMany({});
    await Job.deleteMany({});
    await Admission.deleteMany({});
    await Demo.deleteMany({});
    await Testimonial.deleteMany({});
    await Review.deleteMany({});
    console.log('Cleared existing data.');

    // 2. Seed Users
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const studentPassword = await bcrypt.hash('student123', salt);

    const users = await User.insertMany([
      { name: 'Admin User', email: 'admin@sipalaya.com', password: adminPassword, role: 'admin' },
      { name: 'John Student', email: 'student@example.com', password: studentPassword, role: 'student' },
      { name: 'Jane Instructor', email: 'instructor@sipalaya.com', password: adminPassword, role: 'instructor' },
    ]);
    console.log('Users seeded.');

    // 3. Seed Courses
    const courses = await Course.insertMany([
      {
        title: 'Full Stack Web Development',
        category: 'Web Development',
        level: 'Beginner',
        duration: '12 Weeks',
        fee: 25000,
        instructor: 'Pramod Mahto',
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80',
        description: 'Master the art of building modern web applications from scratch using the MERN stack.',
        prerequisites: 'Basic computer literacy.',
        syllabus: ['HTML/CSS', 'JavaScript', 'React', 'Node.js', 'MongoDB', 'Deployment'],
        enrollmentDeadline: new Date('2024-02-15'),
      },
      {
        title: 'Python for Data Science',
        category: 'Data Science',
        level: 'Intermediate',
        duration: '8 Weeks',
        fee: 20000,
        instructor: 'Saroj Giri',
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
        description: 'Learn Python, Pandas, NumPy, and basic Machine Learning for data analysis.',
        prerequisites: 'Basic programming knowledge.',
        syllabus: ['Python Fundamentals', 'NumPy & Pandas', 'Data Visualization', 'Intro to ML'],
        enrollmentDeadline: new Date('2024-03-01'),
      },
      {
        title: 'UI/UX Design Masterclass',
        category: 'Design',
        level: 'Beginner',
        duration: '6 Weeks',
        fee: 15000,
        instructor: 'Kirtan Shrestha',
        rating: 4.7,
        image: 'https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?auto=format&fit=crop&w=600&q=80',
        description: 'Design beautiful and user-friendly interfaces using Figma and Adobe XD.',
        prerequisites: 'Creativity and interest in design.',
        syllabus: ['Design Principles', 'Figma Basics', 'User Research', 'Prototyping'],
        enrollmentDeadline: new Date('2024-02-28'),
      },
      {
        title: 'Mobile App Development (Flutter)',
        category: 'Mobile Dev',
        level: 'Intermediate',
        duration: '10 Weeks',
        fee: 22000,
        instructor: 'Er. Sujan Thadarai',
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=80',
        description: 'Build high-performance cross-platform mobile apps for iOS and Android using Flutter.',
        prerequisites: 'Basic programming knowledge.',
        syllabus: ['Dart Fundamentals', 'Flutter Widgets', 'State Management', 'API Integration', 'App Store Deployment'],
        enrollmentDeadline: new Date('2024-04-10'),
      },
      {
        title: 'Java Spring Boot Full Stack',
        category: 'Backend',
        level: 'Advanced',
        duration: '14 Weeks',
        fee: 30000,
        instructor: 'Er. Sujan Thadarai',
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&w=600&q=80',
        description: 'Enterprise-level application development using Java, Spring Boot, and React.',
        prerequisites: 'Object Oriented Programming basics.',
        syllabus: ['Java Advanced', 'Spring Boot Core', 'Hibernate/JPA', 'Spring Security', 'REST APIs', 'React Frontend'],
        enrollmentDeadline: new Date('2024-05-01'),
      },
      {
        title: 'Digital Marketing Excellence',
        category: 'Marketing',
        level: 'Beginner',
        duration: '8 Weeks',
        fee: 12000,
        instructor: 'Ajay Dhoju',
        rating: 4.6,
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
        description: 'Master SEO, SEM, Social Media Marketing, and Content Strategy.',
        prerequisites: 'Basic understanding of the internet.',
        syllabus: ['SEO Optimization', 'Google Ads', 'Facebook/Instagram Marketing', 'Email Marketing', 'Analytics'],
        enrollmentDeadline: new Date('2024-03-20'),
      },
      {
        title: 'QA & Software Testing',
        category: 'Testing',
        level: 'Beginner',
        duration: '6 Weeks',
        fee: 14000,
        instructor: 'Rajan Shrestha',
        rating: 4.7,
        image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=600&q=80',
        description: 'Learn manual and automated testing tools like Selenium and Postman.',
        prerequisites: 'Attention to detail.',
        syllabus: ['SDLC & STLC', 'Manual Testing', 'Automation Basics', 'Selenium Webdriver', 'API Testing'],
        enrollmentDeadline: new Date('2024-03-15'),
      },
      {
        title: 'Graphic Design Masterclass',
        category: 'Design',
        level: 'Beginner',
        duration: '10 Weeks',
        fee: 18000,
        instructor: 'Sangam Swornakar',
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=600&q=80',
        description: 'Master Photoshop, Illustrator, and InDesign for professional graphic design.',
        prerequisites: 'None.',
        syllabus: ['Color Theory', 'Adobe Photoshop', 'Adobe Illustrator', 'Logo Design', 'Print Media'],
        enrollmentDeadline: new Date('2024-04-05'),
      }
    ]);
    console.log('Courses seeded.');

    // 4. Seed Blogs
    console.log('Seeding blogs...');
    const seededBlogs = await Blog.insertMany([
      {
        title: 'Top 5 IT Industry Trends in 2024',
        slug: 'top-5-it-industry-trends-2024',
        content: '<h1>Trends to watch</h1><p>Generative AI, Cloud-native applications, and Cyber Security are the top trends...</p>',
        excerpt: 'Discover the technologies that will dominate the job market in the coming year.',
        category: 'Industry Trends',
        author: 'Ramesh Adhikari',
        image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
        readTime: '5 min read',
        tags: ['AI', 'Tech', '2024']
      },
      {
        title: 'How to Build a Strong Tech Portfolio',
        slug: 'build-strong-tech-portfolio',
        content: '<h1>Your Portfolio Matters</h1><p>Recruiters look at your projects more than your degree...</p>',
        excerpt: 'Learn what makes a portfolio stand out to recruiters in 2024.',
        category: 'Career Guidance',
        author: 'Sita Sharma',
        image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=800&q=80',
        readTime: '8 min read',
        tags: ['Career', 'Jobs', 'Portfolio']
      },
      {
        title: 'Why Flutter is the Future of Mobile Apps',
        slug: 'why-flutter-future-mobile-apps',
        content: '<h1>Cross-Platform Dominance</h1><p>Flutter allows you to write once and run everywhere. Its performance is nearly native...</p>',
        excerpt: 'Explore why companies are switching to Flutter for mobile development.',
        category: 'Mobile Tech',
        author: 'Dipendra Shah',
        image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80',
        readTime: '6 min read',
        tags: ['Flutter', 'Mobile', 'iOS', 'Android']
      },
      {
        title: 'MERN Stack vs MEAN Stack: Which to Choose?',
        slug: 'mern-vs-mean-stack',
        content: '<h1>Choosing the right stack</h1><p>While MEAN uses Angular, MERN uses React. React has a larger ecosystem and simpler learning curve...</p>',
        excerpt: 'A comprehensive comparison between the two most popular web development stacks.',
        category: 'Web Development',
        author: 'Ramesh Adhikari',
        image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
        readTime: '10 min read',
        tags: ['React', 'Angular', 'WebDev']
      },
      {
        title: '10 SEO Tips to Rank Your Website in 2024',
        slug: 'seo-tips-2024',
        content: '<h1>SEO in the AI Era</h1><p>Content quality and user intent are now more important than keyword stuffing...</p>',
        excerpt: 'Practical SEO strategies to help your website climb to the top of Google search results.',
        category: 'Digital Marketing',
        author: 'Sunita Gurung',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
        readTime: '7 min read',
        tags: ['SEO', 'Marketing', 'Google']
      },
      {
        title: 'Mastering the Java Interview: A Guide',
        slug: 'mastering-java-interview',
        content: '<h1>Crack the Interview</h1><p>Focus on OOP principles, Multithreading, and Spring Boot basics...</p>',
        excerpt: 'Key questions and concepts you must know before your next Java developer interview.',
        category: 'Career Guidance',
        author: 'Anil Paudel',
        image: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&w=800&q=80',
        readTime: '12 min read',
        tags: ['Java', 'Interview', 'Spring']
      },
      {
        title: 'Cyber Security Essentials for 2024',
        slug: 'cyber-security-essentials-2024',
        content: '<h1>Protect your data</h1><p>Cyber threats are evolving. Learn about MFA, Phishing protection, and secure coding...</p>',
        excerpt: 'The ultimate guide to staying safe in an increasingly digital world.',
        category: 'Technology',
        author: 'Sita Sharma',
        image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
        readTime: '9 min read',
        tags: ['Security', 'Cyber', 'Privacy']
      },
      {
        title: 'Cloud Computing: AWS vs Azure vs GCP',
        slug: 'cloud-computing-comparison',
        content: '<h1>The Cloud Wars</h1><p>AWS remains the leader, but Azure is catching up in the enterprise space...</p>',
        excerpt: 'Deciding which cloud provider is right for your next big project.',
        category: 'Technology',
        author: 'Ramesh Adhikari',
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
        readTime: '11 min read',
        tags: ['AWS', 'Azure', 'Cloud']
      },
      {
        title: 'The Future of Data Science in Nepal',
        slug: 'data-science-nepal-future',
        content: '<h1>Data is the New Oil</h1><p>Nepalese companies are starting to realize the power of data analytics...</p>',
        excerpt: 'An in-depth look at the job market and opportunities for data scientists in Nepal.',
        category: 'Career Guidance',
        author: 'Sita Sharma',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
        readTime: '8 min read',
        tags: ['Nepal', 'Data', 'Jobs']
      },
      {
        title: 'Why React.js is Still the King of Front-end',
        slug: 'why-react-is-king',
        content: '<h1>Component-Based Architecture</h1><p>Even with new frameworks like Svelte and Vue, React remains the most popular due to its massive ecosystem...</p>',
        excerpt: 'Reasons why you should still prioritize learning React.js in 2024.',
        category: 'Web Development',
        author: 'Dipendra Shah',
        image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80',
        readTime: '7 min read',
        tags: ['React', 'JavaScript', 'Frontend']
      }
    ]);
    console.log('Blogs seeded.');

    // 5. Seed Jobs
    await Job.insertMany([
      { title: 'Junior Frontend Developer', company: 'TechNova Solutions', description: 'React.js and Tailwind CSS expertise required.', deadline: new Date('2024-10-30') },
      { title: 'Python Backend Engineer', company: 'DataSys AI', description: 'Django and PostgreSQL experience preferred.', deadline: new Date('2024-11-05') },
      { title: 'UI/UX Design Intern', company: 'Creative Digital', description: 'Proficiency in Figma and Adobe XD.', deadline: new Date('2024-10-25') }
    ]);
    console.log('Jobs seeded.');

    // 6. Seed Testimonials
    await Testimonial.insertMany([
      {
        name: 'Aarav Karki',
        role: 'Frontend Developer at F1Soft',
        quote: 'The web development course at Sipalaya was life-changing. The hands-on approach and real-world projects helped me land my dream job.',
        image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80',
        order: 1
      },
      {
        name: 'Smriti Shrestha',
        role: 'Data Analyst at Leapfrog',
        quote: 'I loved the Python Data Science bootcamp. The instructors are top-notch and the curriculum is very aligned with industry needs.',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
        order: 2
      },
      {
        name: 'Bimal Tamang',
        role: 'UX Designer at Logpoint',
        quote: 'Best place to learn UI/UX in Kathmandu. The environment is super supportive, and the placement assistance is genuinely helpful.',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
        order: 3
      }
    ]);
    console.log('Testimonials seeded.');

    // 7. Seed Reviews
    await Review.insertMany([
      {
        courseId: courses[0]._id,
        studentName: 'Anish Giri',
        rating: 5,
        reviewText: 'Excellent course content and great instructor support!',
        approved: true
      },
      {
        courseId: courses[0]._id,
        studentName: 'Maya Rai',
        rating: 4,
        reviewText: 'Very practical and easy to understand.',
        approved: true
      }
    ]);
    console.log('Reviews seeded.');

    // 8. Seed Admission sample
    await Admission.create({
      fullName: 'John Student',
      email: 'student@example.com',
      phone: '9841234567',
      course: courses[0]._id,
      paymentPreference: 'esewa',
      paymentPlan: 'full',
      status: 'approved'
    });
    console.log('Sample Admission seeded.');

    console.log('Seeding completed successfully!');
    process.exit();
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seedData();
