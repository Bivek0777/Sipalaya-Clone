import React, { useState, useEffect } from "react";

function EsewaPaymentButton({ amount, productId, admissionId }) {
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayload = async () => {
      try {
        const res = await fetch("/api/payments/esewa/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount,
            productId,
            successUrl: `${window.location.origin}/payment-success?courseId=${productId}&amount=${amount}&admissionId=${admissionId || ''}`,
            failureUrl: `${window.location.origin}/payment-fail?admissionId=${admissionId || ''}&courseId=${productId}`
          }),
        });
        const data = await res.json();
        setPayload(data.payload);
      } catch (err) {
        console.error("Failed to fetch eSewa payload", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayload();
  }, [amount, productId]);

  if (loading) {
    return (
      <button disabled className="w-full py-3 bg-green-400 text-white font-bold rounded-xl flex justify-center items-center opacity-70">
        Loading eSewa...
      </button>
    );
  }

  if (!payload) {
    return (
      <button disabled className="w-full py-3 bg-red-400 text-white font-bold rounded-xl flex justify-center items-center">
        eSewa Unavailable
      </button>
    );
  }

  return (
    <form action="https://rc-epay.esewa.com.np/api/epay/main/v2/form" method="POST">
      <input type="hidden" id="amount" name="amount" value={payload.amount} required />
      <input type="hidden" id="tax_amount" name="tax_amount" value={payload.tax_amount} required />
      <input type="hidden" id="total_amount" name="total_amount" value={payload.total_amount} required />
      <input type="hidden" id="transaction_uuid" name="transaction_uuid" value={payload.transaction_uuid} required />
      <input type="hidden" id="product_code" name="product_code" value={payload.product_code} required />
      <input type="hidden" id="product_service_charge" name="product_service_charge" value={payload.product_service_charge} required />
      <input type="hidden" id="product_delivery_charge" name="product_delivery_charge" value={payload.product_delivery_charge} required />
      <input type="hidden" id="success_url" name="success_url" value={payload.success_url} required />
      <input type="hidden" id="failure_url" name="failure_url" value={payload.failure_url} required />
      <input type="hidden" id="signed_field_names" name="signed_field_names" value={payload.signed_field_names} required />
      <input type="hidden" id="signature" name="signature" value={payload.signature} required />
      
      <button 
        type="submit" 
        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors flex justify-center items-center shadow-lg"
      >
        <img src="https://esewa.com.np/common/images/esewa_logo.png" alt="eSewa" className="h-6 mr-2" />
        Pay with eSewa
      </button>
    </form>
  );
}

export default EsewaPaymentButton;
