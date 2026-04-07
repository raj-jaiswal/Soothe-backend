const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false, // true only for port 465
  auth: {
    user: process.env.BREVO_SMTP_USER, // your Brevo SMTP login
    pass: process.env.BREVO_SMTP_KEY,   // your Brevo SMTP key
  },
});

const sendOTP = async (toEmail, otp) => {
  const mailOptions = {
    from: process.env.BREVO_FROM_EMAIL,
    to: toEmail,
    subject: 'Your App Verification Code',
    text: `Your verification code is: ${otp}. It expires in 5 minutes.`,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendOTP };