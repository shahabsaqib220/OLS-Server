const nodemailer = require('nodemailer');
const Otp = require('./user-registration-otp-model'); // OTP Model
const User = require('./user-registration-model'); // Assuming you have a User model for checking email existence
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
    // Check if the email exists in the User collection
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Email already exists!' });
    }

    // Generate OTP and expiration time
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresIn = new Date(Date.now() + 5 * 60 * 1000);

    // Remove any previous OTP for the same email
    await Otp.findOneAndDelete({ email });

    // Save the new OTP
    const newOtp = new Otp({
      email,
      otp,
      expiresIn,
    });

    await newOtp.save();

    // Prepare email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP for Registration',
      text: `Your OTP for registration is ${otp}. It will expire in 5 minutes.`,
    };

    // Send the OTP via email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error); // Log the error for debugging
        return res.status(500).json({ message: 'Failed to send OTP. Please try again.', error });
      }
      return res.json({ message: 'OTP sent successfully!', info });
    });

  } catch (error) {
    console.error('Error occurred:', error); // Log the error for debugging
    return res.status(500).json({ message: 'Something went wrong. Please try again later.', error: error.message });
  }
};


const verifyRegistrationOtp = async (req,res)=>{
    const { otp, email } = req.body;
  
    try {
      // Retrieve OTP from the database
      const otpRecord = await Otp.findOne({ email });
  
      if (!otpRecord) {
        return res.status(400).json({ code: 'OTP_NOT_FOUND', message: 'OTP not found or expired' });
      }
  
      // Check if the OTP has expired
      if (Date.now() > otpRecord.expiresIn) {
        await Otp.findOneAndDelete({ email }); // Delete expired OTP
        return res.status(400).json({ code: 'OTP_EXPIRED', message: 'OTP has expired' });
      }
  
      // Verify the OTP
      if (otp !== otpRecord.otp) {
        return res.status(400).json({ code: 'INVALID_OTP', message: 'Invalid OTP' });
      }
  
      // OTP is valid, proceed to the next step (e.g., account creation)
      await Otp.findOneAndDelete({ email });
  
      return res.json({ message: 'OTP verified successfully!' });
    } catch (error) {
      console.error('Error in verify-otp:', error);
      return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
    }
}


const userRegistration = async (req,res) =>{

  const { name, email, password, securityQuestions } = req.body;

  try {
    // Create a new user instance
    const newUser = new User({
      name,
      email,
      password, // Password will be hashed automatically
      securityQuestions, // Answers will be hashed in the pre-save hook
    });

    // Save the user to the database
    await newUser.save();

    // Optional: Clear OTP after successful registration
    await Otp.findOneAndDelete({ email });

    return res.json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error('Error during registration:', error);
    return res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
};












module.exports = { sendOtp, verifyRegistrationOtp, userRegistration };
