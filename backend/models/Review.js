const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  studentName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  reviewText: { type: String, required: true },
  approved: { type: Boolean, default: false } // Admin approval
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
