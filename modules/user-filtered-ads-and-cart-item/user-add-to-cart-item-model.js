const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User", // Reference to User model
  },
  adId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Ad", // Reference to Ad model
  },
  adDetails: {
    category: String,
    brand: String,
    model: String,
    price: Number,
    description: String,
    MobilePhone: String,
    condition: String,
    location: {
      readable: String, // or whatever structure you're using
    },
    images: [
      {
        url: String, // Adjust as necessary to store URL and alt for image
        alt: String,
      },
    ],
  },
  quantity: {
    type: Number,
    default: 1, // Default quantity is 1
  },
  adStatus: { type: String, enum: ['available', 'sold', 'deleted'], default: 'available' }, // Include adStatus
  addedAt: {
    type: Date,
    default: Date.now, // Timestamp of when the item was added
  },
});

const Cart = mongoose.model("Cart", cartItemSchema);

module.exports = Cart;
