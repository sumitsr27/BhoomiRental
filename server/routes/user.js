const express = require('express');
const { body, validationResult, query } = require('express-validator');
const User = require('../models/User');
const { protect, requireUserType } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/user/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    res.json({
      success: true,
      data: {
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
});

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  protect,
  body('name').optional().trim().isLength({ min: 2, max: 50 }),
  body('phone').optional().matches(/^[0-9]{10}$/),
  body('address.street').optional().trim(),
  body('address.city').optional().trim(),
  body('address.state').optional().trim(),
  body('address.pincode').optional().trim(),
  body('farmingExperience').optional().isInt({ min: 0, max: 50 }),
  body('preferredCrops').optional().isArray(),
  body('bankDetails.accountNumber').optional().trim(),
  body('bankDetails.ifscCode').optional().trim(),
  body('bankDetails.accountHolderName').optional().trim()
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

    const updateFields = req.body;
    
    // Remove fields that shouldn't be updated
    delete updateFields.email;
    delete updateFields.password;
    delete updateFields.userType;
    delete updateFields.isVerified;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateFields,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
});

// @route   POST /api/user/upload-documents
// @desc    Upload land documents for verification
// @access  Private (Landowners only)
router.post('/upload-documents', [
  protect,
  requireUserType('landowner'),
  body('documents').isArray().withMessage('Documents must be an array'),
  body('documents.*.documentType')
    .isIn(['landDeed', 'propertyTax', 'surveyReport', 'other'])
    .withMessage('Invalid document type'),
  body('documents.*.documentUrl').isURL().withMessage('Invalid document URL')
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

    const { documents } = req.body;

    const user = await User.findById(req.user._id);
    
    // Add new documents to existing ones
    user.landDocuments.push(...documents);
    await user.save();

    res.json({
      success: true,
      message: 'Documents uploaded successfully',
      data: {
        documents: user.landDocuments
      }
    });
  } catch (error) {
    console.error('Upload documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading documents'
    });
  }
});

// @route   GET /api/user/farmers
// @desc    Get list of farmers (for landowners)
// @access  Private (Landowners only)
router.get('/farmers', [
  protect,
  requireUserType('landowner'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('search').optional().trim(),
  query('experience').optional().isInt({ min: 0, max: 50 }),
  query('state').optional().trim(),
  query('city').optional().trim()
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
      search,
      experience,
      state,
      city
    } = req.query;

    // Build filter object
    const filter = {
      userType: 'farmer',
      isActive: true
    };

    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { 'address.city': new RegExp(search, 'i') },
        { 'address.state': new RegExp(search, 'i') }
      ];
    }

    if (experience) {
      filter.farmingExperience = { $gte: parseInt(experience) };
    }

    if (state) {
      filter['address.state'] = new RegExp(state, 'i');
    }

    if (city) {
      filter['address.city'] = new RegExp(city, 'i');
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const farmers = await User.find(filter)
      .select('name email phone address farmingExperience preferredCrops rating totalRatings profileImage')
      .sort({ rating: -1, totalRatings: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        farmers,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get farmers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching farmers'
    });
  }
});

// @route   GET /api/user/landowners
// @desc    Get list of landowners (for farmers)
// @access  Private (Farmers only)
router.get('/landowners', [
  protect,
  requireUserType('farmer'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('search').optional().trim(),
  query('state').optional().trim(),
  query('city').optional().trim()
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
      search,
      state,
      city
    } = req.query;

    // Build filter object
    const filter = {
      userType: 'landowner',
      isActive: true
    };

    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { 'address.city': new RegExp(search, 'i') },
        { 'address.state': new RegExp(search, 'i') }
      ];
    }

    if (state) {
      filter['address.state'] = new RegExp(state, 'i');
    }

    if (city) {
      filter['address.city'] = new RegExp(city, 'i');
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const landowners = await User.find(filter)
      .select('name email phone address rating totalRatings profileImage isVerified')
      .sort({ isVerified: -1, rating: -1, totalRatings: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        landowners,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get landowners error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching landowners'
    });
  }
});

// @route   GET /api/user/:id
// @desc    Get user by ID (public profile)
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name email phone address userType farmingExperience preferredCrops rating totalRatings profileImage isVerified');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'User profile not available'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user'
    });
  }
});

// @route   POST /api/user/rate/:id
// @desc    Rate a user
// @access  Private
router.post('/rate/:id', [
  protect,
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters')
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

    const { rating, comment } = req.body;
    const targetUserId = req.params.id;

    // Prevent self-rating
    if (targetUserId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot rate yourself'
      });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update rating
    const newTotalRating = targetUser.rating * targetUser.totalRatings + rating;
    targetUser.totalRatings += 1;
    targetUser.rating = newTotalRating / targetUser.totalRatings;
    await targetUser.save();

    res.json({
      success: true,
      message: 'Rating submitted successfully',
      data: {
        newRating: targetUser.rating,
        totalRatings: targetUser.totalRatings
      }
    });
  } catch (error) {
    console.error('Rate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting rating'
    });
  }
});

module.exports = router; 