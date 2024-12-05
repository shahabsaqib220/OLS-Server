const express = require('express');
const router = express.Router();
const {adsdetails, other_related_product, posted_by_user_profile} = require('./details-of-product-router')

router.get("/ad/:id", adsdetails );
router.get("/:category", other_related_product );
router.get("/user-profile", posted_by_user_profile );





module.exports = router;