const express = require('express');
const { body, validationResult } = require('express-validator');
const chatbotService = require('../utils/chatbot');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/chatbot/message
// @desc    Send message to chatbot
// @access  Public (with optional auth)
router.post('/message', [
  optionalAuth,
  body('message')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),
  body('conversationHistory')
    .optional()
    .isArray()
    .withMessage('Conversation history must be an array')
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

    const { message, conversationHistory = [] } = req.body;
    const userId = req.user ? req.user._id : null;

    // Handle message with chatbot service
    const result = await chatbotService.handleMessage(message, userId, conversationHistory);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Chatbot message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing chatbot message'
    });
  }
});

// @route   GET /api/chatbot/tips/farming
// @desc    Get farming tips
// @access  Public
router.get('/tips/farming', (req, res) => {
  try {
    const tips = chatbotService.getFarmingTips();
    
    res.json({
      success: true,
      data: { tips }
    });
  } catch (error) {
    console.error('Get farming tips error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching farming tips'
    });
  }
});

// @route   GET /api/chatbot/tips/platform
// @desc    Get platform usage tips
// @access  Public
router.get('/tips/platform', (req, res) => {
  try {
    const tips = chatbotService.getPlatformTips();
    
    res.json({
      success: true,
      data: { tips }
    });
  } catch (error) {
    console.error('Get platform tips error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching platform tips'
    });
  }
});

// @route   POST /api/chatbot/quick-response
// @desc    Get quick response based on intent
// @access  Public
router.post('/quick-response', [
  body('message')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Message must be between 1 and 500 characters')
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

    const { message } = req.body;

    // Process intent and get quick response
    const intent = await chatbotService.processIntent(message);
    const response = chatbotService.getQuickResponse(intent);

    res.json({
      success: true,
      data: {
        response,
        intent
      }
    });
  } catch (error) {
    console.error('Quick response error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating quick response'
    });
  }
});

// @route   GET /api/chatbot/faq
// @desc    Get frequently asked questions
// @access  Public
router.get('/faq', (req, res) => {
  try {
    const faqs = [
      {
        question: "How do I rent land through the platform?",
        answer: "First, create an account as a farmer. Then search for available land in your preferred location, contact landowners, and negotiate terms. Once agreed, we'll help generate a rental agreement."
      },
      {
        question: "How do I list my land for rent?",
        answer: "Register as a landowner, provide land details including location and pricing, upload verification documents, and we'll help verify your land ownership."
      },
      {
        question: "What documents are needed for land verification?",
        answer: "You'll need land deeds, property tax receipts, survey reports, and other ownership documents. Our team reviews these to ensure authenticity."
      },
      {
        question: "How are payments handled?",
        answer: "We support various payment methods including online transfers, cash, and cheques. We track all payments and provide reminders for due dates."
      },
      {
        question: "Can I search for land by location?",
        answer: "Yes! Use our map feature to search for land by location. Enter your preferred area or use GPS to find nearby available land."
      },
      {
        question: "How do rental agreements work?",
        answer: "We automatically generate rental agreements once both parties agree to terms. The agreement includes all rental terms, payment schedules, and responsibilities."
      },
      {
        question: "What if I have farming questions?",
        answer: "Our AI chatbot can help with farming advice, crop selection, soil preparation, and other agricultural topics. You can also connect with other farmers through our platform."
      },
      {
        question: "How do I contact support?",
        answer: "For technical support or urgent issues, contact our support team through the help section or email us directly. Our chatbot can help with general questions."
      }
    ];

    res.json({
      success: true,
      data: { faqs }
    });
  } catch (error) {
    console.error('Get FAQ error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching FAQ'
    });
  }
});

// @route   POST /api/chatbot/feedback
// @desc    Submit chatbot feedback
// @access  Public
router.post('/feedback', [
  body('message')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),
  body('response')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Response must be between 1 and 1000 characters'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('feedback')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Feedback cannot exceed 500 characters')
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

    const { message, response, rating, feedback } = req.body;
    const userId = req.user ? req.user._id : null;

    // TODO: Store feedback in database for improving chatbot
    // For now, just log it
    console.log('Chatbot feedback:', {
      userId,
      message,
      response,
      rating,
      feedback,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Feedback submitted successfully'
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting feedback'
    });
  }
});

module.exports = router; 