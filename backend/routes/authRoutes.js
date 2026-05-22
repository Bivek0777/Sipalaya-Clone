const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { protect, authorize } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

// Get Profile (Populated with courses)
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('enrolledCourses.course').select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    const user = await User.findById(req.user.id);
    
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }
    
    await user.save();
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const { sendWelcomeEmail, sendPasswordResetEmail, getEmailStatus, sendTestEmail } = require('../services/emailService');

// Admin Email Status
router.get('/email-status', protect, authorize('admin'), async (req, res) => {
  try {
    res.json(getEmailStatus());
  } catch (error) {
    console.error('Email status error:', error);
    res.status(500).json({ message: 'Unable to retrieve email status.' });
  }
});

// Admin Test Delivery
router.post('/email-test', protect, authorize('admin'), async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Recipient email is required.' });
    }

    const result = await sendTestEmail(email);
    res.json({ message: 'Test email sent.', previewUrl: result.previewUrl });
  } catch (error) {
    console.error('Email test error:', error);
    res.status(500).json({ message: 'Failed to send test email.', error: error.message });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    if (!name || !email || !password || !phone || !address) {
      return res.status(400).json({ message: 'Name, email, password, phone, and address are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Hardcode the role to 'student' to prevent self-registration of instructors/admins
    const user = new User({ name, email: normalizedEmail, password: hashedPassword, phone, address, role: 'student' });
    await user.save();
    
    // Send Welcome Email
    sendWelcomeEmail(user.email, user.name).catch(err => console.error("Email fail:", err));

    const token = jwt.sign({ id: user._id, role: user.role, name: user.name, email: user.email, phone: user.phone, address: user.address }, JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ message: 'User created successfully', token, user: { id: user._id, name: user.name, role: user.role, email: user.email, phone: user.phone, address: user.address } });
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

    const token = jwt.sign({ id: user._id, role: user.role, name: user.name, email: user.email, phone: user.phone, address: user.address }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ message: 'Logged in successfully', token, user: { id: user._id, name: user.name, role: user.role, email: user.email, phone: user.phone, address: user.address } });
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
    if (updateData.email) {
      updateData.email = updateData.email.toLowerCase().trim();
    }
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

// ── Forgot Password ─────────────────────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    // Always respond 200 so we don't reveal whether the email exists
    if (!user) {
      return res.json({ message: 'If that email exists, a reset link has been sent.' });
    }

    // Generate a secure random token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.resetPasswordToken   = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink   = `${frontendUrl}/reset-password/${rawToken}`;

    const result = await sendPasswordResetEmail(user.email, user.name, resetLink);
    const response = { message: 'If that email exists, a reset link has been sent.' };
    if (result?.previewUrl) {
      response.previewUrl = result.previewUrl;
    }

    res.json(response);
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Failed to send reset email. Please try again later.' });
  }
});

// ── Reset Password ───────────────────────────────────────────────────────────
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    // Hash the URL token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken:   hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Reset link is invalid or has expired. Please request a new one.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password             = await bcrypt.hash(password, salt);
    user.resetPasswordToken   = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully! You can now log in with your new password.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
