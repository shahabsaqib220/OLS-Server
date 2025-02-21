const validatePasswordMiddleware = (req,res,next) =>{
    // Getting the password from the client side
    const {newPassword} = req.body;
    // Checking the password is emoty or not
    if(!newPassword){
        return res.status(400).json({message:"Password is required"});

    }
    // Cheking tha password length the password should have atleadt 8 characters long including the upper case, lower case, special character and the 
    // Number
    if(newPassword.length < 8){
        return res.status(400).json({message:"Password should be at least 8 characters long"});
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    // Chehing thr password is valid or not
    if(!passwordRegex.test(newPassword)){
        return res.status(400).json({message:"Password should contain at least one uppercase letter, one lowercase letter, one number, and one special character."});
    }

    // Sending control to the next middleware or the controller

    next();



}

module.exports = validatePasswordMiddleware;