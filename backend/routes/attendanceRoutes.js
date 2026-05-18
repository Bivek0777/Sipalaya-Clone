const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  markAttendance,
  getCourseAttendance,
  getStudentAttendance
} = require('../controllers/attendanceController');

// Mark attendance (Instructor/Admin)
router.post('/', protect, authorize('instructor', 'admin'), markAttendance);

// Get course attendance (Instructor/Admin)
router.get('/course/:courseId', protect, authorize('instructor', 'admin'), getCourseAttendance);

// Get my attendance (Student)
router.get('/my', protect, authorize('student'), getStudentAttendance);

module.exports = router;
