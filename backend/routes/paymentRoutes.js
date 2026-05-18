const express = require('express');
const router = express.Router();

const {
	initiateEsewaPayment,
	verifyEsewaPayment,
	initiateKhaltiPayment,
	verifyKhaltiPayment,
	initiateStripePayment,
	verifyStripePayment,
	recordPayment
} = require('../controllers/paymentController');

// Record generic payment
router.post('/', recordPayment);

// eSewa
router.post('/esewa/initiate', initiateEsewaPayment);
router.post('/esewa/verify', verifyEsewaPayment);

// Khalti
router.post('/khalti/initiate', initiateKhaltiPayment);
router.post('/khalti/verify', verifyKhaltiPayment);

// Stripe
router.post('/stripe/initiate', initiateStripePayment);
router.post('/stripe/verify', verifyStripePayment);

module.exports = router;
