const mongoose = require('mongoose');

const adsSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  category: { 
    type: String, 
    required: true 
  },
  brand: { 
    type: String, 
    required: true 
  },
  model: { 
    type: String, 
    required: false // Make it optional
  },
  price: { 
    type: Number, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  mobilePhone: {
    type: String,
    required: true
  },
  condition: { 
    type: String, 
    required: true 
  },
  location: { 
    type: String,
    required:true,
 


  
  }, 
  images: [{ 
    type: String, // Store Firebase URLs
    required: true
  }],
  adStatus: { type: String, enum: ['available', 'sold', 'deleted'], default: 'available' }, // Include adStatus
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  expiresAt: { 
    type: Date, 
    required: true, 
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  },
  premium: { 
    type: Boolean, 
    default: false 
  },
  premiumUntil: { 
    type: Date, 
    default: null 
  }
});

// Custom validation to ensure only one of basic, standard, or premium is true


// Function to update ad premium status and duration
adsSchema.methods.activatePremium = function (days) {
  const now = new Date();
  
  // Calculate remaining unpaid days
  const remainingUnpaidDays = Math.max(0, (this.expiresAt - now) / (1000 * 60 * 60 * 24));

  // Convert remaining unpaid days to premium days
  const totalPremiumDays = remainingUnpaidDays + days;

  // Update premium status
  this.premium = true;
  this.premiumUntil = new Date(now.getTime() + totalPremiumDays * 24 * 60 * 60 * 1000);
  this.expiresAt = this.premiumUntil; // Set the new expiry date

  return this.save();
};

const Ad = mongoose.model('Ad', adsSchema);

module.exports = Ad;