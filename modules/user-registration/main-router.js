

const express = require('express');
const router = express.Router();
const { sendOtp, verifyRegistrationOtp, userRegistration } = require("./user-registration-main")


router.post('/send-otp',sendOtp )
router.post('/verify-otp',verifyRegistrationOtp )
router.post('/register',userRegistration )


module.exports = router;