import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';

const PaymentFail = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-20 flex flex-col items-center justify-center px-4">
      <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200 text-center max-w-md w-full relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-red-50 z-0"></div>
        <div className="relative z-10">
          <AlertCircle size={80} className="text-red-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Payment Failed</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            We couldn't process your transaction. Please check your payment details or try a different method.
          </p>
          
          <Link 
            to="/courses" 
            className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors flex justify-center items-center shadow-lg"
          >
            <ArrowLeft size={20} className="mr-2" /> Return to Courses
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentFail;
