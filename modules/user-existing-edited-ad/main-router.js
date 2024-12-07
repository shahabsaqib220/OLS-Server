const express = require('express');
const router = express.Router();
const authMiddleware = require("../middlewares/auth-middleware")

const {update_user_edited_ad, upload, delete_user_ad, user_sold_out_product} = require("./router");



router.put("/ad/:id",authMiddleware, upload.array('images', 5),update_user_edited_ad );
router.delete("/delete/user/ad/:id",authMiddleware, delete_user_ad);
router.get("/solded/items", authMiddleware, user_sold_out_product)




module.exports = router;

