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
  MobilePhone: {
    type: String,
    required: true
  },
  condition: { 
    type: String, 
    required: true 
  },
  location: {
    type: {
      type: String, // 'Point'
      enum: ['Point'], // 'Point' is the only allowed value
      required: false
    },
    coordinates: {
      type: [Number], // Array of numbers: [longitude, latitude]
      required: false
    },
    readable: { // Human-readable location field
      type: String,
      required: true
    }
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
  basic: { 
    type: Boolean, 
    default: false 
  },
  standard: { 
    type: Boolean, 
    default: false 
  },
  premium: { 
    type: Boolean, 
    default: false 
  }
});

// Custom validation to ensure only one of basic, standard, or premium is true
adsSchema.pre('save', function (next) {
  const count = [this.basic, this.standard, this.premium].filter(Boolean).length;
  if (count > 1) {
    return next(new Error('Only one of basic, standard, or premium can be true.'));
  }
  next();
});

// Create a geospatial index on the 'location' field
adsSchema.index({ location: '2dsphere' });

const Ad = mongoose.model('Ad', adsSchema);

module.exports = Ad;
