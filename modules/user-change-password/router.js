
const connectDB = require("../../db");
const User = require("../user-registration/user-registration-model");
const crypto = require("crypto");
const bcrypt =require("bcrypt");

console.log("I am connect by the update password Module")


connectDB();


const get_user_security_questions = async (req, res) =>{

    try {
        const user = await User.findById(req.userId);
        if (!user || !user.securityQuestions) {
          return res.status(404).json({ message: 'No security questions found for this user' });
        }
    
        // Only send the question text, not the hashed answers
        const questions = user.securityQuestions.map(q => ({ _id: q._id, question: q.question }));
        res.json({ questions });
      } catch (err) {
        res.status(500).json({ error: 'Server error' });
      }
    };

    const verify_user_security_answers = async (req, res) => {
      const { answers } = req.body;
  
      try {
          if (!answers || typeof answers !== 'object') {
              return res.status(400).json({ message: 'Answers are missing or invalid in the request body' });
          }
  
          const user = await User.findById(req.userId);
  
          if (!user) {
              return res.status(404).json({ message: 'User not found' });
          }
  
          if (!user.securityQuestions || user.securityQuestions.length === 0) {
              return res.status(400).json({ message: 'No security questions found for the user' });
          }
  
          // Check each answer against the hashed answer in the database
          for (const question of user.securityQuestions) {
              if (!answers[question._id]) {
                  return res.status(400).json({ 
                      message: `Answer for question ID ${question._id} is missing` 
                  });
              }
  
              const answerMatch = await bcrypt.compare(answers[question._id], question.answer);
              if (!answerMatch) {
                  return res.status(400).json({ 
                      message: `Incorrect answer to question ID: ${question._id}` 
                  });
              }
          }
  
          res.json({ success: true });
      } catch (err) {
          console.error('Error verifying security answers:', err.message); // Log error for debugging
          return res.status(500).json({ 
              error: 'An unexpected error occurred', 
              details: err.message 
          });
      }
  };

  const users_old_password_vaerification = async (req, res) => {
    const { email, oldPassword } = req.body;  // Changed 'password' to 'oldPassword'

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      const isMatch = await bcrypt.compare(oldPassword, user.password);  // Compare with 'oldPassword'
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Incorrect password' });
      }
  
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Server error', error });
    }
  };



  
  
  


      const update_user_password = async (req, res) => {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and new password are required' });
          }
        
          try {
            const user = await User.findOne({ email });
            if (!user) {
              return res.status(404).json({ message: 'User not found' });
            }
        
            // Update and hash the new password
            user.password = password;
            await user.save(); // Ensure this triggers the pre('save') hook to hash the password
        
            res.status(200).json({ message: 'Password updated successfully' });
          } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error while updating password' });
          }
        };
      
      





    




    module.exports = { get_user_security_questions, verify_user_security_answers,users_old_password_vaerification, update_user_password }