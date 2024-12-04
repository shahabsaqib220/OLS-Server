const nodemailer = require('nodemailer');
const Otp = require('./user-registration-otp-model'); // OTP Model
const User = require('./user-registration-model'); // User Model
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE, // e.g., Gmail
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASSWORD, // App-specific password
  },
});

const sendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Email already exists!' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresIn = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

    await Otp.findOneAndDelete({ email });

    const newOtp = new Otp({
      email,
      otp,
      expiresIn,
    });

    await newOtp.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP for Registration',
      text: `Your OTP for registration is ${otp}. It will expire in 5 minutes.`,
    };

    // Await sendMail to ensure it completes before proceeding
    const info = await transporter.sendMail(mailOptions);
    return res.json({ message: 'OTP sent successfully!', info });
  } catch (error) {
    console.error('Error in sendOtp:', error);
    return res.status(500).json({ message: 'Something went wrong. Please try again later.', error: error.message });
  }
};

const verifyRegistrationOtp = async (req, res) => {
  const { otp, email } = req.body;

  try {
    const otpRecord = await Otp.findOne({ email });

    if (!otpRecord) {
      return res.status(400).json({ code: 'OTP_NOT_FOUND', message: 'OTP not found or expired' });
    }

    if (Date.now() > otpRecord.expiresIn) {
      await Otp.findOneAndDelete({ email });
      return res.status(400).json({ code: 'OTP_EXPIRED', message: 'OTP has expired' });
    }

    if (otp !== otpRecord.otp) {
      return res.status(400).json({ code: 'INVALID_OTP', message: 'Invalid OTP' });
    }

    await Otp.findOneAndDelete({ email });
    return res.json({ message: 'OTP verified successfully!' });
  } catch (error) {
    console.error('Error in verifyRegistrationOtp:', error);
    return res.status(500).json({ message: 'Something went wrong. Please try again later.', error: error.message });
  }
};

const userRegistration = async (req, res) => {
  const { name, email, password, securityQuestions } = req.body;

  try {
    const newUser = new User({
      name,
      email,
      password, // Password will be hashed automatically (assuming pre-save hook)
      securityQuestions, // Assuming answers will be hashed in pre-save hook
    });

    await newUser.save();

    await Otp.findOneAndDelete({ email });

    return res.json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error('Error during registration:', error);
    return res.status(500).json({ message: 'Registration failed. Please try again.', error: error.message });
  }
};

module.exports = { sendOtp, verifyRegistrationOtp, userRegistration };
