const User = require('../user-registration/user-registration-model'); // User model

const authMiddleware = require('../middlewares/auth-middleware');
const multer = require('multer');
const admin = require('../controllers/service-account');
const connectDB = require('../../db');

connectDB();

const bucket = admin.storage().bucket();

// Configure Multer for file upload (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB file size limit
}); 
const profilephoto = async(req, res) => {
    const userId = req.userId;  // From authMiddleware
  
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
  
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const file = req.file;
      const fileName = `${Date.now()}_${file.originalname}`;
      const fileUpload = bucket.file(fileName);
  
      // Upload file to Firebase storage
      await fileUpload.save(file.buffer, {
        metadata: {
          contentType: file.mimetype
        }
      });
  
      // Generate signed URL for the uploaded file
      const [fileUrl] = await fileUpload.getSignedUrl({
        action: 'read',
        expires: '03-09-2491' // Expires far into the future
      });
  
      // Update user's profile image URL in the database
      user.profileImageUrl = fileUrl;
      await user.save();
  
      return res.json({
        message: 'Profile image updated successfully',
        profileImageUrl: user.profileImageUrl,
      });
    } catch (error) {
      console.error('Error updating profile image:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  };
  const userprofileimage = async (req, res) => {
    const userId = req.userId;  // From authMiddleware
  
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      return res.json({
        profileImageUrl: user.profileImageUrl,
        username: user.name
      });
    } catch (error) {
      console.error('Error fetching profile data:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  };

  const updateusername = async (req, res) => {

    const userId = req.userId;  // From authMiddleware
  const { newName } = req.body;  // New username from request body

  if (!newName) {
    return res.status(400).json({ message: 'New username is required' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the username
    user.name = newName;
    await user.save();

    return res.json({
      message: 'Username updated successfully',
      username: user.name
    });
  } catch (error) {
    console.error('Error updating username:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};


  


  







  module.exports = {profilephoto, upload, userprofileimage, updateusername}


