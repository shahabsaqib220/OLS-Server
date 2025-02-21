const multer = require('multer');
const path = require('path');
const admin = require('firebase-admin');
const Ad = require('../user-ads/users-ads-model');
const connectDB = require('../../db');

// Initialize Firebase storage bucket
const bucket = admin.storage().bucket();
connectDB();

// Configure Multer to store files in memory temporarily
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB file size limit
});


const userpostads = async (req, res) => {
  try {
    const { category, brand, model, price, description, condition, mobilePhone, location } = req.body;
    console.log(req.body);
    console.log("I am the lcoation", location);

    // Validate required fields
    if (!category || !brand || !price || !description || !condition || !mobilePhone || !location) {
      return res.status(400).json({ message: "All fields are required except model" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "At least one image is required" });
    }

  

    const imageUrls = [];

    // Upload images to Firebase Storage
    for (const file of req.files) {
      const firebaseFileName = `${Date.now()}_${file.originalname}`;
      const fileUpload = bucket.file(firebaseFileName);

      await new Promise((resolve, reject) => {
        const blobStream = fileUpload.createWriteStream({
          metadata: {
            contentType: file.mimetype,
          },
        });

        blobStream.on("error", (error) => {
          console.error("Error uploading file to Firebase:", error);
          reject(new Error("Error uploading image"));
        });

        blobStream.on("finish", async () => {
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${firebaseFileName}`;
          imageUrls.push(publicUrl);
          resolve();
        });

        blobStream.end(file.buffer);
      });
    }

    // If model is not provided, set it to an empty string
    const adModel = model || "";

    // Create the new Ad document
    const newAd = new Ad({
      userId: req.userId,
      category,
      brand,
      model: adModel,
      price,
      description,
      mobilePhone,
      location,
    
     // Storing location as a string
      condition,
      images: imageUrls,
      adStatus: "available",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days expiry
      premium: false, // Default value
      premiumUntil: null // Default value
    });

    const savedAd = await newAd.save();
    return res.status(201).json(savedAd);
  } catch (error) {
    console.error("Server error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

const allads = async (req, res) => {
  try {
    const ads = await Ad.find({ adStatus: "available" }) // Fetch ads with 'available' status
      .populate('userId', 'profileImageUrl'); // Populate profileImageUrl from users

    res.status(200).json(ads);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching ads', error });
  }
};









 const useradstable = async (req, res) => {
    const { page = 1, limit = 8 } = req.query; // Default values for page and limit
  
    try {
      const adsCount = await Ad.countDocuments({ userId: req.userId, adStatus: "available" });
      const ads = await Ad.find({ userId: req.userId, adStatus: "available" })
        .skip((page - 1) * limit)
        .limit(Number(limit));
  
      res.status(200).json({
        ads,
        totalAds: adsCount, // Send total count for pagination
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching ads', error });
    }
  };

 const usereditads = async (req,res) =>{
    
    try {
      const ad = await Ad.findById(req.params.id);
     
      if (!ad) {
        return res.status(404).json({ message: 'Ad not found' });
      }
      res.json(ad);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }




 const deleteuserad = async (req, res) => {
    const adId = req.params.id;

    try {
        
        const ad = await Ad.findOne({ _id: adId }); 

        if (!ad) {
            return res.status(404).json({ message: "Ad not found!" });
        }

       
        await Ad.findByIdAndDelete(adId);
        return res.status(200).json({ message: "Ad has been deleted" });

    } catch (error) {
        return res.status(500).json({ message: "Server Error", error });
    }
};

const sold_out_products = async (req,res) =>{
  try {
    const { adId } = req.params;
    const userId = req.userId; // Ensure req.userId is properly set in authMiddleware

    // Find the ad by its ID and ensure that the ad belongs to the specific user who posted it
    const ad = await Ad.findOne({ _id: adId, userId });

    if (!ad) {
      return res.status(400).json({ message: "Ad not found or unauthorized" });
    }

    // Update ad status
    ad.adStatus = "sold";
    const updatedAd = await ad.save();

    return res.status(200).json({ message: 'Ad marked as sold', ad: updatedAd });
  } catch (error) {
    console.error('Error marking ad as sold:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};


const getting_user_ads = async (req,res) =>{
  try {
    const page = parseInt(req.query.page) || 1; // Current page number
    const limit = parseInt(req.query.limit) || 10; // Number of ads per page

    // Calculate the starting index for pagination
    const startIndex = (page - 1) * limit;

    // Fetch ads where adStatus is true
    const ads = await Ad.find({ adStatus: "sold" })
      .skip(startIndex)
      .limit(limit);

    // Get the total count of ads
    const totalAds = await Ad.countDocuments({ adStatus: "available" });

    // Return paginated ads
    res.status(200).json({
      ads,
      totalAds,
      currentPage: page,
      totalPages: Math.ceil(totalAds / limit),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching ads', error });
  }
};




    









module.exports = { allads, userpostads, upload, useradstable, usereditads, deleteuserad, sold_out_products, getting_user_ads };
