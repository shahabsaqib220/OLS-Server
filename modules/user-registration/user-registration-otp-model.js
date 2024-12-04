const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true,
    unique: true, // Ensure one OTP per email
  },
  otp: { 
    type: String, 
    required: true 
  },
  expiresIn: { 
    type: Date, 
    required: true 
  },
});

module.exports = mongoose.model('Otp', otpSchema);
