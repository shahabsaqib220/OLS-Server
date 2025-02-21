const connectDB = require("../../db");
const User = require("../user-registration/user-registration-model");

// Connecting to the database
connectDB();

const forget_user_password = async (req, res) => {
  const { email } = req.body;

  try {
    // Finding the user by email
    const user = await User.findOne({ email }).select('-password -securityQuestions.answers');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error finding the user:", error);
    return res.status(500).json({ message: "Something went wrong! Please try again later" });
  }
};


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
      console.log("Email", email);
      console.log("Answers", answers);

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

// Controller function for updateing the password
const update_user_password = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the password
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
}
catch (error) {
  console.error(error);
  res.status(500).json({ message: "Internal server error" });
}

}




// ✅ Export as an object
module.exports = {
  forget_user_password,
  get_user_security_questions,
  verify_user_security_answers,
  update_user_password
};
