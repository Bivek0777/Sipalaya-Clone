const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// Submit a contact inquiry
router.post('/', async (req, res) => {
  try {
    const newContact = new Contact(req.body);
    const saved = await newContact.save();
    res.status(201).json({ message: 'Inquiry submitted successfully', data: saved });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all inquiries (Admin)
router.get('/', async (req, res) => {
  try {
    const inquiries = await Contact.find().sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update inquiry status
router.put('/:id', async (req, res) => {
  try {
    const updated = await Contact.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete an inquiry (Admin)
router.delete('/:id', async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ message: 'Inquiry deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
