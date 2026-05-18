const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // Or your preferred service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendWelcomeEmail = async (userEmail, userName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'Welcome to Sipalaya IT Training!',
    html: `
      <h1>Welcome ${userName}!</h1>
      <p>We are thrilled to have you join our learning community.</p>
      <p>You can now log in to your student portal and start exploring your courses.</p>
      <p>Best regards,<br/>The Sipalaya Team</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent to:', userEmail);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

exports.sendPaymentReceipt = async (userEmail, paymentData) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'Payment Receipt - Sipalaya IT Training',
    html: `
      <h1>Payment Successful!</h1>
      <p>Thank you for your enrollment.</p>
      <div style="background: #f4f4f4; padding: 20px; border-radius: 10px;">
        <p><strong>Course:</strong> ${paymentData.courseTitle}</p>
        <p><strong>Amount:</strong> Rs. ${paymentData.amount}</p>
        <p><strong>Transaction ID:</strong> ${paymentData.transactionId}</p>
        <p><strong>Method:</strong> ${paymentData.method}</p>
      </div>
      <p>You can now access your course in the student portal.</p>
      <p>Happy learning!<br/>The Sipalaya Team</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Payment receipt sent to:', userEmail);
  } catch (error) {
    console.error('Error sending payment receipt:', error);
  }
};
