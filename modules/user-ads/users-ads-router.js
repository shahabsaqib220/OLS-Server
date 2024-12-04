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



    









module.exports = { allads, userpostads, upload, useradstable, usereditads, deleteuserad };
