const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const Resource = require('../models/Resource');
const {
  getMyCourses,
  getMyStudents,
  getPerformanceOverview,
  getMyResources,
  deleteResource,
  updateStudentProgress,
  getAttendanceByCourse,
} = require('../controllers/instructorController');

const instructorAuth = [protect, authorize('instructor', 'admin')];

// ─── Dashboard Overview ───────────────────────────────────────────────────────
router.get('/overview', instructorAuth, getPerformanceOverview);

// ─── Courses ──────────────────────────────────────────────────────────────────
router.get('/courses', instructorAuth, getMyCourses);

// ─── Students & Progress ──────────────────────────────────────────────────────
router.get('/students', instructorAuth, getMyStudents);
router.put('/students/progress', instructorAuth, updateStudentProgress);

// ─── Resources ────────────────────────────────────────────────────────────────
router.get('/resources', instructorAuth, getMyResources);
router.post('/resources/upload', instructorAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const { title, courseId } = req.body;
    if (!courseId) return res.status(400).json({ message: 'courseId is required' });

    const mimeType = req.file.mimetype;
    let fileType = 'document';
    if (mimeType.startsWith('video/')) fileType = 'video';
    else if (mimeType === 'application/pdf') fileType = 'pdf';
    else if (mimeType.includes('zip') || mimeType.includes('compressed')) fileType = 'zip';
    else if (mimeType.startsWith('image/')) fileType = 'image';

    const newResource = new Resource({
      title: title || req.file.originalname,
      url: req.file.path,
      courseId,
      type: fileType,
      instructorId: req.user.id
    });
    await newResource.save();
    res.status(201).json({ message: 'Resource uploaded successfully', resource: newResource });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.delete('/resources/:id', instructorAuth, deleteResource);

// ─── Attendance ───────────────────────────────────────────────────────────────
router.get('/attendance/:courseId', instructorAuth, getAttendanceByCourse);

module.exports = router;
