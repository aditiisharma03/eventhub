require("dotenv").config();  // Load environment variables at the top

const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
  console.log("🔍 Email Debugging:");
  console.log("SMTP_USER:", process.env.SMTP_USER ? "✅ Loaded" : "❌ MISSING!");
  console.log("SMTP_PASS:", process.env.SMTP_PASS ? "✅ Loaded" : "❌ MISSING!");

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_USER,
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully");
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
};

module.exports = sendEmail;
