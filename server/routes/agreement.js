const express = require('express');
const { body, validationResult } = require('express-validator');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const Rental = require('../models/Rental');
const Land = require('../models/Land');
const User = require('../models/User');
const { protect, requireUserType } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/agreement/generate
// @desc    Generate rental agreement
// @access  Private
router.post('/generate', [
  protect,
  body('landId')
    .isMongoId()
    .withMessage('Valid land ID is required'),
  body('farmerId')
    .isMongoId()
    .withMessage('Valid farmer ID is required'),
  body('rentedAcres')
    .isFloat({ min: 0.1 })
    .withMessage('Rented acres must be at least 0.1'),
  body('pricePerAcre')
    .isFloat({ min: 100 })
    .withMessage('Price per acre must be at least ₹100'),
  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('endDate')
    .isISO8601()
    .withMessage('End date must be a valid date'),
  body('duration')
    .isInt({ min: 1, max: 60 })
    .withMessage('Duration must be between 1 and 60 months'),
  body('paymentSchedule')
    .isIn(['monthly', 'quarterly', 'halfYearly', 'yearly', 'oneTime'])
    .withMessage('Invalid payment schedule'),
  body('securityDeposit')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Security deposit must be a positive number'),
  body('terms.cropsAllowed')
    .optional()
    .isArray()
    .withMessage('Crops allowed must be an array'),
  body('terms.restrictions')
    .optional()
    .isArray()
    .withMessage('Restrictions must be an array'),
  body('terms.maintenance')
    .optional()
    .isIn(['landowner', 'farmer', 'shared'])
    .withMessage('Invalid maintenance responsibility'),
  body('terms.utilities')
    .optional()
    .isIn(['included', 'separate', 'notAvailable'])
    .withMessage('Invalid utilities option')
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
      landId,
      farmerId,
      rentedAcres,
      pricePerAcre,
      startDate,
      endDate,
      duration,
      paymentSchedule,
      securityDeposit = 0,
      terms = {}
    } = req.body;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    if (start < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be in the past'
      });
    }

    // Get land details
    const land = await Land.findById(landId).populate('owner');
    if (!land) {
      return res.status(404).json({
        success: false,
        message: 'Land not found'
      });
    }

    // Check if user is the landowner
    if (land.owner._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the landowner can generate agreements'
      });
    }

    // Check if land is available
    if (!land.isActive || land.landStatus !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Land is not available for rental'
      });
    }

    // Check if requested acres are available
    if (rentedAcres > land.availableAcres) {
      return res.status(400).json({
        success: false,
        message: 'Requested acres exceed available acres'
      });
    }

    // Get farmer details
    const farmer = await User.findById(farmerId);
    if (!farmer || farmer.userType !== 'farmer') {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }

    // Calculate total amount
    const totalAmount = rentedAcres * pricePerAcre * duration;

    // Create rental record
    const rental = new Rental({
      land: landId,
      landowner: req.user._id,
      farmer: farmerId,
      rentedAcres,
      pricePerAcre,
      totalAmount,
      startDate: start,
      endDate: end,
      duration,
      paymentSchedule,
      securityDeposit,
      terms,
      status: 'pending'
    });

    // Calculate payment schedule
    await rental.calculatePayments();
    await rental.save();

    // Generate agreement PDF
    const agreementUrl = await generateAgreementPDF(rental, land, farmer);

    // Update rental with agreement document
    rental.agreementDocument = {
      url: agreementUrl,
      generatedAt: new Date()
    };
    await rental.save();

    // Update land status
    land.landStatus = 'rented';
    land.availableAcres -= rentedAcres;
    await land.save();

    // Populate rental details
    await rental.populate('land', 'title address');
    await rental.populate('landowner', 'name email phone');
    await rental.populate('farmer', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Rental agreement generated successfully',
      data: { rental }
    });
  } catch (error) {
    console.error('Generate agreement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating agreement'
    });
  }
});

// @route   POST /api/agreement/:rentalId/sign
// @desc    Sign rental agreement
// @access  Private
router.post('/:rentalId/sign', [
  protect,
  body('signature')
    .notEmpty()
    .withMessage('Signature is required')
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

    const { signature } = req.body;
    const rentalId = req.params.rentalId;

    const rental = await Rental.findById(rentalId)
      .populate('landowner', 'name email')
      .populate('farmer', 'name email');

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental agreement not found'
      });
    }

    // Check if user is a participant in the rental
    const isLandowner = rental.landowner._id.toString() === req.user._id.toString();
    const isFarmer = rental.farmer._id.toString() === req.user._id.toString();

    if (!isLandowner && !isFarmer) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to sign this agreement'
      });
    }

    // Update signature status
    if (isLandowner) {
      rental.agreementDocument.signedByLandowner = true;
    } else {
      rental.agreementDocument.signedByFarmer = true;
    }

    // Check if both parties have signed
    if (rental.agreementDocument.signedByLandowner && rental.agreementDocument.signedByFarmer) {
      rental.status = 'active';
    }

    await rental.save();

    res.json({
      success: true,
      message: 'Agreement signed successfully',
      data: {
        signedByLandowner: rental.agreementDocument.signedByLandowner,
        signedByFarmer: rental.agreementDocument.signedByFarmer,
        status: rental.status
      }
    });
  } catch (error) {
    console.error('Sign agreement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while signing agreement'
    });
  }
});

// @route   GET /api/agreement/:rentalId
// @desc    Get rental agreement details
// @access  Private (Participants only)
router.get('/:rentalId', protect, async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.rentalId)
      .populate('land', 'title address totalAcres soilType waterSource')
      .populate('landowner', 'name email phone address')
      .populate('farmer', 'name email phone address farmingExperience');

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental agreement not found'
      });
    }

    // Check if user is a participant
    const isLandowner = rental.landowner._id.toString() === req.user._id.toString();
    const isFarmer = rental.farmer._id.toString() === req.user._id.toString();

    if (!isLandowner && !isFarmer) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this agreement'
      });
    }

    res.json({
      success: true,
      data: { rental }
    });
  } catch (error) {
    console.error('Get agreement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching agreement'
    });
  }
});

// @route   GET /api/agreement/my-rentals
// @desc    Get user's rental agreements
// @access  Private
router.get('/my-rentals', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter
    const filter = {
      $or: [
        { landowner: req.user._id },
        { farmer: req.user._id }
      ]
    };

    if (status) {
      filter.status = status;
    }

    const rentals = await Rental.find(filter)
      .populate('land', 'title address')
      .populate('landowner', 'name email')
      .populate('farmer', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Rental.countDocuments(filter);

    res.json({
      success: true,
      data: {
        rentals,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get my rentals error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching rentals'
    });
  }
});

// @route   POST /api/agreement/:rentalId/cancel
// @desc    Cancel rental agreement
// @access  Private (Participants only)
router.post('/:rentalId/cancel', [
  protect,
  body('reason')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Reason must be between 10 and 500 characters')
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

    const { reason } = req.body;
    const rental = await Rental.findById(req.params.rentalId)
      .populate('land');

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental agreement not found'
      });
    }

    // Check if user is a participant
    const isLandowner = rental.landowner.toString() === req.user._id.toString();
    const isFarmer = rental.farmer.toString() === req.user._id.toString();

    if (!isLandowner && !isFarmer) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to cancel this agreement'
      });
    }

    // Only allow cancellation if agreement is pending or active
    if (!['pending', 'active'].includes(rental.status)) {
      return res.status(400).json({
        success: false,
        message: 'Agreement cannot be cancelled in its current status'
      });
    }

    // Update rental status
    rental.status = 'cancelled';
    await rental.save();

    // Update land availability if agreement was active
    if (rental.status === 'active' && rental.land) {
      rental.land.availableAcres += rental.rentedAcres;
      rental.land.landStatus = 'available';
      await rental.land.save();
    }

    res.json({
      success: true,
      message: 'Rental agreement cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel agreement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling agreement'
    });
  }
});

// Helper function to generate agreement PDF
async function generateAgreementPDF(rental, land, farmer) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const fileName = `agreement_${rental._id}_${Date.now()}.pdf`;
      const filePath = path.join(__dirname, '../uploads/agreements', fileName);
      
      // Ensure directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Add content to PDF
      doc.fontSize(20).text('LAND RENTAL AGREEMENT', { align: 'center' });
      doc.moveDown();
      
      doc.fontSize(12).text(`Agreement Date: ${new Date().toLocaleDateString()}`);
      doc.text(`Agreement ID: ${rental._id}`);
      doc.moveDown();

      doc.fontSize(14).text('PARTIES:', { underline: true });
      doc.fontSize(12).text(`Landowner: ${rental.landowner.name}`);
      doc.text(`Farmer: ${farmer.name}`);
      doc.moveDown();

      doc.fontSize(14).text('LAND DETAILS:', { underline: true });
      doc.fontSize(12).text(`Land Title: ${land.title}`);
      doc.text(`Location: ${land.address.village}, ${land.address.city}, ${land.address.state}`);
      doc.text(`Total Acres: ${land.totalAcres}`);
      doc.text(`Rented Acres: ${rental.rentedAcres}`);
      doc.text(`Price per Acre: ₹${rental.pricePerAcre}`);
      doc.moveDown();

      doc.fontSize(14).text('RENTAL TERMS:', { underline: true });
      doc.fontSize(12).text(`Start Date: ${rental.startDate.toLocaleDateString()}`);
      doc.text(`End Date: ${rental.endDate.toLocaleDateString()}`);
      doc.text(`Duration: ${rental.duration} months`);
      doc.text(`Total Amount: ₹${rental.totalAmount}`);
      doc.text(`Payment Schedule: ${rental.paymentSchedule}`);
      doc.text(`Security Deposit: ₹${rental.securityDeposit}`);
      doc.moveDown();

      if (rental.terms.cropsAllowed && rental.terms.cropsAllowed.length > 0) {
        doc.fontSize(14).text('ALLOWED CROPS:', { underline: true });
        doc.fontSize(12).text(rental.terms.cropsAllowed.join(', '));
        doc.moveDown();
      }

      if (rental.terms.restrictions && rental.terms.restrictions.length > 0) {
        doc.fontSize(14).text('RESTRICTIONS:', { underline: true });
        doc.fontSize(12).text(rental.terms.restrictions.join(', '));
        doc.moveDown();
      }

      doc.fontSize(14).text('SIGNATURES:', { underline: true });
      doc.moveDown();
      doc.text('Landowner: _________________');
      doc.text('Date: _________________');
      doc.moveDown();
      doc.text('Farmer: _________________');
      doc.text('Date: _________________');

      doc.end();

      stream.on('finish', () => {
        // In a real application, you would upload this to cloud storage
        // For now, we'll return a local path
        resolve(`/uploads/agreements/${fileName}`);
      });

      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = router; 