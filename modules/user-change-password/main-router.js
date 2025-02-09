const express = require('express');
const router = express.Router();
const authMiddleware = require("../middlewares/auth-middleware")

const {get_user_security_questions, verify_user_security_answers,users_old_password_vaerification, update_user_password, update_user_security_questions } = require("./router");




router.get("/security-questions/:email", authMiddleware, get_user_security_questions );



router.post("/verify-security-answers", authMiddleware, verify_user_security_answers );

router.post("/verify-old-password", authMiddleware, users_old_password_vaerification );

router.post("/update-user-answers", authMiddleware, update_user_security_questions );

router.post("/update-password", authMiddleware, update_user_password );



module.exports = router;