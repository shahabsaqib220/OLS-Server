//  In this middleware we can check the email has must be proper structure

const validateEmail = async (req,res,next) =>{
    // Getting the email from the front end
    const {email} = req.body;

    //  Getting the email regex pattern:
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Checking the email structure, the email should have the proper structure

    if(!email){
        // If there is no email provided sending the message to the client side
        return res.status(400).json({message:"Email is required"});
    }

    // Checking the email structure 
    if (!emailRegex.test(email)){
        // If the email has no proper structure then sending the message to the client side
        return res.status(400).json({message:"Invalid Email"})
    }

    // IF the email has the proper structure then we need to pass the control to the next middleware
    // As we dont have the next middleware so the control can pass to the controllerfunctio
    next();

}

module.exports = {validateEmail}