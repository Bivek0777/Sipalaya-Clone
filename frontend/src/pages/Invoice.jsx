import { CheckCircle2, Download, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

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
    // Mock amounts
    const baseAmount = 25000; 
    if (paymentPlan === 'installment') return baseAmount / 2;
    return baseAmount * 0.95; // 5% discount for full
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12 print:bg-white print:py-0">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex justify-between items-center mb-8 print:hidden">
          <Link to="/" className="flex items-center text-slate-600 hover:text-indigo-600">
            <Home size={18} className="mr-2" /> Back to Home
          </Link>
          <button onClick={handlePrint} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <Download size={18} className="mr-2" /> Download / Print PDF
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 md:p-12 print:shadow-none print:border-none">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-8 mb-8">
            <div className="flex items-center mb-6 md:mb-0">
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mr-4 shadow-md">
                S
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sipalaya Info Tech</h1>
                <p className="text-sm text-slate-500 font-medium">IT Training Institute</p>
              </div>
            </div>
            <div className="text-left md:text-right">
              <h2 className="text-3xl font-bold text-slate-300 uppercase tracking-widest mb-2">Invoice</h2>
              <p className="font-bold text-slate-700">{invoiceNumber}</p>
              <p className="text-slate-500 text-sm">Date: {date}</p>
            </div>
          </div>

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

          {/* Items */}
          <div className="border border-slate-200 rounded-xl overflow-hidden mb-8">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-bold text-slate-900">Course Description</th>
                  <th className="px-6 py-4 font-bold text-slate-900 text-right">Amount (Rs.)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{course}</p>
                    <p className="text-slate-500 text-xs mt-1">Enrollment Fee ({paymentPlan})</p>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-slate-900">
                    {getAmount().toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div className="flex justify-end border-t border-slate-200 pt-8 mb-12">
            <div className="w-full md:w-1/2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-500">Subtotal</span>
                <span className="text-slate-900 font-medium">Rs. {getAmount().toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200">
                <span className="text-slate-500">Tax (0%)</span>
                <span className="text-slate-900 font-medium">Rs. 0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-slate-900">Total Due</span>
                <span className="text-2xl font-bold text-indigo-600">Rs. {getAmount().toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-8 border-t border-slate-200">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 text-green-500 rounded-full mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Thank you for enrolling!</h3>
            <p className="text-slate-500 text-sm">Your payment has been successfully processed via {paymentPreference}.</p>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Invoice;
