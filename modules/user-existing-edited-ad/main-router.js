const express = require('express');
const router = express.Router();
const authMiddleware = require("../middlewares/auth-middleware")

const {update_user_edited_ad, upload, delete_user_ad} = require("./router");



router.put("/ad/:id",authMiddleware, upload.array('images', 5),update_user_edited_ad );
router.delete("/delete/user/ad/:id",authMiddleware, delete_user_ad);



module.exports = router;

