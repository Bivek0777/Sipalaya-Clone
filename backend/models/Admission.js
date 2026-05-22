const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  course: { type: String, required: true },
  paymentPreference: { type: String, required: true },
  paymentPlan: { type: String, enum: ['full', 'installment'], default: 'full' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  paymentStatus: { type: String, enum: ['unpaid', 'paid', 'failed'], default: 'unpaid' },
  paymentTransactionId: { type: String, default: null },
  paidAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Admission', admissionSchema);
