

const express = require('express');
const router = express.Router();
const { checkEmailExists, verifyRegistrationOtp, userRegistration } = require("./user-registration-main")
const {validateEmail} = require("./emailMiddlware")


router.post('/check-email',validateEmail,checkEmailExists )
router.post('/verify-otp',verifyRegistrationOtp )
router.post('/register',userRegistration )


module.exports = router;