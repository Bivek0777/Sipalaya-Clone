const mongoose = require('mongoose');

const assignmentTaskSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  deadline: { type: Date },
  maxScore: { type: Number, default: 100 }
}, { timestamps: true });

module.exports = mongoose.model('AssignmentTask', assignmentTaskSchema);
