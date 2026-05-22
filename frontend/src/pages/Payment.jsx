import React, { useState, useContext, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import EsewaPaymentButton from "../components/EsewaPaymentButton";
import KhaltiPaymentButton from "../components/KhaltiPaymentButton";
import StripePayment from "../components/StripePayment";
import { CheckCircle2, AlertCircle, ArrowLeft, ShieldCheck } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

export default function Payment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useContext(AuthContext);
  const amount = Number(searchParams.get("amount"));
  const productId = searchParams.get("productId");
  const method = searchParams.get("method") || "stripe";
  const plan = searchParams.get("plan") || "full";
  const totalAmount = Number(searchParams.get("total")) || amount;
  const admissionId = searchParams.get("admissionId");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
    }
  }, [authLoading, user, navigate]);

  // Save payment result to backend and update enrollment
  const handlePaymentSuccess = async (methodUsed, transactionId) => {
    try {
      await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: user?._id || user?.id,
          course: productId,
          amount,
          method: methodUsed,
          status: "completed",
          transactionId,
          admissionId
        }),
      });
      localStorage.removeItem('admission_form_data');
      setStatus("success");
      setTimeout(() => navigate("/student-portal"), 2000);
    } catch (err) {
      setStatus("fail");
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-16 flex items-center justify-center">
      <div className="max-w-md w-full px-4">
        
        <div className="mb-6">
          <Link to={`/admission`} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
            <ArrowLeft size={16} className="mr-2" />
            Back to Admission
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-slate-50 border border-slate-100 z-0 pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <ShieldCheck size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Complete Payment</h2>
              <p className="text-slate-500 text-sm">Securely process your transaction to confirm your enrollment.</p>
            </div>

            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 space-y-3 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Amount Due Now</span>
                <span className="text-2xl font-bold text-slate-900">Rs. {amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-slate-500">
                <span>Payment Plan</span>
                <span>{plan === 'full' ? 'Full Payment (5% discount)' : 'Installment (50% now)'}</span>
              </div>
              {plan === 'installment' && (
                <div className="flex justify-between items-center text-sm text-slate-500">
                  <span>Remaining</span>
                  <span>Rs. {remaining.toLocaleString()}</span>
                </div>
              )}
              {totalAmount !== amount && (
                <div className="rounded-xl bg-slate-100 p-3 text-xs text-slate-600">
                  Total course fee: Rs. {totalAmount.toLocaleString()}
                </div>
              )}
            </div>

            {status === "success" && (
              <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-xl border border-green-200 flex items-start">
                <CheckCircle2 className="mr-3 flex-shrink-0 mt-0.5 text-green-500" size={20} />
                <div>
                  <p className="font-bold">Payment Successful!</p>
                  <p className="text-sm mt-1">Redirecting to your student portal...</p>
                </div>
              </div>
            )}

            {status === "fail" && (
              <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 flex items-start">
                <AlertCircle className="mr-3 flex-shrink-0 mt-0.5 text-red-500" size={20} />
                <div>
                  <p className="font-bold">Payment Failed</p>
                  <p className="text-sm mt-1">There was an error processing your payment. Please try again.</p>
                </div>
              </div>
            )}

            {!status && (
              <div className="space-y-6">
                {method === "esewa" && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 text-center">Pay via eSewa</h3>
                    <EsewaPaymentButton amount={amount} productId={productId} admissionId={admissionId} onSuccess={txId => handlePaymentSuccess("eSewa", txId)} />
                  </div>
                )}

                {method === "khalti" && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 text-center">Pay via Khalti</h3>
                    <KhaltiPaymentButton amount={amount} productId={productId} admissionId={admissionId} onSuccess={txId => handlePaymentSuccess("Khalti", txId)} />
                  </div>
                )}

                {method === "stripe" && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 text-center">Pay with Card</h3>
                    <StripePayment amount={amount} productId={productId} admissionId={admissionId} onSuccess={txId => handlePaymentSuccess("Stripe", txId)} />
                  </div>
                )}
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center items-center text-xs text-slate-400">
              <ShieldCheck size={14} className="mr-1.5" />
              100% Encrypted & Secure
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
