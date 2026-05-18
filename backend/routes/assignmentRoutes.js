const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  submitAssignment,
  getInstructorAssignments,
  gradeAssignment,
  getStudentAssignments
} = require('../controllers/assignmentController');

// Submit assignment (Student)
router.post('/', protect, authorize('student'), submitAssignment);

// Get instructor view (All assignments for their courses)
router.get('/instructor', protect, authorize('instructor', 'admin'), getInstructorAssignments);

// Get student's own assignments
router.get('/my', protect, authorize('student'), getStudentAssignments);

// Grade assignment (Instructor)
router.put('/:id/grade', protect, authorize('instructor', 'admin'), gradeAssignment);

module.exports = router;
