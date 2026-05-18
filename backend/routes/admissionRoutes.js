const express = require('express');
const router = express.Router();
const Admission = require('../models/Admission');
const { protect, authorize } = require('../middleware/auth');

// Create admission (Public or Student)
router.post('/', async (req, res) => {
  try {
    const newAdmission = new Admission(req.body);
    const saved = await newAdmission.save();
    res.status(201).json({ message: 'Admission created successfully', data: saved });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all admissions (Admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const admissions = await Admission.find();
    res.json(admissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
