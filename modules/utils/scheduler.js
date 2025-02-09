const cron = require('node-cron');
const Ad = require('../user-ads/users-ads-model'); // Adjust the path to your Ad model
const admin = require('../controllers/service-account'); // Adjust the path

// Schedule a job to run every minute
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    console.log(`Checking for expired ads at ${now}`);

    // Find ads that have expired
    const expiredAds = await Ad.find({ expiresAt: { $lte: now } });

    if (expiredAds.length > 0) {
      console.log(`Found ${expiredAds.length} expired ads. Deleting...`);

      // Delete each expired ad and its associated images
      for (const ad of expiredAds) {
        // Delete images from Firebase
        const bucket = admin.storage().bucket();
        if (ad.images && ad.images.length > 0) {
          const deletePromises = ad.images.map(imageUrl => {
            try {
              const parsedUrl = new URL(imageUrl);
              const filePath = decodeURIComponent(parsedUrl.pathname)
                .split(`/${bucket.name}/`)
                .pop();

              const file = bucket.file(filePath);
              return file.delete().then(() => {
                console.log(`Deleted image from Firebase: ${filePath}`);
              });
            } catch (error) {
              console.error('Error deleting image from Firebase:', error);
            }
          });

          await Promise.allSettled(deletePromises);
        }

        // Delete the ad from MongoDB
        await Ad.deleteOne({ _id: ad._id });
        console.log(`Deleted ad with ID: ${ad._id}`);
      }

      console.log('Expired ads deleted successfully.');
    } else {
      console.log('No expired ads found.');
    }
  } catch (error) {
    console.error('Error deleting expired ads:', error);
  }
});

console.log('Scheduler started. Checking for expired ads every minute...');