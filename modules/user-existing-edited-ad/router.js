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

  try {
    const existingAd = await Ad.findById(adId);
    if (!existingAd) {
      return res.status(404).json({ message: "Ad not found" });
    }

    let updatedImages = [...existingAd.images];
    const newImageUrls = [];

    // Handle new image uploads directly to Firebase Storage
    if (req.files && req.files.length > 0) {
      const bucket = admin.storage().bucket();
      const uploadPromises = req.files.map(file => {
        return new Promise((resolve, reject) => {
          const blob = bucket.file(`ads/${uuidv4()}_${file.originalname}`);
          const blobStream = blob.createWriteStream({
            metadata: { contentType: file.mimetype },
          });

          blobStream.on("error", (error) => {
            console.error("Blob stream error:", error);
            reject(error);
          });

          blobStream.on("finish", () => {
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
            newImageUrls.push(publicUrl);
            resolve();
          });

          blobStream.end(file.buffer);
        });
      });

      // Wait for all uploads to finish
      await Promise.all(uploadPromises);
    }

    // Remove images specified in `removedImages`
    for (const imageUrl of removedImages) {
      const fileName = imageUrl.split("/").pop();
      const file = admin.storage().bucket().file(`ads/${fileName}`);
      await file.delete().catch((err) => {
        console.error(`Failed to delete file ${fileName}:`, err.message);
      });

      updatedImages = updatedImages.filter((img) => img !== imageUrl);
    }

    updatedImages.push(...newImageUrls);

    if (updatedImages.length === 0) {
      return res.status(400).json({ message: "At least one image is required." });
    }

    updateData.images = updatedImages;

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

module.exports = {
    update_user_edited_ad, upload
};