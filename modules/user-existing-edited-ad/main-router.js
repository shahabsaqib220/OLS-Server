const express = require('express');
const router = express.Router();
const authMiddleware = require("../middlewares/auth-middleware")

const {update_user_edited_ad, upload} = require("./router");



router.put("/ad/:id",authMiddleware, upload.array('images', 5),update_user_edited_ad );



module.exports = router;


