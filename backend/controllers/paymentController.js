const axios = require('axios');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const crypto = require('crypto');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Admission = require('../models/Admission');
const Course = require('../models/Course');
const { sendPaymentReceipt } = require('../services/emailService');
const { generateInvoice } = require('../utils/invoice');

/**
 * Helper to enroll user in course + auto-approve admission on payment
 */
const enrollUser = async (userId, courseId, admissionId, paymentData) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      console.error("Enrollment helper error: User not found");
      return false;
    }

    const alreadyEnrolled = user.enrolledCourses.find(c => c.course && c.course.toString() === courseId.toString());

    if (!alreadyEnrolled) {
      user.enrolledCourses.push({ course: courseId, progress: 0, status: 'active' });
      await user.save();

      // Fetch dynamic course title for receipt
      const course = await Course.findById(courseId);
      const courseTitle = course ? course.title : 'Your Enrolled Course';

      // Send receipt email
      sendPaymentReceipt(user.email, {
        courseTitle,
        amount: paymentData.amount,
        transactionId: paymentData.transactionId,
        method: paymentData.method
      }).catch(err => console.error("Email fail:", err));
    }

    // Auto-approve admission when payment is successful
    if (admissionId) {
      await Admission.findByIdAndUpdate(admissionId, {
        status: 'approved',
        paymentStatus: 'paid',
        paymentTransactionId: paymentData.transactionId || null,
        paidAt: new Date()
      });
    }
    return true;
  } catch (err) {
    console.error("Enrollment helper error:", err);
    return false;
  }
};

/**
 * Helper to mark admission as failed when payment fails
 */
const markAdmissionFailed = async (admissionId) => {
  try {
    if (admissionId) {
      await Admission.findByIdAndUpdate(admissionId, {
        paymentStatus: 'failed',
        status: 'pending' // keep pending so admin can review
      });
    }
  } catch (err) {
    console.error("Mark admission failed error:", err);
  }
};

// Record generic payment (Used by Khalti client-side or manual entries)
exports.recordPayment = async (req, res) => {
  try {
    const { user, course, amount, method, status, transactionId, admissionId } = req.body;

    if (!user || user === 'me') {
      return res.status(400).json({ message: "User ID is required" });
    }

    const payment = new Payment({ user, course, amount, method, status, transactionId });
    await payment.save();

    let invoiceData = null;
    if (status === 'completed') {
      await enrollUser(user, course, admissionId, { amount, transactionId, method });
      try {
        invoiceData = await generateInvoice(payment);
      } catch (invoiceError) {
        console.error('Invoice generation failed:', invoiceError);
      }
    } else if (status === 'failed') {
      await markAdmissionFailed(admissionId);
    }

    res.status(201).json({
      message: 'Payment recorded and enrollment updated',
      payment,
      invoice: invoiceData,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// eSewa Integration V2
exports.initiateEsewaPayment = async (req, res) => {
  try {
    const { amount, productId, successUrl, failureUrl } = req.body;
    const transaction_uuid = `${productId}-${Date.now()}`;
    const secretKey = process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q';
    const productCode = process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST';

    const message = `total_amount=${amount},transaction_uuid=${transaction_uuid},product_code=${productCode}`;
    const signature = crypto.createHmac('sha256', secretKey).update(message).digest('base64');

    const payload = {
      amount: amount,
      tax_amount: 0,
      total_amount: amount,
      transaction_uuid: transaction_uuid,
      product_code: productCode,
      product_service_charge: 0,
      product_delivery_charge: 0,
      success_url: successUrl,
      failure_url: failureUrl,
      signed_field_names: 'total_amount,transaction_uuid,product_code',
      signature: signature
    };

    res.json({ gateway: 'esewa', payload });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.verifyEsewaPayment = async (req, res) => {
  const { data } = req.body;
  if (!data) return res.status(400).json({ success: false, message: 'No data provided' });

  try {
    const decodedStr = Buffer.from(data, 'base64').toString('utf-8');
    const decodedData = JSON.parse(decodedStr);

    if (decodedData.status === 'COMPLETE') {
      res.json({
        success: true,
        transactionId: decodedData.transaction_code,
        amount: decodedData.total_amount,
        transaction_uuid: decodedData.transaction_uuid
      });
    } else {
      res.status(400).json({ success: false, message: 'Payment not completed' });
    }
  } catch (err) {
    res.status(500).json({ message: 'eSewa verification error', error: err.message });
  }
};

// Khalti Integration (V2)
exports.initiateKhaltiPayment = async (req, res) => {
  try {
    const { amount, productId, productName, successUrl } = req.body;

    const response = await axios.post(
      "https://a.khalti.com/api/v2/epayment/initiate/",
      {
        return_url: successUrl,
        website_url: process.env.FRONTEND_URL || "http://localhost:5173",
        amount: amount * 100, // paisa
        purchase_order_id: productId,
        purchase_order_name: productName || "Course Enrollment",
      },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ message: "Khalti initiation failed", error: err.response?.data || err.message });
  }
};

exports.verifyKhaltiPayment = async (req, res) => {
  const { pidx } = req.body;
  try {
    const response = await axios.post(
      "https://a.khalti.com/api/v2/epayment/lookup/",
      { pidx },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
        },
      }
    );

    if (response.data.status === 'Completed') {
      res.json({ success: true, data: response.data });
    } else {
      res.status(400).json({ success: false, message: "Payment not completed", details: response.data });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.response?.data || error.message,
    });
  }
};

// Stripe Integration
exports.initiateStripePayment = async (req, res) => {
  const { amount, productId, successUrl, failureUrl } = req.body;
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: productId || 'Course Enrollment' },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl + '&session_id={CHECKOUT_SESSION_ID}',
      cancel_url: failureUrl,
    });
    res.json({ id: session.id });
  } catch (err) {
    res.status(400).json({ message: 'Stripe payment failed', error: err.message });
  }
};

exports.verifyStripePayment = async (req, res) => {
  const { session_id } = req.body;
  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status === 'paid') {
      res.json({ success: true, transactionId: session.payment_intent });
    } else {
      res.status(400).json({ success: false, message: 'Payment not paid' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Stripe verification error', error: err.message });
  }
};
