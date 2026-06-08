const nodemailer = require('nodemailer');

let transporter;
let usingEthereal = false;
let smtpConfigured = false;
let smtpVerified = false;
let fallbackToConsole = false;

const emailStatus = {
  configured: false,
  verified: false,
  usingEthereal: false,
  fallbackToConsole: false,
  transportOptions: null,
};

const buildSmtpOptions = () => {
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = Number(process.env.EMAIL_PORT || 587);
  const secure = process.env.EMAIL_SECURE === 'true';
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  const auth = { user, pass };
  const service = process.env.EMAIL_SERVICE;

  if (service) {
    return {
      service,
      auth,
    };
  }

  return {
    host,
    port,
    secure,
    auth,
    tls: {
      rejectUnauthorized: false,
    },
  };
};

const setupTransporter = async () => {
  const hasSmtpCredentials = Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);

  if (hasSmtpCredentials) {
    smtpConfigured = true;
    emailStatus.configured = true;
    const transportOptions = buildSmtpOptions();
    transporter = nodemailer.createTransport(transportOptions);
    emailStatus.transportOptions = {
      service: transportOptions.service || null,
      host: transportOptions.host || null,
      port: transportOptions.port || null,
      secure: transportOptions.secure || null,
      user: process.env.EMAIL_USER,
    };

    try {
      await transporter.verify();
      smtpVerified = true;
      emailStatus.verified = true;
      console.log('Email transporter verified successfully.');
      return;
    } catch (err) {
      emailStatus.verified = false;
      console.error('Email transporter verification failed:', err.message || err);
      console.error('Transport options:', {
        service: transportOptions.service || null,
        host: transportOptions.host || null,
        port: transportOptions.port || null,
        secure: transportOptions.secure || null,
        user: transportOptions.auth.user,
      });
      console.warn('SMTP is configured but verification failed. The transporter will still be used for sends, but delivery may fail until credentials are corrected.');
    }
  }

  if (!hasSmtpCredentials) {
    // No SMTP credentials found in .env. Using console logger for emails.
    /* 
    // Skipped Ethereal creation to avoid the log message and network delay
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      usingEthereal = true;
      emailStatus.usingEthereal = true;
      // console.log('Ethereal email account created for local testing.');
      return;
    } catch (err) {
      console.warn('No valid email transporter configured and Ethereal creation failed. Falling back to console logger.');
    }
    */
  }

  fallbackToConsole = true;
  emailStatus.fallbackToConsole = true;
  transporter = {
    sendMail: async (options) => {
      console.log('\n--- [MOCK EMAIL SENT] ---');
      console.log('To:', options.to);
      console.log('Subject:', options.subject);
      console.log('Body Length:', options.html?.length || 0);
      console.log('-------------------------\n');
      return { messageId: 'mock-id-' + Date.now() };
    },
  };
};

const transporterReady = setupTransporter();

exports.sendWelcomeEmail = async (userEmail, userName) => {
  await transporterReady;

  const mailOptions = {
    from: process.env.EMAIL_USER || 'no-reply@sipalaya.com',
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

exports.sendPasswordResetEmail = async (userEmail, userName, resetLink) => {
  await transporterReady;

  const mailOptions = {
    from: `"Sipalaya IT Training" <${process.env.EMAIL_USER || 'no-reply@sipalaya.com'}>`,
    to: userEmail,
    subject: 'Reset Your Password – Sipalaya IT Training',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 40px 32px; text-align: center;">
          <div style="width: 56px; height: 56px; background: rgba(255,255,255,0.2); border-radius: 14px; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 800; color: #fff; margin-bottom: 16px;">S</div>
          <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700;">Password Reset Request</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">Sipalaya IT Training</p>
        </div>
        <div style="padding: 40px 32px;">
          <p style="font-size: 16px; color: #334155; margin: 0 0 12px;">Hi <strong>${userName}</strong>,</p>
          <p style="font-size: 14px; color: #64748b; line-height: 1.6; margin: 0 0 28px;">We received a request to reset the password for your account. Click the button below to create a new password. This link is valid for <strong>1 hour</strong>.</p>
          <div style="text-align: center; margin-bottom: 28px;">
            <a href="${resetLink}" style="display: inline-block; padding: 14px 36px; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #ffffff; font-size: 15px; font-weight: 700; border-radius: 10px; text-decoration: none; letter-spacing: 0.3px;">Reset My Password</a>
          </div>
          <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0 0 8px;">Or copy and paste this URL into your browser:</p>
          <p style="font-size: 11px; color: #4f46e5; text-align: center; word-break: break-all; margin: 0 0 28px;">${resetLink}</p>
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px;">
            <p style="font-size: 12px; color: #94a3b8; margin: 0;">If you did not request a password reset, please ignore this email. Your password will remain unchanged.</p>
          </div>
        </div>
        <div style="background: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="font-size: 12px; color: #94a3b8; margin: 0;">© ${new Date().getFullYear()} Sipalaya Info Tech Pvt. Ltd. · Kathmandu, Nepal</p>
        </div>
      </div>
    `
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to:', userEmail);

    const previewUrl = usingEthereal ? nodemailer.getTestMessageUrl(info) : undefined;
    if (previewUrl) {
      console.log('Preview URL:', previewUrl);
    }

    return { previewUrl };
  } catch (error) {
    console.error('Error sending reset email:', error);
    throw error;
  }
};

exports.sendPaymentReceipt = async (userEmail, paymentData) => {
  const mailOptions = {
    from: process.env.EMAIL_USER || 'no-reply@sipalaya.com',
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
    await transporterReady;
    await transporter.sendMail(mailOptions);
    console.log('Payment receipt sent to:', userEmail);
  } catch (error) {
    console.error('Error sending payment receipt:', error);
  }
};

exports.sendTestEmail = async (recipientEmail) => {
  await transporterReady;
  const mailOptions = {
    from: process.env.EMAIL_USER || 'no-reply@sipalaya.com',
    to: recipientEmail,
    subject: 'Sipalaya IT Training Email Delivery Test',
    html: `
      <h1>Email Delivery Test</h1>
      <p>This is a test message to verify your SMTP email configuration.</p>
      <p>If you receive this message, real email delivery is working correctly.</p>
      <p>Best regards,<br/>Sipalaya IT Training</p>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  const previewUrl = usingEthereal ? nodemailer.getTestMessageUrl(info) : undefined;
  return { info, previewUrl };
};

exports.getEmailStatus = () => {
  return {
    configured: emailStatus.configured,
    verified: emailStatus.verified,
    usingEthereal,
    fallbackToConsole,
    transportOptions: emailStatus.transportOptions,
  };
};
