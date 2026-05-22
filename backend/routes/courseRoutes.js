const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const { protect, authorize } = require('../middleware/auth');

// Get all courses (Public)
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single course (Public)
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create course (Instructor/Admin)
router.post('/', protect, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const newCourse = new Course({
      ...req.body,
      instructorId: req.user.id,
      instructor: req.body.instructor || req.user.name || 'Instructor'
    });
    const saved = await newCourse.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update course (Instructor/Admin)
router.put('/:id', protect, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Instructors can only update their own courses
    if (req.user.role === 'instructor' && course.instructorId?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this coure' });
    }

    const updateData = { ...req.body };
    if (updateData.fee !== undefined) {
      updateData.fee = Number(updateData.fee);
    }
    const updated = await Course.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete course (Instructor who owns it, or Admin)
router.delete('/:id', protect, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Instructors can only delete their own courses
    if (req.user.role === 'instructor' && course.instructorId?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this course' });
    }

    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'Course deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Seed data
router.post('/seed', async (req, res) => {
  const seedCourses = [
    {
      title: 'Full Stack Web Development',
      category: 'Web Development',
      level: 'Beginner',
      duration: '12 Weeks',
      fee: '25000',
      instructor: 'Ramesh Adhikari',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      description: 'Learn HTML, CSS, JavaScript, React, Node.js and MongoDB. Comprehensive guide from zero to hero.',
      prerequisites: 'Basic computer knowledge',
      syllabus: ['HTML & CSS Basics', 'JavaScript Fundamentals', 'React.js', 'Node.js & Express', 'MongoDB', 'Final Project'],
      enrollmentDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    },
    {
      title: 'Python for Data Science',
      category: 'Data Science',
      level: 'Intermediate',
      duration: '8 Weeks',
      fee: '20000',
      instructor: 'Sita Sharma',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      description: 'Master Python programming, Pandas, NumPy, and basic Machine Learning algorithms for data analytics.',
      prerequisites: 'Basic programming concepts',
      syllabus: ['Python Basics', 'Pandas & NumPy', 'Data Visualization', 'Machine Learning Intro'],
      enrollmentDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    }
  ];
  try {
    await Course.deleteMany({});
    const created = await Course.insertMany(seedCourses);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
