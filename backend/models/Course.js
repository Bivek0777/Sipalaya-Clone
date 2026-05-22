const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  level: { type: String, default: 'Beginner' },
  duration: { type: String, required: true },
  fee: { type: Number, required: true },
  instructor: { type: String, required: true },
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: { type: Number, default: 0 },
  image: { type: String, default: '' },
  description: { type: String, default: '' },
  syllabus: [{ type: String }],
  prerequisites: { type: String },
  enrollmentDeadline: { type: Date },
  isPublished: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
