const mongoose = require('mongoose');

const demoSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  course: { type: String, required: true },
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' }
}, { timestamps: true });

module.exports = mongoose.model('Demo', demoSchema);
