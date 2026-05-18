import React, { useState } from "react";

function KhaltiPaymentButton({ amount, productId, admissionId }) {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payments/khalti/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          productId,
          productName: "Course Enrollment",
          successUrl: `${window.location.origin}/payment-success?courseId=${productId}&amount=${amount}&admissionId=${admissionId || ''}`,
        }),
      });
      const data = await res.json();
      
      if (data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        alert("Khalti payment initiation failed!");
      }
    } catch (err) {
      console.error(err);
      alert("Error initiating Khalti payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <button 
        onClick={handlePay}
        disabled={loading}
        className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors flex justify-center items-center shadow-lg disabled:opacity-50"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <>
            <img src="https://khalti.com/static/images/logo.png" alt="Khalti" className="h-5 mr-2 filter brightness-0 invert" />
            Pay with Khalti
          </>
        )}
      </button>
    </div>
  );
}

export default KhaltiPaymentButton;

