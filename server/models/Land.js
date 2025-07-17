const mongoose = require('mongoose');

const landSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Land title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  // Land details
  totalAcres: {
    type: Number,
    required: [true, 'Total acres is required'],
    min: [0.1, 'Land must be at least 0.1 acres'],
    max: [10000, 'Land cannot exceed 10000 acres']
  },
  availableAcres: {
    type: Number,
    required: [true, 'Available acres is required'],
    min: [0.1, 'Available land must be at least 0.1 acres']
  },
  pricePerAcre: {
    type: Number,
    required: [true, 'Price per acre is required'],
    min: [100, 'Price per acre must be at least ₹100'],
    max: [100000, 'Price per acre cannot exceed ₹100,000']
  },
  // Location details
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: [true, 'Coordinates are required']
    }
  },
  address: {
    street: String,
    village: String,
    city: String,
    district: String,
    state: String,
    pincode: String,
    country: {
      type: String,
      default: 'India'
    }
  },
  // Land characteristics
  soilType: {
    type: String,
    enum: ['alluvial', 'black', 'red', 'laterite', 'mountain', 'desert', 'other'],
    required: [true, 'Soil type is required']
  },
  waterSource: {
    type: String,
    enum: ['well', 'borewell', 'canal', 'river', 'lake', 'rainfed', 'other'],
    required: [true, 'Water source is required']
  },
  irrigationType: {
    type: String,
    enum: ['drip', 'sprinkler', 'flood', 'manual', 'none'],
    default: 'none'
  },
  // Land status
  landStatus: {
    type: String,
    enum: ['available', 'rented', 'underNegotiation', 'maintenance'],
    default: 'available'
  },
  // Documents and verification
  landDocuments: [{
    documentType: {
      type: String,
      enum: ['landDeed', 'propertyTax', 'surveyReport', 'soilTest', 'waterTest', 'other']
    },
    documentUrl: String,
    verified: {
      type: Boolean,
      default: false
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  // Images
  images: [{
    url: String,
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Rental terms
  rentalTerms: {
    minimumDuration: {
      type: Number,
      default: 1,
      min: 1,
      max: 12
    },
    maximumDuration: {
      type: Number,
      default: 12,
      min: 1,
      max: 60
    },
    paymentSchedule: {
      type: String,
      enum: ['monthly', 'quarterly', 'halfYearly', 'yearly'],
      default: 'monthly'
    },
    securityDeposit: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  // Restrictions and preferences
  restrictions: [{
    type: String
  }],
  preferredCrops: [{
    type: String
  }],
  // Contact and availability
  contactPreference: {
    type: String,
    enum: ['phone', 'email', 'both'],
    default: 'both'
  },
  availableFrom: {
    type: Date,
    required: [true, 'Available from date is required']
  },
  availableTo: {
    type: Date
  },
  // Statistics
  views: {
    type: Number,
    default: 0
  },
  inquiries: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for location-based queries
landSchema.index({ location: '2dsphere' });

// Index for search queries
landSchema.index({ 
  title: 'text', 
  description: 'text', 
  'address.village': 'text',
  'address.city': 'text',
  'address.district': 'text'
});

// Virtual for average rating
landSchema.virtual('averageRating').get(function() {
  return this.totalRatings > 0 ? (this.rating / this.totalRatings).toFixed(1) : 0;
});

// Virtual for total price
landSchema.virtual('totalPrice').get(function() {
  return this.availableAcres * this.pricePerAcre;
});

// Method to update views
landSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to update inquiries
landSchema.methods.incrementInquiries = function() {
  this.inquiries += 1;
  return this.save();
};

// Method to update rating
landSchema.methods.updateRating = function(newRating) {
  const totalRating = this.rating * this.totalRatings + newRating;
  this.totalRatings += 1;
  this.rating = totalRating / this.totalRatings;
  return this.save();
};

// Ensure virtual fields are serialized
landSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Land', landSchema); 