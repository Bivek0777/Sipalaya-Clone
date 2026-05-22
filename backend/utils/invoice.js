const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const Invoice = require('../models/Invoice');
const User = require('../models/User');
const Course = require('../models/Course');

exports.generateInvoice = async (payment) => {
  const user = await User.findById(payment.user);
  const course = await Course.findById(payment.course);
  const invoiceNumber = `INV-${Date.now()}`;
  const invoicesDir = path.join(__dirname, '..', 'invoices');

  if (!fs.existsSync(invoicesDir)) {
    fs.mkdirSync(invoicesDir, { recursive: true });
  }

  const fileName = `${invoiceNumber}.pdf`;
  const filePath = path.join(invoicesDir, fileName);
  const fileUrl = `/api/invoices/files/${fileName}`;

  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const writeStream = fs.createWriteStream(filePath);
  doc.pipe(writeStream);

  doc
    .fontSize(20)
    .text('Sipalaya Info Tech', { align: 'center' })
    .moveDown(0.5);

  doc.fontSize(12).text('IT Training Institute', { align: 'center' });
  doc.moveDown(1);

  doc.fontSize(14).text('INVOICE', { align: 'right' });
  doc.fontSize(10).text(`Invoice Number: ${invoiceNumber}`, { align: 'right' });
  doc.text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' });
  doc.moveDown(1);

  doc.fontSize(10).text(`Billed To: ${user?.fullName || 'Student'}`);
  doc.text(`Email: ${user?.email || 'N/A'}`);
  doc.text(`Phone: ${user?.phone || 'N/A'}`);
  doc.moveDown(0.5);

  doc.text(`Course: ${course?.title || 'Course Enrollment'}`);
  doc.text(`Payment Method: ${payment.method}`);
  doc.text(`Transaction ID: ${payment.transactionId || 'N/A'}`);
  doc.moveDown(1);

  doc.fontSize(12).text('Charge Summary', { underline: true });
  doc.moveDown(0.5);

  doc.fontSize(10);
  doc.text(`Description: ${course?.title || 'Course Enrollment'}`);
  doc.text(`Amount: Rs. ${payment.amount.toLocaleString()}`);
  doc.text('Tax: Rs. 0');
  doc.moveDown(1);

  doc.fontSize(12).text(`Total Due: Rs. ${payment.amount.toLocaleString()}`, { align: 'right' });
  doc.moveDown(2);

  doc.fontSize(9).fillColor('gray').text('Thank you for enrolling with Sipalaya Info Tech.', { align: 'center' });

  doc.end();
  await new Promise((resolve, reject) => {
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });

  const invoice = new Invoice({
    user: payment.user,
    payment: payment._id,
    course: payment.course,
    invoiceNumber,
    fileName,
    filePath,
    amount: payment.amount,
    method: payment.method,
    transactionId: payment.transactionId,
  });

  await invoice.save();

  return {
    invoiceId: invoice._id,
    invoiceNumber,
    fileUrl,
    issuedAt: invoice.issuedAt,
  };
};
