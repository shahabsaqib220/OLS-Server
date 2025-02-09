
const Ad = require('../user-ads/users-ads-model'); 

const getAdDetails = async (req, res) => {
  try {
    const { adId } = req.params;

  
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
  const { days } = req.body; // Expecting 'days' from the request body

  // Validate allowed premium durations (7, 15, 30 days)
  if (![7, 15, 30].includes(days)) {
    return res.status(400).json({ message: "Invalid premium duration. Only 7, 15, or 30 days allowed." });
  }

  try {
    const ad = await Ad.findById(adId);
    if (!ad) {
      return res.status(404).json({ message: "Ad not found." });
    }

    const now = new Date();
    const expiresAt = new Date(ad.expiresAt);

    // Calculate remaining unpaid days (if the ad is still in unpaid period)
    let remainingUnpaidDays = Math.max(0, (expiresAt - now) / (1000 * 60 * 60 * 24));

    // Ensure the premium duration does not stack with unpaid days
    let premiumEnd = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    // Update ad with new premium details
    const updatedAd = await Ad.findByIdAndUpdate(
      adId,
      {
        premium: true, // Mark ad as premium
        premiumUntil: premiumEnd, // Set new premium expiry date
        expiresAt: premiumEnd, // Extend overall expiry date
      },
      { new: true }
    );

    return res.status(200).json({
      message: `Ad upgraded to premium for ${days} days.`,
      updatedAd
    });
  } catch (error) {
    console.error("Error updating ad plan:", error);
    return res.status(500).json({ message: "Failed to update ad plan." });
  }
};












module.exports = { getAdDetails, updateAdPlan };
