# Village Farming Platform - Server

A comprehensive backend server for a village farming land rental platform built with Node.js, Express, and MongoDB.

## Features

- **User Authentication**: JWT-based authentication for landowners and farmers
- **Land Management**: CRUD operations for land listings with location-based search
- **Rental System**: Complete rental agreement generation and management
- **Payment Tracking**: Payment scheduling and tracking system
- **Real-time Chat**: Socket.io based messaging system
- **AI Chatbot**: OpenAI-powered farming assistance
- **Document Generation**: PDF agreement generation
- **Location Services**: GPS-based land search and filtering
- **Rating System**: User rating and review system
- **File Upload**: Cloudinary integration for document and image uploads

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.io
- **File Upload**: Cloudinary
- **PDF Generation**: PDFKit
- **AI Chatbot**: OpenAI API
- **Validation**: Express-validator
- **Security**: Helmet, CORS, Rate limiting

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd village-farming-platform/server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000

   # Database
   MONGODB_URI=mongodb://localhost:27017/village-farming

   # JWT Secret
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret

   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password

   # Google Maps API
   GOOGLE_MAPS_API_KEY=your-google-maps-api-key

   # Payment Gateway (Stripe)
   STRIPE_SECRET_KEY=your-stripe-secret-key
   STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key

   # Chatbot API (OpenAI)
   OPENAI_API_KEY=your-openai-api-key
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/forgot-password` - Send password reset email
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/logout` - Logout user

### Land Management
- `POST /api/land` - Create land listing (landowners only)
- `GET /api/land` - Get all land listings with filters
- `GET /api/land/:id` - Get specific land listing
- `PUT /api/land/:id` - Update land listing (owner only)
- `DELETE /api/land/:id` - Delete land listing (owner only)
- `GET /api/land/my-listings` - Get user's land listings
- `POST /api/land/:id/inquire` - Send inquiry for land

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `POST /api/user/upload-documents` - Upload land documents
- `GET /api/user/farmers` - Get list of farmers (landowners only)
- `GET /api/user/landowners` - Get list of landowners (farmers only)
- `GET /api/user/:id` - Get user by ID (public profile)
- `POST /api/user/rate/:id` - Rate a user

### Chat System
- `GET /api/chat` - Get user's chat conversations
- `POST /api/chat` - Create new chat or get existing chat
- `GET /api/chat/:chatId` - Get chat messages
- `POST /api/chat/:chatId/messages` - Send message in chat
- `PUT /api/chat/:chatId/read` - Mark chat messages as read
- `DELETE /api/chat/:chatId` - Archive chat
- `GET /api/chat/unread-count` - Get unread message count

### Rental Agreements
- `POST /api/agreement/generate` - Generate rental agreement
- `POST /api/agreement/:rentalId/sign` - Sign rental agreement
- `GET /api/agreement/:rentalId` - Get rental agreement details
- `GET /api/agreement/my-rentals` - Get user's rental agreements
- `POST /api/agreement/:rentalId/cancel` - Cancel rental agreement

### Payment System
- `POST /api/payment/process` - Process a payment for rental
- `GET /api/payment/:rentalId/schedule` - Get payment schedule
- `GET /api/payment/my-payments` - Get user's payment history
- `POST /api/payment/:rentalId/reminder` - Send payment reminder
- `GET /api/payment/overdue` - Get overdue payments

### AI Chatbot
- `POST /api/chatbot/message` - Send message to chatbot
- `GET /api/chatbot/tips/farming` - Get farming tips
- `GET /api/chatbot/tips/platform` - Get platform usage tips
- `POST /api/chatbot/quick-response` - Get quick response based on intent
- `GET /api/chatbot/faq` - Get frequently asked questions
- `POST /api/chatbot/feedback` - Submit chatbot feedback

## Database Models

### User
- Basic info (name, email, phone, password)
- User type (landowner/farmer)
- Address and location
- Land documents (for landowners)
- Farming experience (for farmers)
- Ratings and reviews
- Bank details

### Land
- Land details (title, description, acres, price)
- Location (coordinates, address)
- Land characteristics (soil type, water source, irrigation)
- Documents and verification status
- Images and rental terms
- Statistics (views, inquiries, ratings)

### Rental
- Rental details (land, parties, terms)
- Payment schedule and tracking
- Agreement document
- Communication history
- Reviews and disputes
- Status management

### Chat
- Participants and messages
- Land/rental association
- Message types and attachments
- Read status and timestamps

## Socket.io Events

### Client to Server
- `join-chat` - Join a chat room
- `send-message` - Send a message

### Server to Client
- `receive-message` - Receive a new message

## Security Features

- JWT authentication
- Password hashing with bcrypt
- Input validation with express-validator
- Rate limiting
- CORS protection
- Helmet security headers
- Environment variable protection

## File Structure

```
server/
├── models/          # Database models
├── routes/          # API routes
├── middleware/      # Custom middleware
├── utils/           # Utility functions
├── controllers/     # Route controllers
├── uploads/         # File uploads
├── server.js        # Main server file
├── package.json     # Dependencies
└── README.md        # This file
```

## Development

### Running in Development Mode
```bash
npm run dev
```

### Running Tests
```bash
npm test
```

### Code Linting
```bash
npm run lint
```

## Deployment

### Environment Variables
Ensure all required environment variables are set in production.

### Database
Use a production MongoDB instance (MongoDB Atlas recommended).

### File Storage
Configure Cloudinary for production file storage.

### SSL/HTTPS
Use HTTPS in production with proper SSL certificates.

## API Response Format

All API responses follow this format:

```json
{
  "success": true/false,
  "message": "Response message",
  "data": {
    // Response data
  },
  "errors": [
    // Validation errors (if any)
  ]
}
```

## Error Handling

The server includes comprehensive error handling:
- Validation errors
- Authentication errors
- Database errors
- File upload errors
- Rate limiting errors

## Rate Limiting

- 100 requests per 15 minutes per IP
- Custom limits for specific endpoints

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the FAQ section in the chatbot

## Changelog

### v1.0.0
- Initial release
- Complete MERN stack implementation
- All core features implemented
- AI chatbot integration
- Real-time messaging
- Payment tracking system 