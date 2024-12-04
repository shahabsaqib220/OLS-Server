const multer = require('multer');
const path = require('path');
const admin = require('firebase-admin');
const Ad = require('../user-ads/users-ads-model');
const connectDB = require('../../db');
const storage = multer.memoryStorage(); // Store files in memory temporarily
const upload = multer({ storage });

const bucket = admin.storage().bucket();
connectDB();

const allads = async (req, res) => {
  try {
    const ads = await Ad.find({ adStatus: "available" })// Filter ads where adStatus is false
      .populate('userId', 'profileImageUrl'); // Populate profileImageUrl from users

    res.status(200).json(ads); // Return ads with user data, including location and user profile
  } catch (error) {
    res.status(500).json({ message: 'Error fetching ads', error });
  }
};




const useradspost = async (req,res) => {

    try {
        const { category, brand, model, price, description, condition, MobilePhone, location } = req.body;
    
        // Log the request body to check if location is being passed correctly
        console.log(req.body); // Check the data here
    
        // Validate required fields
        if (!category || !brand || !model || !price || !description || !condition || !MobilePhone || !location) {
          return res.status(400).json({ message: "All fields are required" });
        }
    
        // Validate if images are provided
        if (!req.files || req.files.length === 0) {
          return res.status(400).json({ message: "At least one image is required" });
        }
    
        const imageUrls = [];
    
        // Upload images to Firebase and collect URLs
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
                // Get public URL of uploaded file
                const publicUrl = `https://storage.googleapis.com/${bucket.name}/${firebaseFileName}`;
                imageUrls.push(publicUrl); // Add Firebase URL to array
                resolve(); // Resolve the promise once the image is uploaded
              });
    
              blobStream.end(file.buffer); // Upload the file
            });
          })
        );
    
        // Parse the location data from the front-end (received as JSON string)
        const locationData = JSON.parse(location);
    
        // Ensure that human-readable location is provided and valid
        if (!locationData.readable || !Array.isArray(locationData.coordinates) || locationData.coordinates.length !== 2) {
          return res.status(400).json({ message: "Invalid location data provided" });
        }
    
        // Create a new ad with Firebase image URLs
        const newAd = new Ad({
          userId: req.userId, // User ID from JWT (provided by authMiddleware)
          category,
          brand,
          model,
          MobilePhone,
          price,
          description,
          location: {
            type: locationData.type || 'Point', // Default to 'Point' if not provided
            coordinates: locationData.coordinates, // Longitude and latitude
            readable: locationData.readable // Human-readable address
          },
          condition,
          images: imageUrls, // Firebase URLs
          adStatus: "available"// Initially, ad is not active
        });
    
        // Save the ad to MongoDB
        const savedAd = await newAd.save();
    
        // Return the saved ad to the client
        return res.status(201).json(savedAd);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
      }
    };


    
module.exports = {allads, useradspost }