
const connectDB = require("../../db");
const User = require("../user-registration/user-registration-model");
const crypto = require("crypto");
const bcrypt =require("bcrypt");

console.log("I am connect by the update password Module")


connectDB();


const get_user_security_questions = async (req, res) =>{
  try {
    const { email } = req.params; // Assuming email is passed as a URL parameter
    
    // Find the user by email
    const user = await User.findOne({ email }, 'securityQuestions.questions');
    
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ securityQuestions: user.securityQuestions.questions });
} catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
}


}




    const verify_user_security_answers = async (req, res) => {
      try {
        const { email } = req.body;
        const { answers } = req.body; // Answers from user input (plain text)

        // Find the user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare entered security answers with stored hashed answers
        const isMatch = await user.compareSecurityAnswers(answers);

        if (!isMatch) {
            return res.status(400).json({ message: 'Security answers do not match' });
        }

        res.status(200).json({ message: 'Security answers verified successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
  };

  const users_old_password_vaerification = async (req, res) => {
    const { email, oldPassword } = req.body;  

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



        
        const update_user_security_questions = async (req, res) => {
          const { email, securityQuestions } = req.body;
        
          try {
            // Step 1: Find the user by email
            const user = await User.findOne({ email });
        
            if (!user) {
              return res.status(404).json({ success: false, message: "User not found." });
            }
        
            // Step 2: Validate that exactly **two** questions are provided
            if (!securityQuestions || securityQuestions.length !== 2) {
              return res.status(400).json({
                success: false,
                message: "You must provide exactly two security questions.",
              });
            }
        
            // Step 3: Validate that both questions are **unique**
            const [firstQuestion, secondQuestion] = securityQuestions;
            if (firstQuestion.question === secondQuestion.question) {
              return res.status(400).json({
                success: false,
                message: "Security questions must be different.",
              });
            }
        
            // Step 4: Validate that both answers are **not empty**
            if (!firstQuestion.answer || !secondQuestion.answer) {
              return res.status(400).json({
                success: false,
                message: "Answers must not be empty.",
              });
            }
        
            // ✅ Step 5: Assign the new security questions (WITHOUT hashing manually)
            user.securityQuestions = {
              questions: [firstQuestion.question, secondQuestion.question],
              answers: [firstQuestion.answer, secondQuestion.answer], // Hashing will happen automatically in the model
            };
        
            // ✅ Step 6: Save user (this triggers the pre-save hashing)
            await user.save();
        
            return res.status(200).json({
              success: true,
              message: "Security questions updated successfully.",
            });
        
          } catch (error) {
            console.error(error);
            return res.status(500).json({
              success: false,
              message: "Internal server error.",
            });
          }
        };
        
       
        



        
      
      





    




    module.exports = { get_user_security_questions, verify_user_security_answers,users_old_password_vaerification, update_user_password, update_user_security_questions }