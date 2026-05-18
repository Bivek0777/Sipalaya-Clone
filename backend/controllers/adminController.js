// Admin Controller - Full CRUD
const User = require('../models/User');
const Course = require('../models/Course');
const Payment = require('../models/Payment');
const Admission = require('../models/Admission');
const Demo = require('../models/Demo');
const Job = require('../models/Job');
const Blog = require('../models/Blog');
const bcrypt = require('bcryptjs');

// ─── STUDENT / USER MANAGEMENT ───────────────────────────────────────────────

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed, role: role || 'student' });
    await user.save();
    const userObj = user.toObject();
    delete userObj.password;
    res.status(201).json(userObj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, password } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllInstructors = async (req, res) => {
  try {
    const instructors = await User.find({ role: 'instructor' }).select('-password');
    res.json(instructors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── COURSE MANAGEMENT ───────────────────────────────────────────────────────

exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const { title, category, level, duration, fee, instructor, image, description, prerequisites, syllabus, enrollmentDeadline } = req.body;
    if (!title || !category || !level || !duration || !fee || !instructor || !description) {
      return res.status(400).json({ message: 'Missing required course fields' });
    }
    const course = new Course({
      title, category, level, duration,
      fee: Number(fee),
      instructor,
      image: image || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80',
      description, prerequisites,
      syllabus: Array.isArray(syllabus) ? syllabus : (syllabus ? syllabus.split('\n').filter(s => s.trim()) : []),
      enrollmentDeadline
    });
    await course.save();
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.fee !== undefined) updateData.fee = Number(updateData.fee);
    if (updateData.syllabus && typeof updateData.syllabus === 'string') {
      updateData.syllabus = updateData.syllabus.split('\n').filter(s => s.trim());
    }
    const course = await Course.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteCourse = async (req, res) => {
  console.log('Backend: Deleting course with ID:', req.params.id);
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    console.log('Backend: Delete result:', course ? 'Course Deleted' : 'Course Not Found');
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.approveCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, { approved: true }, { new: true });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── ADMISSION MANAGEMENT ────────────────────────────────────────────────────

exports.getAllAdmissions = async (req, res) => {
  try {
    const admissions = await Admission.find().sort({ createdAt: -1 });
    res.json(admissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAdmission = async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.id);
    if (!admission) return res.status(404).json({ message: 'Admission not found' });
    res.json(admission);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createAdmission = async (req, res) => {
  try {
    const admission = new Admission(req.body);
    await admission.save();
    res.status(201).json(admission);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateAdmission = async (req, res) => {
  try {
    const admission = await Admission.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!admission) return res.status(404).json({ message: 'Admission not found' });
    res.json(admission);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteAdmission = async (req, res) => {
  try {
    const admission = await Admission.findByIdAndDelete(req.params.id);
    if (!admission) return res.status(404).json({ message: 'Admission not found' });
    res.json({ message: 'Admission deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── DEMO / INQUIRY MANAGEMENT ───────────────────────────────────────────────

exports.getAllDemos = async (req, res) => {
  try {
    const demos = await Demo.find().sort({ createdAt: -1 });
    res.json(demos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteDemo = async (req, res) => {
  try {
    await Demo.findByIdAndDelete(req.params.id);
    res.json({ message: 'Demo request deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── PAYMENT / FINANCIAL REPORTING ───────────────────────────────────────────

exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate('user course').sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getFinancialReport = async (req, res) => {
  try {
    const payments = await Payment.find({ status: 'completed' });
    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    res.json({ total, count: payments.length, payments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── JOB MANAGEMENT ──────────────────────────────────────────────────────────

exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createJob = async (req, res) => {
  try {
    const job = new Job(req.body);
    await job.save();
    res.status(201).json(job);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json({ message: 'Job deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── BLOG MANAGEMENT ──────────────────────────────────────────────────────────

exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createBlog = async (req, res) => {
  try {
    const { title } = req.body;
    const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    const blog = new Blog({ ...req.body, slug });
    await blog.save();
    res.status(201).json(blog);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateBlog = async (req, res) => {
  try {
    const { title } = req.body;
    const updateData = { ...req.body };
    if (title) {
      updateData.slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    }
    const blog = await Blog.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json({ message: 'Blog deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── DASHBOARD STATS ─────────────────────────────────────────────────────────

exports.getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalCourses, totalAdmissions, totalDemos, totalJobs, totalBlogs, recentUsers, recentAdmissions] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      Admission.countDocuments(),
      Demo.countDocuments(),
      Job.countDocuments(),
      Blog.countDocuments(),
      User.find().select('-password').sort({ createdAt: -1 }).limit(5),
      Admission.find().sort({ createdAt: -1 }).limit(5),
    ]);
    res.json({ totalUsers, totalCourses, totalAdmissions, totalDemos, totalJobs, totalBlogs, recentUsers, recentAdmissions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
