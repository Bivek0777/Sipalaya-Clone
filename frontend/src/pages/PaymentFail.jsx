import React, { useEffect, useContext } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const PaymentFail = () => {
  const [searchParams] = useSearchParams();
  const { user } = useContext(AuthContext);
  const admissionId = searchParams.get('admissionId');
  const courseId = searchParams.get('courseId');

  // Mark admission as failed when payment fails
  useEffect(() => {
    const markFailed = async () => {
      if (admissionId && user) {
        try {
          await axios.post('/api/payments', {
            user: user._id || user.id,
            course: courseId || 'unknown',
            amount: 0,
            method: 'unknown',
            status: 'failed',
            transactionId: `FAILED-${Date.now()}`,
            admissionId
          });
        } catch (err) {
          console.error('Failed to record payment failure:', err);
        }
      }
    };
    markFailed();
  }, [admissionId, user]);

  return (
    <div className="bg-slate-50 min-h-screen py-20 flex flex-col items-center justify-center px-4">
      <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200 text-center max-w-md w-full relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-red-50 z-0"></div>
        <div className="relative z-10">
          <AlertCircle size={80} className="text-red-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Payment Failed</h2>
          <p className="text-slate-600 mb-4 leading-relaxed">
            We couldn't process your transaction. Your admission status has been kept as <span className="font-semibold text-amber-600">pending</span>.
          </p>
          <p className="text-sm text-slate-500 mb-8">
            Please try again with a different payment method, or contact our support team for assistance.
          </p>
          
          <div className="space-y-3">
            <Link 
              to="/admission" 
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors flex justify-center items-center shadow-lg"
            >
              Try Again
            </Link>
            <Link 
              to="/courses" 
              className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors flex justify-center items-center"
            >
              <ArrowLeft size={18} className="mr-2" /> Return to Courses
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFail;
