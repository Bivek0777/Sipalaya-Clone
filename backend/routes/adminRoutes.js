const express = require('express');
const router = express.Router();
const {
  // Users
  getAllUsers, getUser, createUser, updateUser, deleteUser, getAllInstructors,
  assignCoursesToInstructor,
  // Courses
  getAllCourses, getCourse, createCourse, updateCourse, deleteCourse, approveCourse,
  // Admissions
  getAllAdmissions, getAdmission, createAdmission, updateAdmission, deleteAdmission,
  // Demos
  getAllDemos, deleteDemo,
  // Jobs
  getAllJobs, createJob, updateJob, deleteJob,
  // Blogs
  getAllBlogs, createBlog, updateBlog, deleteBlog,
  // Payments
  getAllPayments, getFinancialReport,
  // Stats
  getDashboardStats,
} = require('../controllers/adminController');
const { adminAuth } = require('../middleware/auth');

// Dashboard stats
router.get('/stats', adminAuth, getDashboardStats);

// ─── User Management ─────────────────────────────────────────────────────────
router.get('/users', adminAuth, getAllUsers);
router.post('/users', adminAuth, createUser);
router.get('/users/:id', adminAuth, getUser);
router.put('/users/:id', adminAuth, updateUser);
router.delete('/users/:id', adminAuth, deleteUser);
router.get('/instructors', adminAuth, getAllInstructors);
router.put('/instructors/:id/courses', adminAuth, assignCoursesToInstructor);

// ─── Course Management ───────────────────────────────────────────────────────
router.get('/courses', adminAuth, getAllCourses);
router.post('/courses', adminAuth, createCourse);
router.get('/courses/:id', adminAuth, getCourse);
router.put('/courses/:id', adminAuth, updateCourse);
router.delete('/courses/:id', adminAuth, deleteCourse);
router.put('/courses/:id/approve', adminAuth, approveCourse);

// ─── Admission Management ────────────────────────────────────────────────────
router.get('/admissions', adminAuth, getAllAdmissions);
router.post('/admissions', adminAuth, createAdmission);
router.get('/admissions/:id', adminAuth, getAdmission);
router.put('/admissions/:id', adminAuth, updateAdmission);
router.delete('/admissions/:id', adminAuth, deleteAdmission);

// ─── Demo Requests ───────────────────────────────────────────────────────────
router.get('/demos', adminAuth, getAllDemos);
router.delete('/demos/:id', adminAuth, deleteDemo);

// ─── Job Management ──────────────────────────────────────────────────────────
router.get('/jobs', adminAuth, getAllJobs);
router.post('/jobs', adminAuth, createJob);
router.put('/jobs/:id', adminAuth, updateJob);
router.delete('/jobs/:id', adminAuth, deleteJob);

// ─── Blog Management ─────────────────────────────────────────────────────────
router.get('/blogs', adminAuth, getAllBlogs);
router.post('/blogs', adminAuth, createBlog);
router.put('/blogs/:id', adminAuth, updateBlog);
router.delete('/blogs/:id', adminAuth, deleteBlog);

// ─── Financial ───────────────────────────────────────────────────────────────
router.get('/payments', adminAuth, getAllPayments);
router.get('/financial-report', adminAuth, getFinancialReport);

module.exports = router;
