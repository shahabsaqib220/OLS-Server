const express = require("express");
const router = express.Router();
const { forget_user_password, get_user_security_questions, verify_user_security_answers, update_user_password } = require("./controllers");
const { validateEmail }= require("../user-registration/emailMiddlware");
const  validatePassword  = require("../controllers/reset-user-password/validatePasswordMiddleware");


router.post("/forget-password", validateEmail, forget_user_password);

router.get("/get-questions/:email", get_user_security_questions)

router.post("/verify/answers", verify_user_security_answers)

router.put ("/update-password",validatePassword, update_user_password)

module.exports = router;
