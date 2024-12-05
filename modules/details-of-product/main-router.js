const express = require('express');
const router = express.Router();
const {adsdetails, other_related_product} = require('./details-of-product-router')

router.get("/ad/:id", adsdetails );
router.get("/:category", other_related_product );




module.exports = router;