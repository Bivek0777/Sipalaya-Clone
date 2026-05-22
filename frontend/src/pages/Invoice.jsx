import { CheckCircle2, Download, Home, Printer } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';

const Invoice = () => {
  const location = useLocation();
  const { admissionData } = location.state || {};

  if (!admissionData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4">No Invoice Found</h2>
        <Link to="/" className="text-indigo-600 underline">Return Home</Link>
      </div>
    );
  }

  const { fullName, email, phone, course, paymentPreference, paymentPlan, _id, createdAt } = admissionData;
  const date = new Date(createdAt || Date.now()).toLocaleDateString();
  const invoiceNumber = `INV-${(_id || Math.floor(Math.random() * 1000000)).toString().slice(-6).toUpperCase()}`;

  const getAmount = () => {
    const baseAmount = 25000;
    if (paymentPlan === 'installment') return baseAmount / 2;
    return baseAmount * 0.95;
  };

  const handlePrint = () => window.print();

  const handleDownloadPDF = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();

    // Header background
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, pageW, 40, 'F');

    // Logo circle
    doc.setFillColor(255, 255, 255);
    doc.circle(20, 20, 10, 'F');
    doc.setTextColor(79, 70, 229);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('S', 16.5, 24);

    // Company name
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Sipalaya Info Tech', 35, 18);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('IT Training Institute | Koteshwor, Kathmandu', 35, 25);

    // Invoice label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text('INVOICE', pageW - 15, 18, { align: 'right' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(invoiceNumber, pageW - 15, 26, { align: 'right' });
    doc.text(`Date: ${date}`, pageW - 15, 32, { align: 'right' });

    // Billed To
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('BILLED TO', 15, 55);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(fullName || 'Student', 15, 63);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(email || '', 15, 70);
    doc.text(phone || '', 15, 77);

    // Payment Info
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT INFO', pageW - 15, 55, { align: 'right' });
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Gateway: ${(paymentPreference || '').toUpperCase()}`, pageW - 15, 63, { align: 'right' });
    doc.text(`Plan: ${(paymentPlan || '').replace('_', ' ')} Payment`, pageW - 15, 70, { align: 'right' });

    // Divider
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(15, 87, pageW - 15, 87);

    // Table header
    doc.setFillColor(248, 250, 252);
    doc.rect(15, 92, pageW - 30, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text('DESCRIPTION', 20, 99);
    doc.text('AMOUNT (Rs.)', pageW - 20, 99, { align: 'right' });

    // Table row
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(course || 'Course Enrollment', 20, 112);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Enrollment Fee — ${paymentPlan} payment plan`, 20, 119);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(`Rs. ${getAmount().toLocaleString()}`, pageW - 20, 112, { align: 'right' });

    // Divider
    doc.setDrawColor(226, 232, 240);
    doc.line(15, 128, pageW - 15, 128);

    // Total
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text('Subtotal', pageW - 60, 138);
    doc.text(`Rs. ${getAmount().toLocaleString()}`, pageW - 20, 138, { align: 'right' });
    doc.text('Tax (0%)', pageW - 60, 146);
    doc.text('Rs. 0', pageW - 20, 146, { align: 'right' });

    doc.setDrawColor(226, 232, 240);
    doc.line(pageW - 70, 151, pageW - 15, 151);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(79, 70, 229);
    doc.text('Total Due', pageW - 60, 161);
    doc.text(`Rs. ${getAmount().toLocaleString()}`, pageW - 20, 161, { align: 'right' });

    // Footer
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 270, pageW, 30, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Thank you for enrolling with Sipalaya Info Tech!', pageW / 2, 280, { align: 'center' });
    doc.text('infotech@sipalaya.com | +977 9851344071 | Koteshwor, Kathmandu, Nepal', pageW / 2, 287, { align: 'center' });
    doc.text(`© ${new Date().getFullYear()} Sipalaya Info Tech Pvt. Ltd. All rights reserved.`, pageW / 2, 294, { align: 'center' });

    doc.save(`${invoiceNumber}.pdf`);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12 print:bg-white print:py-0">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8 print:hidden">
          <Link to="/" className="flex items-center text-slate-600 hover:text-indigo-600">
            <Home size={18} className="mr-2" /> Back to Home
          </Link>
          <div className="flex gap-3">
            <button onClick={handlePrint} className="flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
              <Printer size={16} className="mr-2" /> Print
            </button>
            <button onClick={handleDownloadPDF} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              <Download size={16} className="mr-2" /> Download PDF
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden print:shadow-none print:border-none">
          {/* Branded Header */}
          <div className="bg-indigo-600 px-8 py-8 md:px-12 flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 font-bold text-xl mr-4 shadow">S</div>
              <div>
                <h1 className="text-xl font-extrabold text-white">Sipalaya Info Tech</h1>
                <p className="text-indigo-200 text-sm">IT Training Institute</p>
              </div>
            </div>
            <div className="text-left md:text-right">
              <p className="text-3xl font-bold text-indigo-200 uppercase tracking-widest">Invoice</p>
              <p className="font-bold text-white mt-1">{invoiceNumber}</p>
              <p className="text-indigo-200 text-sm">Date: {date}</p>
            </div>
          </div>

          <div className="px-8 py-8 md:px-12">
            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Billed To</h3>
                <p className="font-bold text-slate-900 text-lg">{fullName}</p>
                <p className="text-slate-600">{email}</p>
                <p className="text-slate-600">{phone}</p>
              </div>
              <div className="md:text-right">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Payment Info</h3>
                <p className="font-bold text-slate-900 capitalize">{paymentPreference}</p>
                <p className="text-slate-600 capitalize">{paymentPlan} Plan</p>
              </div>
            </div>

            {/* Items Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden mb-8">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-bold text-slate-900">Course Description</th>
                    <th className="px-6 py-4 font-bold text-slate-900 text-right">Amount (Rs.)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-6 py-5">
                      <p className="font-bold text-slate-900">{course}</p>
                      <p className="text-slate-500 text-xs mt-1">Enrollment Fee — {paymentPlan} payment plan</p>
                    </td>
                    <td className="px-6 py-5 text-right font-medium text-slate-900">{getAmount().toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="flex justify-end mb-10">
              <div className="w-full md:w-1/2 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="text-slate-900 font-medium">Rs. {getAmount().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm pb-4 border-b border-slate-200">
                  <span className="text-slate-500">Tax (0%)</span>
                  <span className="text-slate-900 font-medium">Rs. 0</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-xl font-bold text-slate-900">Total Due</span>
                  <span className="text-2xl font-bold text-indigo-600">Rs. {getAmount().toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-8 border-t border-slate-200">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-green-50 text-green-500 rounded-full mb-4">
                <CheckCircle2 size={28} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Thank you for enrolling!</h3>
              <p className="text-slate-500 text-sm">Payment processed via {paymentPreference}. Check your email for confirmation.</p>
              <p className="text-xs text-slate-400 mt-4">Sipalaya Info Tech Pvt. Ltd. · Koteshwor, Kathmandu · infotech@sipalaya.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
