const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'document', 'location'],
    default: 'text'
  },
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'document', 'location']
    },
    url: String,
    filename: String,
    size: Number
  }],
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  land: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Land'
  },
  rental: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rental'
  },
  chatType: {
    type: String,
    enum: ['inquiry', 'rental', 'support'],
    default: 'inquiry'
  },
  messages: [messageSchema],
  lastMessage: {
    content: String,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Chat metadata
  title: {
    type: String,
    default: ''
  },
  // For inquiry chats
  inquiry: {
    subject: String,
    message: String,
    status: {
      type: String,
      enum: ['open', 'inProgress', 'resolved', 'closed'],
      default: 'open'
    }
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

// Index for efficient queries
chatSchema.index({ participants: 1 });
chatSchema.index({ land: 1 });
chatSchema.index({ rental: 1 });
chatSchema.index({ 'lastMessage.timestamp': -1 });

// Virtual for unread count
chatSchema.virtual('unreadCount').get(function() {
  return this.messages.filter(msg => !msg.isRead).length;
});

// Method to add message
chatSchema.methods.addMessage = function(senderId, content, messageType = 'text', attachments = []) {
  const message = {
    sender: senderId,
    content,
    messageType,
    attachments,
    timestamp: new Date()
  };
  
  this.messages.push(message);
  this.lastMessage = {
    content,
    sender: senderId,
    timestamp: new Date()
  };
  this.updatedAt = new Date();
  
  return this.save();
};

// Method to mark messages as read
chatSchema.methods.markAsRead = function(userId) {
  this.messages.forEach(message => {
    if (message.sender.toString() !== userId.toString() && !message.isRead) {
      message.isRead = true;
      message.readAt = new Date();
    }
  });
  
  return this.save();
};

// Method to get unread messages for a user
chatSchema.methods.getUnreadMessages = function(userId) {
  return this.messages.filter(message => 
    message.sender.toString() !== userId.toString() && !message.isRead
  );
};

// Static method to find or create chat
chatSchema.statics.findOrCreateChat = async function(participantIds, landId = null, rentalId = null) {
  // Ensure participantIds is sorted for consistent chat lookup
  const sortedParticipants = participantIds.sort();
  
  let chat = await this.findOne({
    participants: { $all: sortedParticipants, $size: sortedParticipants.length },
    land: landId,
    rental: rentalId
  });
  
  if (!chat) {
    chat = new this({
      participants: sortedParticipants,
      land: landId,
      rental: rentalId,
      messages: []
    });
    await chat.save();
  }
  
  return chat;
};

// Ensure virtual fields are serialized
chatSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Chat', chatSchema); 