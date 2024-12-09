const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth-middleware');

const { user_filtered_ads } = require("./router");


router.get('/filtered-ads', user_filtered_ads);



module.exports = router;