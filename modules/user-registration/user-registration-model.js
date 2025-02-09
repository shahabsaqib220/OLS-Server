const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileImageUrl: { type: String, default: null },
  securityQuestions: {
    questions: [{ type: String, required: true }], // Array of questions
    answers: [{ type: String, required: true }],   // Array of hashed answers
  },
  ads: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ad' }],
});

// Pre-save hook to hash the password and security answers
userSchema.pre('save', async function (next) {
  try {
    // Hash the password if it is modified
    if (this.isModified('password')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }

    // Hash the security answers if they are modified
    if (this.isModified('securityQuestions.answers')) {
      const hashedAnswers = [];
      for (let i = 0; i < this.securityQuestions.answers.length; i++) {
        const salt = await bcrypt.genSalt(10);
        const hashedAnswer = await bcrypt.hash(this.securityQuestions.answers[i], salt);
        hashedAnswers.push(hashedAnswer);
      }
      this.securityQuestions.answers = hashedAnswers; // Update with hashed answers
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare entered password with the stored hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to compare entered security answers with the stored hashed answers
userSchema.methods.compareSecurityAnswers = async function (answers) {
  try {
    // Ensure the lengths match before comparing answers
    if (answers.length !== this.securityQuestions.answers.length) return false;

    // Compare each answer with the corresponding hashed answer
    for (let i = 0; i < answers.length; i++) {
      const isMatch = await bcrypt.compare(answers[i], this.securityQuestions.answers[i]);
      if (!isMatch) return false; // If any answer doesn't match, return false
    }

    return true; // All answers matched
  } catch (error) {
    console.error("Error comparing security answers:", error);
    throw new Error("Error comparing security answers");
  }
};

// Method to generate a JWT token
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { userId: this._id, email: this.email },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

const User = mongoose.model('User', userSchema);
module.exports = User;