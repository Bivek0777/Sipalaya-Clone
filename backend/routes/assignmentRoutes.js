const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const {
  submitAssignment,
  getInstructorAssignments,
  gradeAssignment,
  getStudentAssignments,
  createAssignmentTask,
  getInstructorAssignmentTasks,
  getCourseAssignmentTasks,
  deleteAssignmentTask,
  uploadAssignmentFile
} = require('../controllers/assignmentController');

// ─── ASSIGNMENT TASKS (Instructor created) ───────────────────────────────────
// Create assignment task
router.post('/tasks', protect, authorize('instructor', 'admin'), createAssignmentTask);

// Get instructor tasks
router.get('/tasks/instructor', protect, authorize('instructor', 'admin'), getInstructorAssignmentTasks);

// Get tasks for a specific course (accessible by enrolled students as well)
router.get('/tasks/course/:courseId', protect, getCourseAssignmentTasks);

// Delete assignment task
router.delete('/tasks/:id', protect, authorize('instructor', 'admin'), deleteAssignmentTask);


// ─── ASSIGNMENT SUBMISSIONS (Student actions) ────────────────────────────────
// Submit assignment file upload (student uploads a file first)
router.post('/upload', protect, authorize('student'), upload.single('file'), uploadAssignmentFile);

// Submit assignment
router.post('/', protect, authorize('student'), submitAssignment);

// Get instructor submissions view (All solutions for their courses)
router.get('/instructor', protect, authorize('instructor', 'admin'), getInstructorAssignments);

// Get student's own submissions
router.get('/my', protect, authorize('student'), getStudentAssignments);

// Grade assignment submission
router.put('/:id/grade', protect, authorize('instructor', 'admin'), gradeAssignment);

module.exports = router;
