const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  invoiceNumber: { type: String, required: true, unique: true },
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  amount: { type: Number, required: true },
  method: { type: String, required: true },
  transactionId: { type: String },
  issuedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Invoice', InvoiceSchema);
