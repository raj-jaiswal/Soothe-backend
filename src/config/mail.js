const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendOTP = async (toEmail, otp) => {
  const mailOptions = {
    from: process.env.MAIL_FROM,
    to: toEmail,
    subject: 'Your App Verification Code',
    text: `Your verification code is: ${otp}. It expires in 5 minutes.`,
  };
  return transporter.sendMail(mailOptions);
};

module.exports = { sendOTP };