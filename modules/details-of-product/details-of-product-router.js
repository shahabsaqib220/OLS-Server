const mongoose = require('mongoose'); // Needed to check if ID is a valid ObjectId
const Ad = require('../user-ads/users-ads-model');
const connectDB = require('../../db');

connectDB();


const adsdetails = async (req, res) => {
    const { id } = req.params;
    
    try {
  
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        console.log("Invalid ID format");
        return res.status(400).json({ message: "Invalid ad ID" });
      }
  
      const ad = await Ad.findById(id).populate('userId');
      console.log("Fetched Ad:", ad);
  
      if (!ad) {
        return res.status(404).json({ message: "Ad not found" });
      }
  
      res.json(ad);
    } catch (error) {
      console.error("Error fetching ad details:", error);
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  };


  const other_related_product = async (req, res) => {
    try {
      // Fetch products by category and ensure adStatus is "available"
      const products = await Ad.find({ 
        category: req.params.category,
        adStatus: "available"  // Only fetch products with status "available"
      }); // Fetch all matching products without any limit
  
      res.json(products); // Return all fetched products as JSON
    } catch (error) {
      console.error("Error fetching available products:", error); // Log the error for debugging
      res.status(500).json({ message: 'Error fetching available products' }); // Send error response
    }
  };
  

const posted_by_user_profile = async (req,res) =>{
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      res.status(200).json({ imageUrl: user.profileImageUrl });
    } else {
      res.status(404).json({ message: 'User not found wow by wow' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}


  


  module.exports = { adsdetails, other_related_product, posted_by_user_profile }


