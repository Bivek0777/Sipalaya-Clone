// Invoice utility (placeholder)
// Extend with PDF generation and database logic as needed

exports.generateInvoice = async (paymentDetails) => {
  // TODO: Implement invoice generation (e.g., using pdfkit or invoice npm packages)
  // Save invoice to DB or file system
  return {
    invoiceId: 'INV-' + Date.now(),
    ...paymentDetails,
    generatedAt: new Date(),
  };
};
