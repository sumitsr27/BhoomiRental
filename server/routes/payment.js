const express = require('express');
const { body, validationResult } = require('express-validator');
const Rental = require('../models/Rental');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/payment/process
// @desc    Process a payment for rental
// @access  Private
router.post('/process', [
  protect,
  body('rentalId')
    .isMongoId()
    .withMessage('Valid rental ID is required'),
  body('paymentIndex')
    .isInt({ min: 0 })
    .withMessage('Valid payment index is required'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('paymentMethod')
    .isIn(['online', 'cash', 'bankTransfer', 'cheque'])
    .withMessage('Invalid payment method'),
  body('transactionId')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Transaction ID must be between 1 and 100 characters'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
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
      rentalId,
      paymentIndex,
      amount,
      paymentMethod,
      transactionId,
      notes
    } = req.body;

    // Get rental details
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
        message: 'You are not authorized to make payments for this rental'
      });
    }

    // Check if rental is active
    if (rental.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Payments can only be made for active rentals'
      });
    }

    // Validate payment index
    if (paymentIndex >= rental.payments.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment index'
      });
    }

    const payment = rental.payments[paymentIndex];

    // Check if payment is already made
    if (payment.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment has already been made'
      });
    }

    // Validate amount
    if (Math.abs(amount - payment.amount) > 0.01) {
      return res.status(400).json({
        success: false,
        message: `Payment amount must be ₹${payment.amount}`
      });
    }

    // Process payment
    await rental.markPaymentAsPaid(paymentIndex, transactionId, notes);

    // Check if all payments are completed
    const allPaymentsPaid = rental.payments.every(p => p.status === 'paid');
    if (allPaymentsPaid) {
      rental.status = 'completed';
      await rental.save();
    }

    // Populate updated rental
    await rental.populate('land', 'title address');
    await rental.populate('landowner', 'name email phone');
    await rental.populate('farmer', 'name email phone');

    res.json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        rental,
        payment: rental.payments[paymentIndex]
      }
    });
  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing payment'
    });
  }
});

// @route   GET /api/payment/:rentalId/schedule
// @desc    Get payment schedule for a rental
// @access  Private (Participants only)
router.get('/:rentalId/schedule', protect, async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.rentalId)
      .populate('landowner', 'name email')
      .populate('farmer', 'name email');

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
        message: 'You are not authorized to view this payment schedule'
      });
    }

    // Calculate payment statistics
    const totalPayments = rental.payments.length;
    const paidPayments = rental.payments.filter(p => p.status === 'paid').length;
    const pendingPayments = rental.payments.filter(p => p.status === 'pending').length;
    const overduePayments = rental.payments.filter(p => {
      return p.status === 'pending' && new Date(p.dueDate) < new Date();
    }).length;

    const totalPaid = rental.payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalPending = rental.payments
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0);

    res.json({
      success: true,
      data: {
        rental: {
          _id: rental._id,
          totalAmount: rental.totalAmount,
          remainingAmount: rental.remainingAmount,
          nextPaymentDue: rental.nextPaymentDue,
          daysRemaining: rental.daysRemaining
        },
        payments: rental.payments,
        statistics: {
          totalPayments,
          paidPayments,
          pendingPayments,
          overduePayments,
          totalPaid,
          totalPending
        }
      }
    });
  } catch (error) {
    console.error('Get payment schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching payment schedule'
    });
  }
});

// @route   GET /api/payment/my-payments
// @desc    Get user's payment history
// @access  Private
router.get('/my-payments', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Find rentals where user is a participant
    const rentals = await Rental.find({
      $or: [
        { landowner: req.user._id },
        { farmer: req.user._id }
      ]
    }).populate('land', 'title address');

    // Extract all payments from user's rentals
    let allPayments = [];
    rentals.forEach(rental => {
      rental.payments.forEach((payment, index) => {
        allPayments.push({
          ...payment.toObject(),
          rentalId: rental._id,
          rentalTitle: rental.land.title,
          rentalLocation: `${rental.land.address.village}, ${rental.land.address.city}`,
          paymentIndex: index
        });
      });
    });

    // Filter by status if provided
    if (status) {
      allPayments = allPayments.filter(payment => payment.status === status);
    }

    // Sort by due date
    allPayments.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));

    // Apply pagination
    const total = allPayments.length;
    const paginatedPayments = allPayments.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: {
        payments: paginatedPayments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get my payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching payment history'
    });
  }
});

// @route   POST /api/payment/:rentalId/reminder
// @desc    Send payment reminder
// @access  Private (Landowner only)
router.post('/:rentalId/reminder', [
  protect,
  body('paymentIndex')
    .isInt({ min: 0 })
    .withMessage('Valid payment index is required'),
  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Message cannot exceed 500 characters')
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

    const { paymentIndex, message } = req.body;
    const rental = await Rental.findById(req.params.rentalId)
      .populate('landowner', 'name email')
      .populate('farmer', 'name email');

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental agreement not found'
      });
    }

    // Check if user is the landowner
    if (rental.landowner._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the landowner can send payment reminders'
      });
    }

    // Validate payment index
    if (paymentIndex >= rental.payments.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment index'
      });
    }

    const payment = rental.payments[paymentIndex];

    // Check if payment is pending
    if (payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only send reminders for pending payments'
      });
    }

    // TODO: Send email/SMS reminder to farmer
    // For now, just return success

    res.json({
      success: true,
      message: 'Payment reminder sent successfully'
    });
  } catch (error) {
    console.error('Send reminder error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending reminder'
    });
  }
});

// @route   GET /api/payment/overdue
// @desc    Get overdue payments
// @access  Private
router.get('/overdue', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Find rentals where user is a participant
    const rentals = await Rental.find({
      $or: [
        { landowner: req.user._id },
        { farmer: req.user._id }
      ],
      status: 'active'
    }).populate('land', 'title address');

    // Extract overdue payments
    let overduePayments = [];
    rentals.forEach(rental => {
      rental.payments.forEach((payment, index) => {
        if (payment.status === 'pending' && new Date(payment.dueDate) < new Date()) {
          overduePayments.push({
            ...payment.toObject(),
            rentalId: rental._id,
            rentalTitle: rental.land.title,
            rentalLocation: `${rental.land.address.village}, ${rental.land.address.city}`,
            paymentIndex: index,
            daysOverdue: Math.ceil((new Date() - new Date(payment.dueDate)) / (1000 * 60 * 60 * 24))
          });
        }
      });
    });

    // Sort by days overdue (most overdue first)
    overduePayments.sort((a, b) => b.daysOverdue - a.daysOverdue);

    const total = overduePayments.length;
    const paginatedPayments = overduePayments.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: {
        payments: paginatedPayments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get overdue payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching overdue payments'
    });
  }
});

module.exports = router; 