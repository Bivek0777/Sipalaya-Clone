const express = require('express');
const router = express.Router();
const Review = require('../models/Review');

// Submit a review
router.post('/', async (req, res) => {
  try {
    const newReview = new Review(req.body);
    const saved = await newReview.save();
    res.status(201).json({ message: 'Review submitted for approval', data: saved });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get approved reviews for a course
router.get('/course/:courseId', async (req, res) => {
  try {
    const reviews = await Review.find({ courseId: req.params.courseId, approved: true });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all reviews (Admin)
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find().populate('courseId', 'title');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve or delete review
router.put('/:id', async (req, res) => {
  try {
    const updated = await Review.findByIdAndUpdate(req.params.id, { approved: req.body.approved }, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
