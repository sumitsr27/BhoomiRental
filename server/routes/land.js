const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Land = require('../models/Land');
const { protect, requireUserType, requireOwnership, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/land
// @desc    Create a new land listing
// @access  Private (Landowners only)
router.post('/', [
  protect,
  requireUserType('landowner'),
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 20, max: 1000 })
    .withMessage('Description must be between 20 and 1000 characters'),
  body('totalAcres')
    .isFloat({ min: 0.1, max: 10000 })
    .withMessage('Total acres must be between 0.1 and 10000'),
  body('availableAcres')
    .isFloat({ min: 0.1 })
    .withMessage('Available acres must be at least 0.1'),
  body('pricePerAcre')
    .isFloat({ min: 100, max: 100000 })
    .withMessage('Price per acre must be between ₹100 and ₹100,000'),
  body('location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be an array of 2 numbers [longitude, latitude]'),
  body('location.coordinates.*')
    .isFloat()
    .withMessage('Coordinates must be valid numbers'),
  body('address.village').optional().trim(),
  body('address.city').optional().trim(),
  body('address.district').optional().trim(),
  body('address.state').optional().trim(),
  body('address.pincode').optional().trim(),
  body('soilType')
    .isIn(['alluvial', 'black', 'red', 'laterite', 'mountain', 'desert', 'other'])
    .withMessage('Invalid soil type'),
  body('waterSource')
    .isIn(['well', 'borewell', 'canal', 'river', 'lake', 'rainfed', 'other'])
    .withMessage('Invalid water source'),
  body('irrigationType')
    .optional()
    .isIn(['drip', 'sprinkler', 'flood', 'manual', 'none'])
    .withMessage('Invalid irrigation type'),
  body('availableFrom')
    .isISO8601()
    .withMessage('Available from date must be a valid date'),
  body('availableTo').optional().isISO8601().withMessage('Available to date must be a valid date'),
  body('rentalTerms.minimumDuration')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('Minimum duration must be between 1 and 12 months'),
  body('rentalTerms.maximumDuration')
    .optional()
    .isInt({ min: 1, max: 60 })
    .withMessage('Maximum duration must be between 1 and 60 months'),
  body('rentalTerms.paymentSchedule')
    .optional()
    .isIn(['monthly', 'quarterly', 'halfYearly', 'yearly'])
    .withMessage('Invalid payment schedule'),
  body('rentalTerms.securityDeposit')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Security deposit must be a positive number'),
  body('restrictions').optional().isArray(),
  body('preferredCrops').optional().isArray(),
  body('contactPreference')
    .optional()
    .isIn(['phone', 'email', 'both'])
    .withMessage('Invalid contact preference')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const landData = {
      ...req.body,
      owner: req.user._id
    };

    // Validate that available acres doesn't exceed total acres
    if (landData.availableAcres > landData.totalAcres) {
      return res.status(400).json({
        success: false,
        message: 'Available acres cannot exceed total acres'
      });
    }

    const land = new Land(landData);
    await land.save();

    // Populate owner details
    await land.populate('owner', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Land listing created successfully',
      data: { land }
    });
  } catch (error) {
    console.error('Create land error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating land listing'
    });
  }
});

// @route   GET /api/land
// @desc    Get all land listings with filters
// @access  Public
router.get('/', [
  optionalAuth,
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be positive'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be positive'),
  query('minAcres').optional().isFloat({ min: 0 }).withMessage('Min acres must be positive'),
  query('maxAcres').optional().isFloat({ min: 0 }).withMessage('Max acres must be positive'),
  query('soilType').optional().isIn(['alluvial', 'black', 'red', 'laterite', 'mountain', 'desert', 'other']),
  query('waterSource').optional().isIn(['well', 'borewell', 'canal', 'river', 'lake', 'rainfed', 'other']),
  query('irrigationType').optional().isIn(['drip', 'sprinkler', 'flood', 'manual', 'none']),
  query('state').optional().trim(),
  query('city').optional().trim(),
  query('district').optional().trim(),
  query('village').optional().trim(),
  query('search').optional().trim(),
  query('sortBy').optional().isIn(['price', 'acres', 'createdAt', 'rating']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
  query('latitude').optional().isFloat(),
  query('longitude').optional().isFloat(),
  query('radius').optional().isFloat({ min: 0 }).withMessage('Radius must be positive')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      page = 1,
      limit = 10,
      minPrice,
      maxPrice,
      minAcres,
      maxAcres,
      soilType,
      waterSource,
      irrigationType,
      state,
      city,
      district,
      village,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      latitude,
      longitude,
      radius
    } = req.query;

    // Build filter object
    const filter = {
      isActive: true,
      landStatus: 'available'
    };

    // Price filter
    if (minPrice || maxPrice) {
      filter.pricePerAcre = {};
      if (minPrice) filter.pricePerAcre.$gte = parseFloat(minPrice);
      if (maxPrice) filter.pricePerAcre.$lte = parseFloat(maxPrice);
    }

    // Acres filter
    if (minAcres || maxAcres) {
      filter.availableAcres = {};
      if (minAcres) filter.availableAcres.$gte = parseFloat(minAcres);
      if (maxAcres) filter.availableAcres.$lte = parseFloat(maxAcres);
    }

    // Land characteristics filter
    if (soilType) filter.soilType = soilType;
    if (waterSource) filter.waterSource = waterSource;
    if (irrigationType) filter.irrigationType = irrigationType;

    // Location filter
    if (state) filter['address.state'] = new RegExp(state, 'i');
    if (city) filter['address.city'] = new RegExp(city, 'i');
    if (district) filter['address.district'] = new RegExp(district, 'i');
    if (village) filter['address.village'] = new RegExp(village, 'i');

    // Search filter
    if (search) {
      filter.$text = { $search: search };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    let query = Land.find(filter)
      .populate('owner', 'name email phone rating totalRatings')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Add location-based filtering if coordinates provided
    if (latitude && longitude && radius) {
      query = query.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(longitude), parseFloat(latitude)]
            },
            $maxDistance: parseFloat(radius) * 1000 // Convert km to meters
          }
        }
      });
    }

    // Execute query
    const lands = await query.exec();
    const total = await Land.countDocuments(filter);

    // Increment views for each land
    if (req.user) {
      await Promise.all(lands.map(land => land.incrementViews()));
    }

    res.json({
      success: true,
      data: {
        lands,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get lands error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching land listings'
    });
  }
});

// @route   GET /api/land/:id
// @desc    Get a specific land listing
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const land = await Land.findById(req.params.id)
      .populate('owner', 'name email phone rating totalRatings userType');

    if (!land) {
      return res.status(404).json({
        success: false,
        message: 'Land listing not found'
      });
    }

    if (!land.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Land listing is not available'
      });
    }

    // Increment views if user is authenticated
    if (req.user) {
      await land.incrementViews();
    }

    res.json({
      success: true,
      data: { land }
    });
  } catch (error) {
    console.error('Get land error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching land listing'
    });
  }
});

// @route   PUT /api/land/:id
// @desc    Update a land listing
// @access  Private (Owner only)
router.put('/:id', [
  protect,
  requireOwnership('Land'),
  body('title').optional().trim().isLength({ min: 5, max: 100 }),
  body('description').optional().trim().isLength({ min: 20, max: 1000 }),
  body('availableAcres').optional().isFloat({ min: 0.1 }),
  body('pricePerAcre').optional().isFloat({ min: 100, max: 100000 }),
  body('landStatus').optional().isIn(['available', 'rented', 'underNegotiation', 'maintenance']),
  body('isActive').optional().isBoolean(),
  body('isFeatured').optional().isBoolean()
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const land = await Land.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('owner', 'name email phone');

    if (!land) {
      return res.status(404).json({
        success: false,
        message: 'Land listing not found'
      });
    }

    res.json({
      success: true,
      message: 'Land listing updated successfully',
      data: { land }
    });
  } catch (error) {
    console.error('Update land error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating land listing'
    });
  }
});

// @route   DELETE /api/land/:id
// @desc    Delete a land listing
// @access  Private (Owner only)
router.delete('/:id', [
  protect,
  requireOwnership('Land')
], async (req, res) => {
  try {
    const land = await Land.findByIdAndDelete(req.params.id);

    if (!land) {
      return res.status(404).json({
        success: false,
        message: 'Land listing not found'
      });
    }

    res.json({
      success: true,
      message: 'Land listing deleted successfully'
    });
  } catch (error) {
    console.error('Delete land error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting land listing'
    });
  }
});

// @route   GET /api/land/my-listings
// @desc    Get current user's land listings
// @access  Private (Landowners only)
router.get('/my-listings', [
  protect,
  requireUserType('landowner')
], async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const lands = await Land.find({ owner: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Land.countDocuments({ owner: req.user._id });

    res.json({
      success: true,
      data: {
        lands,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get my listings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching your listings'
    });
  }
});

// @route   POST /api/land/:id/inquire
// @desc    Send inquiry for a land listing
// @access  Private
router.post('/:id/inquire', [
  protect,
  body('message')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Message must be between 10 and 500 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const land = await Land.findById(req.params.id).populate('owner');
    
    if (!land) {
      return res.status(404).json({
        success: false,
        message: 'Land listing not found'
      });
    }

    if (!land.isActive || land.landStatus !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Land is not available for inquiry'
      });
    }

    // Prevent landowners from inquiring about their own land
    if (land.owner._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot inquire about your own land'
      });
    }

    // Increment inquiry count
    await land.incrementInquiries();

    // TODO: Create chat between landowner and farmer
    // TODO: Send notification to landowner

    res.json({
      success: true,
      message: 'Inquiry sent successfully'
    });
  } catch (error) {
    console.error('Send inquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending inquiry'
    });
  }
});

module.exports = router; 