const multer = require('multer');
const path = require('path');
const admin = require('firebase-admin');
const Ad = require('../user-ads/users-ads-model');
const connectDB = require('../../db');
const admin = require("../controllers/service-account"); // Firebase admin instance
const multer = require("multer");
const { v4: uuidv4 } = require("uuid"); 

// Initialize Firebase storage bucket
const bucket = admin.storage().bucket();
connectDB();

// Configure Multer to store files in memory temporarily
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB file size limit
});

const allads = async (req, res) => {
  try {
    const ads = await Ad.find({ adStatus: "available" }) // Fetch ads with 'available' status
      .populate('userId', 'profileImageUrl'); // Populate profileImageUrl from users

    res.status(200).json(ads);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching ads', error });
  }
};

const userpostads = async (req, res) => {
  try {
    const { category, brand, model, price, description, condition, MobilePhone, location } = req.body;

    console.log(req.body); // Debugging request body data

    if (!category || !brand || !model || !price || !description || !condition || !MobilePhone || !location) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "At least one image is required" });
    }

    const imageUrls = [];

    await Promise.all(
      req.files.map(async (file) => {
        const firebaseFileName = `${Date.now()}_${file.originalname}`;
        const fileUpload = bucket.file(firebaseFileName);

        await new Promise((resolve, reject) => {
          const blobStream = fileUpload.createWriteStream({
            metadata: {
              contentType: file.mimetype,
            },
          });

          blobStream.on('error', (error) => {
            console.error('Error uploading file to Firebase:', error);
            return reject(res.status(500).json({ message: 'Error uploading image' }));
          });

          blobStream.on('finish', async () => {
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${firebaseFileName}`;
            imageUrls.push(publicUrl);
            resolve();
          });

          blobStream.end(file.buffer);
        });
      })
    );

    const locationData = JSON.parse(location);

    if (!locationData.readable || !Array.isArray(locationData.coordinates) || locationData.coordinates.length !== 2) {
      return res.status(400).json({ message: "Invalid location data provided" });
    }

    const newAd = new Ad({
      userId: req.userId,
      category,
      brand,
      model,
      MobilePhone,
      price,
      description,
      location: {
        type: locationData.type || 'Point',
        coordinates: locationData.coordinates,
        readable: locationData.readable
      },
      condition,
      images: imageUrls,
      adStatus: "available"
    });

    const savedAd = await newAd.save();
    return res.status(201).json(savedAd);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
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
    // First we can get the Id of the ad we want to edit, from the client side.
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


const update_user_edited_ad = async (req,res) =>{

  const adId = req.params.id;
  const updateData = req.body;
  const removedImages = req.body.removedImages ? JSON.parse(req.body.removedImages) : [];

  try {
    const existingAd = await Ad.findById(adId);
    if (!existingAd) {
      return res.status(404).json({ message: "Ad not found" });
    }

    let updatedImages = [...existingAd.images]; // Start with existing images
    const newImageUrls = [];

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      const bucket = admin.storage().bucket();
      for (const file of req.files) {
        const blob = bucket.file(`ads/${uuidv4()}_${file.originalname}`);
        const blobStream = blob.createWriteStream({
          metadata: { contentType: file.mimetype },
        });

        await new Promise((resolve, reject) => {

          
          blobStream.on("error", reject);
          blobStream.on("finish", () => {
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
            newImageUrls.push(publicUrl);
            resolve();
          });
          blobStream.end(file.buffer);
        });
      }
    }

    // Remove images specified in `removedImages` (URLs)
    for (const imageUrl of removedImages) {
      // Delete from cloud storage
      const fileName = imageUrl.split("/").pop();
      const file = admin.storage().bucket().file(`ads/${fileName}`);
      await file.delete().catch((err) => {
        console.error(`Failed to delete file ${fileName}:`, err.message);
      });

      // Remove from `updatedImages`
      updatedImages = updatedImages.filter((img) => img !== imageUrl);
    }

    // Add new images to the updated list
    updatedImages.push(...newImageUrls);

    // Ensure at least one image exists
    if (updatedImages.length === 0) {
      return res.status(400).json({ message: "At least one image is required." });
    }

    updateData.images = updatedImages; // Update the images field in updateData

    // Handle location data if provided
    if (updateData.location) {
      let locationData;
      try {
        locationData = JSON.parse(updateData.location);
      } catch (error) {
        return res.status(400).json({ message: "Invalid location data format" });
      }

      if (
        !locationData.readable ||
        !Array.isArray(locationData.coordinates) ||
        locationData.coordinates.length !== 2
      ) {
        return res.status(400).json({ message: "Invalid location data provided" });
      }

      updateData.location = {
        type: "Point",
        coordinates: [locationData.coordinates[0], locationData.coordinates[1]],
        readable: locationData.readable,
      };
    }

    // Update the ad in the database
    const updatedAd = await Ad.findByIdAndUpdate(adId, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      message: "Ad updated successfully",
      ad: updatedAd,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while updating the ad", error: error.message });
  }
};










    









module.exports = { allads, userpostads, upload, useradstable, update_user_edited_ad, usereditads, deleteuserad, sold_out_products, getting_user_ads };
