const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Chat = require('../models/Chat');
const User = require('../models/User');
const { protect, requireChatParticipation } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/chat
// @desc    Get user's chat conversations
// @access  Private
router.get('/', [
  protect,
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
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

    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const chats = await Chat.find({
      participants: req.user._id,
      isActive: true
    })
    .populate('participants', 'name email profileImage')
    .populate('land', 'title availableAcres pricePerAcre')
    .populate('rental', 'rentedAcres totalAmount status')
    .populate('lastMessage.sender', 'name')
    .sort({ 'lastMessage.timestamp': -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await Chat.countDocuments({
      participants: req.user._id,
      isActive: true
    });

    res.json({
      success: true,
      data: {
        chats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching chats'
    });
  }
});

// @route   POST /api/chat
// @desc    Create a new chat or get existing chat
// @access  Private
router.post('/', [
  protect,
  body('participantId')
    .isMongoId()
    .withMessage('Valid participant ID is required'),
  body('landId')
    .optional()
    .isMongoId()
    .withMessage('Valid land ID is required'),
  body('rentalId')
    .optional()
    .isMongoId()
    .withMessage('Valid rental ID is required'),
  body('initialMessage')
    .optional()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Initial message must be between 1 and 500 characters')
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

    const { participantId, landId, rentalId, initialMessage } = req.body;

    // Prevent self-chat
    if (participantId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot create a chat with yourself'
      });
    }

    // Check if participant exists
    const participant = await User.findById(participantId);
    if (!participant || !participant.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Participant not found'
      });
    }

    // Find or create chat
    const chat = await Chat.findOrCreateChat(
      [req.user._id, participantId],
      landId,
      rentalId
    );

    // Add initial message if provided
    if (initialMessage) {
      await chat.addMessage(req.user._id, initialMessage);
    }

    // Populate chat details
    await chat.populate('participants', 'name email profileImage');
    await chat.populate('land', 'title availableAcres pricePerAcre');
    await chat.populate('rental', 'rentedAcres totalAmount status');

    res.json({
      success: true,
      message: 'Chat created/found successfully',
      data: { chat }
    });
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating chat'
    });
  }
});

// @route   GET /api/chat/:chatId
// @desc    Get chat messages
// @access  Private (Participants only)
router.get('/:chatId', [
  protect,
  requireChatParticipation,
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
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

    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const chat = req.chat;

    // Mark messages as read
    await chat.markAsRead(req.user._id);

    // Get messages with pagination
    const messages = chat.messages
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(skip, skip + parseInt(limit))
      .reverse();

    // Populate sender details
    await Chat.populate(messages, {
      path: 'sender',
      select: 'name email profileImage'
    });

    res.json({
      success: true,
      data: {
        chat: {
          _id: chat._id,
          participants: chat.participants,
          land: chat.land,
          rental: chat.rental,
          chatType: chat.chatType,
          title: chat.title,
          inquiry: chat.inquiry
        },
        messages,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(chat.messages.length / parseInt(limit)),
          totalItems: chat.messages.length,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching chat messages'
    });
  }
});

// @route   POST /api/chat/:chatId/messages
// @desc    Send a message in chat
// @access  Private (Participants only)
router.post('/:chatId/messages', [
  protect,
  requireChatParticipation,
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),
  body('messageType')
    .optional()
    .isIn(['text', 'image', 'document', 'location'])
    .withMessage('Invalid message type'),
  body('attachments')
    .optional()
    .isArray()
    .withMessage('Attachments must be an array')
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

    const { content, messageType = 'text', attachments = [] } = req.body;
    const chat = req.chat;

    // Add message to chat
    await chat.addMessage(req.user._id, content, messageType, attachments);

    // Populate the new message
    const newMessage = chat.messages[chat.messages.length - 1];
    await Chat.populate(newMessage, {
      path: 'sender',
      select: 'name email profileImage'
    });

    res.json({
      success: true,
      message: 'Message sent successfully',
      data: { message: newMessage }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending message'
    });
  }
});

// @route   PUT /api/chat/:chatId/read
// @desc    Mark chat messages as read
// @access  Private (Participants only)
router.put('/:chatId/read', [
  protect,
  requireChatParticipation
], async (req, res) => {
  try {
    const chat = req.chat;
    await chat.markAsRead(req.user._id);

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while marking messages as read'
    });
  }
});

// @route   DELETE /api/chat/:chatId
// @desc    Delete/archive a chat
// @access  Private (Participants only)
router.delete('/:chatId', [
  protect,
  requireChatParticipation
], async (req, res) => {
  try {
    const chat = req.chat;
    
    // Archive the chat instead of deleting
    chat.isActive = false;
    await chat.save();

    res.json({
      success: true,
      message: 'Chat archived successfully'
    });
  } catch (error) {
    console.error('Archive chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while archiving chat'
    });
  }
});

// @route   GET /api/chat/unread-count
// @desc    Get unread message count
// @access  Private
router.get('/unread-count', protect, async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id,
      isActive: true
    });

    let totalUnread = 0;
    chats.forEach(chat => {
      const unreadMessages = chat.messages.filter(
        message => !message.isRead && message.sender.toString() !== req.user._id.toString()
      );
      totalUnread += unreadMessages.length;
    });

    res.json({
      success: true,
      data: { unreadCount: totalUnread }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching unread count'
    });
  }
});

module.exports = router; 