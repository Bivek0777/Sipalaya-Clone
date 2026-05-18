const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const { protect, authorize } = require('../middleware/auth');
const Resource = require('../models/Resource');

// Upload resource (Instructors only)
router.post('/upload', protect, authorize('instructor', 'admin'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const { title, courseId } = req.body;
    
    const newResource = new Resource({
      title: title || req.file.originalname,
      url: req.file.path, // Cloudinary URL
      courseId: courseId,
      type: req.file.mimetype.split('/')[1],
      instructorId: req.user.id
    });

    await newResource.save();
    res.status(201).json({ message: 'Resource uploaded successfully', resource: newResource });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get resources by course
router.get('/course/:courseId', async (req, res) => {
  try {
    const resources = await Resource.find({ courseId: req.params.courseId });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
