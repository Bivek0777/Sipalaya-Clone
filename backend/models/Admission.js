const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  course: { type: String, required: true },
  paymentPreference: { type: String, required: true },
  paymentPlan: { type: String, enum: ['full', 'installment'], default: 'full' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Admission', admissionSchema);
