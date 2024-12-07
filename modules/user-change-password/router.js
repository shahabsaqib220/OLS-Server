
const User = require("../user-registration/user-registration-model");
const crypto = require("crypto");


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
          const user = await User.findById(req.userId);
          if (!user) return res.status(404).json({ message: 'User not found' });
      
          // Check each answer against the hashed answer in the database
          for (const question of user.securityQuestions) {
            if (!await bcrypt.compare(answers[question._id], question.answer)) {
              return res.status(400).json({ message: 'Incorrect answer to a security question' });
            }
          }
      
          res.json({ success: true });
        } catch (err) {
          res.status(500).json({ error: 'Server error' });
        }
      };


      const update_user_password = async (req, res) => {
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and new password are required' });
          }
        
          try {
            const user = await User.findOne({ email });
            console.log(user);
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
      
      





    




    module.exports = { get_user_security_questions, verify_user_security_answers, update_user_password }