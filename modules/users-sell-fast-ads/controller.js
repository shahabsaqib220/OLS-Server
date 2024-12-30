// controllers/adController.js
const Ad = require('../user-ads/users-ads-model'); // Assuming the Ad schema is in models/adModel.js

const getAdDetails = async (req, res) => {
  try {
    const { adId } = req.params;

    // Fetch ad details using the adId
    const ad = await Ad.findById(adId).select(
      '_id userId category brand model price description MobilePhone condition location images'
    );

    if (!ad) {
      return res.status(404).json({ message: 'Ad not found' });
    }

    res.status(200).json(ad);
  } catch (error) {
    console.error('Error fetching ad details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


const updateAdPlan = async (req, res) => {
  const { adId } = req.params;
  const { plan } = req.body;

  if (!["Basic", "Standard", "Premium"].includes(plan)) {
    return res.status(400).json({ message: "Invalid plan selected." });
  }

  try {
    const updatedAd = await Ad.findByIdAndUpdate(
      adId,
      {
        basic: plan === "Basic",
        standard: plan === "Standard",
        premium: plan === "Premium",
      },
      { new: true }
    );

    if (!updatedAd) {
      return res.status(404).json({ message: "Ad not found." });
    }

    res.status(200).json(updatedAd);
  } catch (error) {
    console.error("Error updating ad plan:", error);
    res.status(500).json({ message: "Failed to update ad plan." });
  }
};






module.exports = { getAdDetails, updateAdPlan };
