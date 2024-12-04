



const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth-middleware');
const { useruserlogin} = require("./user-login-main")
const {profilephoto, upload, userprofileimage, updateusername } = require("./user-login-profile")




router.post('/login', useruserlogin )
router.post('/profile-photo', authMiddleware, upload.single('profileImage'), profilephoto);
router.get('/profile-image', authMiddleware,userprofileimage );
router.put('/update-username',authMiddleware, updateusername);



module.exports = router;