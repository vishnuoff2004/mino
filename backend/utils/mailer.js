const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendVerificationCode = async (email, code) => {
  const mailOptions = {
    from: `"BookEase" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Your BookEase Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #f97316;">BookEase</h2>
        <p>Your verification code is:</p>
        <h1 style="color: #1a1a2e; font-size: 32px; letter-spacing: 8px; text-align: center;">${code}</h1>
        <p>This code expires in 10 minutes.</p>
        <hr style="border: none; border-top: 1px solid #eee;" />
        <p style="color: #888; font-size: 12px;">If you did not request this, please ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendVerificationCode };
