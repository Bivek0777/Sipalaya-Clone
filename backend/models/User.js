const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'instructor', 'admin'], default: 'student' },
  enrolledCourses: [{
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    progress: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'completed'], default: 'active' }
  }],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
