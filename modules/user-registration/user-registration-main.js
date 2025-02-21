const nodemailer = require('nodemailer');
const Otp = require('./user-registration-otp-model'); // OTP Model
const User = require('./user-registration-model'); // User Model
const connectDB = require('../../db');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE, // e.g., Gmail
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASSWORD, // App-specific password
  },
});

connectDB();


// We can get the email from client side, and make the query for the searching the email in the database, so if the email is exited in the database
// Then we need to send the message to the client side that is email already exists
const checkEmailExists = async (req,res) =>{
  // Getting the email from the middleware
  const {email} = req.body;

  try {
      // Searching the email into database;
  const user = await User.findOne({email});
  //  If the user has been already found into a database then we need to return the message into a database 
  // that the user has been already exists with the provided email

  if (user){
    return res.status(200).json({exists: true,message:"Email already exists"})
  }
  // If there is no emial regustered

  else {
    return res.status(200).json({exists: false,message:"Email is Avalible"})
  }
    
  } catch (error) {
    console.error("Error CHecking Email", error);
    return res.status(500).json({message:"Internal Server Error"})
    
  }



}

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
    // Create a new user instance (this will trigger the pre('save') hook)
    const newUser = new User({
      name,
      email,
      password, // Password hashing will be handled in the model's pre-save hook
      securityQuestions: {
        questions: securityQuestions.map(q => q.question),
        answers: securityQuestions.map(q => q.answer), // Hashing happens in pre-save hook
      },
    });

    // Save the user (triggers pre-save middleware)
    await newUser.save();

    // Delete OTP related to the email (if applicable)
    await Otp.findOneAndDelete({ email });

    return res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error('Error during registration:', error);
    return res.status(500).json({ message: 'Registration failed. Please try again.', error: error.message });
  }
};

module.exports = { checkEmailExists, verifyRegistrationOtp, userRegistration };
