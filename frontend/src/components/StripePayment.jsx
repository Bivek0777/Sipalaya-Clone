import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_your_key");

export default function StripePayment({ amount, productId, admissionId }) {
  const handlePay = async () => {
    try {
      const stripe = await stripePromise;

      const res = await fetch("/api/payments/stripe/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount, 
          productId,
          successUrl: `${window.location.origin}/payment-success?courseId=${productId}&amount=${amount}&admissionId=${admissionId || ''}`,
          failureUrl: `${window.location.origin}/payment-fail`
        }),
      });
      const session = await res.json();
      
      if (session.id) {
        const { error } = await stripe.redirectToCheckout({
          sessionId: session.id,
        });
        if (error) console.error(error);
      } else {
        alert("Stripe session creation failed!");
      }
    } catch (err) {
      console.error(err);
      alert("Error initiating Stripe payment");
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <button 
        onClick={handlePay}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors flex justify-center items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
        Pay with Card
      </button>
    </div>
  );
}
