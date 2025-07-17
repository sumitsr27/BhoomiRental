const axios = require('axios');

class ChatbotService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.baseURL = 'https://api.openai.com/v1/chat/completions';
  }

  // Generate response using OpenAI API
  async generateResponse(message, context = {}) {
    try {
      if (!this.apiKey) {
        return this.getFallbackResponse(message);
      }

      const systemPrompt = this.buildSystemPrompt(context);
      
      const response = await axios.post(this.baseURL, {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Chatbot API error:', error);
      return this.getFallbackResponse(message);
    }
  }

  // Build system prompt based on context
  buildSystemPrompt(context) {
    let prompt = `You are a helpful farming assistant for a village land rental platform. 
    You help farmers and landowners with questions about farming, land rental, and agricultural practices.
    
    Key information about the platform:
    - Landowners can list their land for rent
    - Farmers can search and rent land for farming
    - Platform supports location-based search
    - Land verification system ensures authenticity
    - Payment tracking and agreement generation
    
    Current context: ${JSON.stringify(context)}
    
    Guidelines:
    - Be helpful and informative
    - Provide practical farming advice
    - Explain land rental processes
    - Suggest best practices
    - Keep responses concise but helpful
    - If you don't know something, suggest contacting support
    
    Respond in a friendly, helpful manner.`;

    return prompt;
  }

  // Fallback responses when API is not available
  getFallbackResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Common farming questions
    if (lowerMessage.includes('soil') || lowerMessage.includes('land preparation')) {
      return "For soil preparation, I recommend testing your soil first to understand its composition. Different crops require different soil conditions. You can contact local agricultural extension services for soil testing. Would you like to know more about specific crop requirements?";
    }
    
    if (lowerMessage.includes('water') || lowerMessage.includes('irrigation')) {
      return "Water management is crucial for farming success. Consider factors like rainfall patterns, soil type, and crop water requirements. Drip irrigation is often more efficient than flood irrigation. What type of crops are you planning to grow?";
    }
    
    if (lowerMessage.includes('crop') || lowerMessage.includes('plant')) {
      return "Crop selection depends on your location, soil type, climate, and market demand. Popular crops in India include rice, wheat, pulses, and vegetables. Consider crop rotation to maintain soil health. What's your farming experience level?";
    }
    
    if (lowerMessage.includes('rent') || lowerMessage.includes('lease')) {
      return "To rent land through our platform, first create an account as a farmer. You can then search for available land in your preferred location, contact landowners, and negotiate terms. We also help generate rental agreements. Would you like help with the registration process?";
    }
    
    if (lowerMessage.includes('list') || lowerMessage.includes('land')) {
      return "To list your land for rent, register as a landowner on our platform. You'll need to provide land details, location, pricing, and upload verification documents. We'll help verify your land ownership. Ready to get started?";
    }
    
    if (lowerMessage.includes('payment') || lowerMessage.includes('money')) {
      return "Our platform supports various payment methods including online transfers, cash, and cheques. We track all payments and provide reminders for due dates. Payment schedules can be monthly, quarterly, or yearly based on agreement terms.";
    }
    
    if (lowerMessage.includes('verification') || lowerMessage.includes('documents')) {
      return "Land verification requires uploading documents like land deeds, property tax receipts, and survey reports. Our team reviews these documents to ensure authenticity. This helps build trust between landowners and farmers.";
    }
    
    if (lowerMessage.includes('location') || lowerMessage.includes('near me')) {
      return "You can search for land by location using our map feature. Enter your preferred area or use GPS to find nearby available land. We also show distance from your location to help you choose conveniently located land.";
    }
    
    if (lowerMessage.includes('agreement') || lowerMessage.includes('contract')) {
      return "We automatically generate rental agreements once both parties agree to terms. The agreement includes all rental terms, payment schedules, and responsibilities. Both parties need to sign digitally to activate the agreement.";
    }
    
    if (lowerMessage.includes('support') || lowerMessage.includes('help')) {
      return "I'm here to help with general questions about farming and our platform. For specific account issues, technical problems, or urgent matters, please contact our support team through the help section or email us directly.";
    }
    
    // Default response
    return "I'm here to help with farming and land rental questions! You can ask me about soil preparation, crop selection, land rental processes, payment methods, or any other farming-related topics. What would you like to know?";
  }

  // Process user intent
  async processIntent(message) {
    const lowerMessage = message.toLowerCase();
    
    // Define intents
    const intents = {
      farming_advice: ['soil', 'crop', 'water', 'irrigation', 'fertilizer', 'pest'],
      land_rental: ['rent', 'lease', 'land', 'property'],
      platform_help: ['register', 'login', 'account', 'profile'],
      payment_help: ['payment', 'money', 'cost', 'price', 'fee'],
      verification: ['verify', 'document', 'proof', 'authentic'],
      location: ['location', 'near', 'distance', 'area'],
      agreement: ['agreement', 'contract', 'terms', 'sign'],
      support: ['help', 'support', 'contact', 'issue']
    };

    // Find matching intent
    for (const [intent, keywords] of Object.entries(intents)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        return intent;
      }
    }

    return 'general';
  }

  // Get quick responses for common intents
  getQuickResponse(intent) {
    const responses = {
      farming_advice: "I can help with farming advice! What specific aspect would you like to know about - soil preparation, crop selection, irrigation, or pest management?",
      land_rental: "For land rental, you can search available land, contact landowners, and negotiate terms. Are you looking to rent land or list your land for rent?",
      platform_help: "Need help with the platform? I can guide you through registration, profile setup, or using our features. What specific help do you need?",
      payment_help: "We support various payment methods and provide payment tracking. What payment-related question do you have?",
      verification: "Land verification ensures authenticity and builds trust. We review documents like land deeds and property tax receipts. Need help with the verification process?",
      location: "You can search for land by location using our map feature. Enter your preferred area or use GPS to find nearby land. What location are you interested in?",
      agreement: "We generate rental agreements automatically once terms are agreed upon. The agreement includes all rental terms and payment schedules. Need help understanding the agreement process?",
      support: "For technical support or urgent issues, please contact our support team. I'm here for general farming and platform questions. How can I help?",
      general: "I'm here to help with farming and land rental questions! You can ask me about soil preparation, crop selection, land rental processes, or any other related topics."
    };

    return responses[intent] || responses.general;
  }

  // Handle conversation flow
  async handleMessage(message, userId = null, conversationHistory = []) {
    try {
      // Process intent
      const intent = await this.processIntent(message);
      
      // Build context
      const context = {
        userId,
        intent,
        conversationHistory: conversationHistory.slice(-5), // Last 5 messages
        timestamp: new Date().toISOString()
      };

      // Generate response
      const response = await this.generateResponse(message, context);
      
      return {
        response,
        intent,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Chatbot handle message error:', error);
      return {
        response: "I'm having trouble processing your request right now. Please try again or contact our support team for immediate assistance.",
        intent: 'error',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Get farming tips
  getFarmingTips() {
    return [
      "Test your soil before planting to understand its composition and nutrient levels.",
      "Practice crop rotation to maintain soil health and reduce pest problems.",
      "Use organic fertilizers when possible to improve soil structure.",
      "Implement proper irrigation techniques based on your crop and soil type.",
      "Monitor your crops regularly for signs of pests or diseases.",
      "Keep detailed records of your farming activities for better planning.",
      "Consider intercropping to maximize land use and improve yields.",
      "Use mulch to conserve soil moisture and control weeds.",
      "Plan your farming calendar based on local weather patterns.",
      "Network with other farmers to share knowledge and experiences."
    ];
  }

  // Get platform tips
  getPlatformTips() {
    return [
      "Complete your profile with accurate information to build trust.",
      "Upload clear photos of your land or farming experience.",
      "Respond promptly to inquiries to maintain good communication.",
      "Use our chat feature to discuss terms before finalizing agreements.",
      "Keep track of payment schedules to avoid delays.",
      "Read rental agreements carefully before signing.",
      "Use our location search to find conveniently located land.",
      "Check land verification status before making decisions.",
      "Maintain good ratings by fulfilling your commitments.",
      "Contact support if you encounter any issues."
    ];
  }
}

module.exports = new ChatbotService(); 