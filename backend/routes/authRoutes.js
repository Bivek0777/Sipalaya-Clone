const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { protect, authorize } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

// Get Profile (Populated with courses)
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('enrolledCourses').select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findById(req.user.id);
    
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }
    
    await user.save();
    res.json({ message: 'Profile updated successfully', user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const { sendWelcomeEmail } = require('../services/emailService');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();
    
    // Send Welcome Email
    sendWelcomeEmail(user.email, user.name).catch(err => console.error("Email fail:", err));

    const token = jwt.sign({ id: user._id, role: user.role, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ message: 'User created successfully', token, user: { id: user._id, name: user.name, role: user.role, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    
    const isBcryptHash = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');
    let isMatch = false;

    if (isBcryptHash) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      // Fallback for older plaintext passwords created before bcrypt was added
      isMatch = password === user.password;
      
      // Upgrade the password in the database silently
      if (isMatch) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
      }
    }

    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ message: 'Logged in successfully', token, user: { id: user._id, name: user.name, role: user.role, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all users (Admin)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete user (Admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user (Admin)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }
    const updated = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
