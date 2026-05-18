const express = require('express');
const router = express.Router();
const Demo = require('../models/Demo');
const { protect, authorize } = require('../middleware/auth');

// Book a demo (Public)
router.post('/', async (req, res) => {
  try {
    const newDemo = new Demo(req.body);
    const saved = await newDemo.save();
    res.status(201).json({ message: 'Demo booked successfully', data: saved });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all demos (Admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const demos = await Demo.find();
    res.json(demos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a demo (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Demo.findByIdAndDelete(req.params.id);
    res.json({ message: 'Demo request dismissed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
