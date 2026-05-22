const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'AssignmentTask' },
  title: { type: String, required: true },
  fileUrl: { type: String, required: true }, // The uploaded assignment link
  grade: { type: String, default: 'Pending' },
  feedback: { type: String, default: '' },
  status: { type: String, enum: ['submitted', 'graded'], default: 'submitted' }
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
