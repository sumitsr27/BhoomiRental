const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema({
  land: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Land',
    required: true
  },
  landowner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Rental details
  rentedAcres: {
    type: Number,
    required: [true, 'Rented acres is required'],
    min: [0.1, 'Rented acres must be at least 0.1']
  },
  pricePerAcre: {
    type: Number,
    required: [true, 'Price per acre is required'],
    min: [100, 'Price per acre must be at least ₹100']
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [100, 'Total amount must be at least ₹100']
  },
  // Duration
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  duration: {
    type: Number, // in months
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 month'],
    max: [60, 'Duration cannot exceed 60 months']
  },
  // Payment details
  paymentSchedule: {
    type: String,
    enum: ['monthly', 'quarterly', 'halfYearly', 'yearly', 'oneTime'],
    required: [true, 'Payment schedule is required']
  },
  securityDeposit: {
    type: Number,
    default: 0,
    min: 0
  },
  // Payment status
  payments: [{
    amount: {
      type: Number,
      required: true
    },
    dueDate: {
      type: Date,
      required: true
    },
    paidDate: Date,
    status: {
      type: String,
      enum: ['pending', 'paid', 'overdue', 'cancelled'],
      default: 'pending'
    },
    paymentMethod: {
      type: String,
      enum: ['online', 'cash', 'bankTransfer', 'cheque'],
      default: 'online'
    },
    transactionId: String,
    notes: String
  }],
  // Agreement status
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled', 'disputed'],
    default: 'pending'
  },
  // Agreement terms
  terms: {
    cropsAllowed: [{
      type: String
    }],
    restrictions: [{
      type: String
    }],
    maintenance: {
      type: String,
      enum: ['landowner', 'farmer', 'shared'],
      default: 'farmer'
    },
    utilities: {
      type: String,
      enum: ['included', 'separate', 'notAvailable'],
      default: 'notAvailable'
    }
  },
  // Documents
  agreementDocument: {
    url: String,
    generatedAt: Date,
    signedByLandowner: {
      type: Boolean,
      default: false
    },
    signedByFarmer: {
      type: Boolean,
      default: false
    }
  },
  // Communication
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    isRead: {
      type: Boolean,
      default: false
    }
  }],
  // Reviews and ratings
  landownerReview: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: Date
  },
  farmerReview: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: Date
  },
  // Dispute handling
  disputes: [{
    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    issue: {
      type: String,
      required: true
    },
    description: String,
    status: {
      type: String,
      enum: ['open', 'underReview', 'resolved', 'closed'],
      default: 'open'
    },
    resolution: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    resolvedAt: Date
  }],
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

// Index for queries
rentalSchema.index({ landowner: 1, status: 1 });
rentalSchema.index({ farmer: 1, status: 1 });
rentalSchema.index({ land: 1, status: 1 });
rentalSchema.index({ startDate: 1, endDate: 1 });

// Virtual for remaining amount
rentalSchema.virtual('remainingAmount').get(function() {
  const paidAmount = this.payments
    .filter(payment => payment.status === 'paid')
    .reduce((sum, payment) => sum + payment.amount, 0);
  return this.totalAmount - paidAmount;
});

// Virtual for next payment due
rentalSchema.virtual('nextPaymentDue').get(function() {
  const pendingPayment = this.payments
    .filter(payment => payment.status === 'pending')
    .sort((a, b) => a.dueDate - b.dueDate)[0];
  return pendingPayment || null;
});

// Virtual for days remaining
rentalSchema.virtual('daysRemaining').get(function() {
  const today = new Date();
  const end = new Date(this.endDate);
  const diffTime = end - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
});

// Method to calculate payments
rentalSchema.methods.calculatePayments = function() {
  const payments = [];
  const paymentAmount = this.totalAmount / this.duration;
  const startDate = new Date(this.startDate);
  
  for (let i = 0; i < this.duration; i++) {
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i);
    
    payments.push({
      amount: paymentAmount,
      dueDate: dueDate,
      status: 'pending'
    });
  }
  
  this.payments = payments;
  return this.save();
};

// Method to mark payment as paid
rentalSchema.methods.markPaymentAsPaid = function(paymentIndex, transactionId, notes) {
  if (this.payments[paymentIndex]) {
    this.payments[paymentIndex].status = 'paid';
    this.payments[paymentIndex].paidDate = new Date();
    this.payments[paymentIndex].transactionId = transactionId;
    this.payments[paymentIndex].notes = notes;
    return this.save();
  }
  throw new Error('Payment not found');
};

// Ensure virtual fields are serialized
rentalSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Rental', rentalSchema); 