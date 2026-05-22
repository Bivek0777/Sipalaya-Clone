const Invoice = require('../models/Invoice');
const path = require('path');

exports.getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('user course payment');
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    res.json({
      invoiceId: invoice._id,
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.amount,
      method: invoice.method,
      transactionId: invoice.transactionId,
      issuedAt: invoice.issuedAt,
      fileUrl: invoice.filePath,
      user: invoice.user,
      course: invoice.course,
      payment: invoice.payment,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.listInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find().populate('user course payment').sort({ issuedAt: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.downloadInvoiceFile = async (req, res) => {
  try {
    const fileName = path.basename(req.params.fileName);
    const invoicesDir = path.join(__dirname, '..', 'invoices');
    const filePath = path.join(invoicesDir, fileName);
    res.download(filePath);
  } catch (err) {
    res.status(404).json({ message: 'Invoice file not found' });
  }
};
