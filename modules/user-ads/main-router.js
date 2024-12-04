const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const admin = require('firebase-admin');
const storage = multer.memoryStorage(); // Store files in memory temporarily
const upload = multer({ storage });
const authMiddleware = require('../middlewares/auth-middleware');
const {allads,userpostads} = require("./users-ads-router")

router.get('/ads', allads )
router.post('/postads',authMiddleware, upload.array('images', 5), userpostads);




module.exports = router;