// routes/adRoutes.js
const express = require('express');
const { getAdDetails, updateAdPlan } = require('../users-sell-fast-ads/controller');
const authMiddleware = require("../middlewares/auth-middleware")


const router = express.Router();

// GET /api/ads/:adId
router.get('/user-sell-fast/:adId', authMiddleware, getAdDetails);
router.put("/update-plan/:adId",authMiddleware, updateAdPlan);



module.exports = router;
