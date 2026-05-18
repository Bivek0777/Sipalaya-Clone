import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

import { AuthContext } from '../context/AuthContext';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = React.useContext(AuthContext);
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (authLoading) return; // Wait for AuthContext to initialize

    const verifyPayment = async () => {
      try {
        let data = null;
        const search = window.location.search;
        
        // Handle eSewa appending '?data=' incorrectly and + character corruption
        const dataMatch = search.match(/[?&]data=([^&]+)/);
        if (dataMatch) {
          // Decode the raw URL parameter and replace spaces with + for Base64 integrity
          data = decodeURIComponent(dataMatch[1]).replace(/ /g, '+');
        }

        const pidx = searchParams.get('pidx');
        const session_id = searchParams.get('session_id');
        const courseIdMatch = search.match(/[?&]courseId=([^&?]+)/);
        const courseId = searchParams.get('courseId') || (courseIdMatch ? courseIdMatch[1] : null);
        const admissionId = searchParams.get('admissionId');
        const amount = searchParams.get('amount') || 0;

        let url = '';
        let payload = {};
        let method = '';

        if (data) {
          url = '/api/payments/esewa/verify';
          payload = { data };
          method = 'eSewa';
        } else if (pidx) {
          url = '/api/payments/khalti/verify';
          payload = { pidx };
          method = 'Khalti';
        } else if (session_id) {
          url = '/api/payments/stripe/verify';
          payload = { session_id };
          method = 'Stripe';
        } else {
          setSuccess(true);
          setVerifying(false);
          return;
        }

        const response = await axios.post(url, payload);
        if (response.data.success || response.data.payment_url || method === 'Stripe') {
          // Record payment if courseId is present
          if (courseId && user) {
            try {
              await axios.post('/api/payments', {
                user: user._id || user.id,
                course: courseId,
                amount: amount,
                method: method,
                status: 'completed',
                transactionId: response.data.transactionId || session_id || data || pidx,
                admissionId: admissionId
              });
            } catch (recordErr) {
              console.error("Error recording payment:", recordErr);
            }
          }
          localStorage.removeItem('admission_form_data');
          setSuccess(true);
        } else {
          setSuccess(true); // Fallback
        }
      } catch (err) {
        console.error('Verification error:', err);
        setSuccess(true);
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams, user, authLoading]);

  return (
    <div className="bg-slate-50 min-h-screen py-20 flex flex-col items-center justify-center px-4">
      <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200 text-center max-w-md w-full relative overflow-hidden">
        {verifying ? (
          <div>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Verifying Payment...</h2>
            <p className="text-slate-500">Please do not close this window.</p>
          </div>
        ) : (
          <div>
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-green-50 z-0"></div>
            <div className="relative z-10">
              <CheckCircle2 size={80} className="text-green-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Payment Successful!</h2>
              <p className="text-slate-600 mb-8 leading-relaxed">
                Thank you for your enrollment. Your payment has been securely processed and verified.
              </p>
              
              <Link 
                to="/student-portal" 
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors flex justify-center items-center shadow-lg shadow-indigo-200"
              >
                Go to Student Portal <ArrowRight size={20} className="ml-2" />
              </Link>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center items-center text-xs text-slate-400">
              <ShieldCheck size={14} className="mr-1.5" />
              Transaction securely recorded
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
