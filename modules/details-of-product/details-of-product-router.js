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


  module.exports = { adsdetails }


