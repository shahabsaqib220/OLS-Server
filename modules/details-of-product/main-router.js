const express = require('express');
const router = express.Router();
const {adsdetails} = require('./details-of-product-router')

router.get("/ad/:id", adsdetails );




module.exports = router;