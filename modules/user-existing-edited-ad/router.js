// controllers/adController.js
const Ad = require("../user-ads/users-ads-model");
const admin = require("../controllers/service-account");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const connectDB = require("../../db");


connectDB();

// Set up multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5 MB file size limit
  });

// Update Ad Function
const update_user_edited_ad = async (req, res) => {
  const adId = req.params.id;
  const updateData = req.body;
  const removedImages = req.body.removedImages ? JSON.parse(req.body.removedImages) : [];

  console.log("Updated user ad data:", updateData);

  try {
    const existingAd = await Ad.findById(adId);
    if (!existingAd) {
      return res.status(404).json({ message: "Ad not found" });
    }

    let updatedImages = [...existingAd.images];
    const newImageUrls = [];

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      const bucket = admin.storage().bucket();
      const uploadPromises = req.files.map(file => {
        return new Promise((resolve, reject) => {
          const blob = bucket.file(`ads/${uuidv4()}_${file.originalname}`);
          const blobStream = blob.createWriteStream({
            metadata: { contentType: file.mimetype },
          });

          blobStream.on("error", reject);
          blobStream.on("finish", () => {
            newImageUrls.push(`https://storage.googleapis.com/${bucket.name}/${blob.name}`);
            resolve();
          });

          blobStream.end(file.buffer);
        });
      });

      await Promise.all(uploadPromises);
    }

    // Remove images
    for (const imageUrl of removedImages) {
      const fileName = imageUrl.split("/").pop();
      const file = admin.storage().bucket().file(`ads/${fileName}`);
      await file.delete().catch(err => console.error(`Failed to delete ${fileName}:`, err.message));

      updatedImages = updatedImages.filter(img => img !== imageUrl);
    }

    updatedImages.push(...newImageUrls);

    if (updatedImages.length === 0) {
      return res.status(400).json({ message: "At least one image is required." });
    }

    updateData.images = updatedImages;

    // Keep location as a simple string
    if (!updateData.location) {
      updateData.location = existingAd.location; // Retain previous location if not provided
    }

    // Reset premium, standard, and basic values
    updateData.premium = false;
    updateData.standard = false;
    updateData.basic = false;

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



const delete_user_ad = async (req, res) => {
  const adId = req.params.id;

  try {
    const ad = await Ad.findOne({ _id: adId });

    if (!ad) {
      return res.status(404).json({ message: "Ad not found!" });
    }

    // Delete images from Firebase Storage if they exist
    if (ad.images && ad.images.length > 0) {
      const bucket = admin.storage().bucket();
      
      // Create array of delete promises
      const deletePromises = ad.images.map(imageUrl => {
        try {
          // Extract file path from Firebase Storage URL
          const parsedUrl = new URL(imageUrl);
          const filePath = decodeURIComponent(parsedUrl.pathname)
            .split(`/${bucket.name}/`)
            .pop();

          const file = bucket.file(filePath);
          return file.delete().then(() => {
            console.log(`Deleted image from Firebase: ${filePath}`); // Log the deletion message
          });
        } catch (error) {
          console.error('Error parsing URL:', error);
          return Promise.resolve(); // Skip this deletion
        }
      });

      // Wait for all deletions to complete (or fail)
      await Promise.allSettled(deletePromises);
    }

    // Delete the ad from MongoDB
    await Ad.findByIdAndDelete(adId);
    return res.status(200).json({ message: "Ad has been deleted" });

  } catch (error) {
    console.error('Error deleting ad:', error);
    return res.status(500).json({ 
      message: "Server Error",
      error: error.message 
    });
  }
};

const user_sold_out_product = async (req, res) => {

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












module.exports = {
    update_user_edited_ad, upload, delete_user_ad, user_sold_out_product
};