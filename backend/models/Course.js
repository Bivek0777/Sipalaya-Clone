const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  level: { type: String, required: true },
  duration: { type: String, required: true },
  fee: { type: Number, required: true },
  instructor: { type: String, required: true },
  rating: { type: Number, default: 0 },
  image: { type: String, required: true },
  description: { type: String, required: true },
  syllabus: [{ type: String }],
  prerequisites: { type: String },
  enrollmentDeadline: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
