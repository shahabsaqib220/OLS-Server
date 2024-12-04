const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileImageUrl: { type: String, default: null },
  securityQuestions: [
    {
      question: { type: String, required: true },
      answer: { type: String, required: true }, 
    },
  ],
  ads: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ad' }],
});

userSchema.pre('save', async function (next) {
  try {
    if (this.isModified('password')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }

    if (this.isModified('securityQuestions')) {
      for (let i = 0; i < this.securityQuestions.length; i++) {
        const salt = await bcrypt.genSalt(10);
        this.securityQuestions[i].answer = await bcrypt.hash(
          this.securityQuestions[i].answer,
          salt
        );
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.compareSecurityAnswers = async function (answers) {
  try {
    // Ensure the lengths match before comparing answers
    if (answers.length !== this.securityQuestions.length) return false;

    // Compare each answer with the hashed answer stored in `securityQuestions`
    for (let i = 0; i < answers.length; i++) {
      const isMatch = await bcrypt.compare(answers[i], this.securityQuestions[i].answer);
      if (!isMatch) return false; // If any answer doesn't match, return false
    }

    return true; // All answers matched
  } catch (error) {
    console.error("Error comparing security answers:", error);
    throw new Error("Error comparing security answers");
  }
};

userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { userId: this._id, email: this.email },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

const User = mongoose.model('User', userSchema);
module.exports = User;
