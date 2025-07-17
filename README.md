# Village Farming Platform

A comprehensive MERN stack application that connects villagers with farmers for land rental and agricultural development. This platform facilitates sustainable farming practices by providing a secure, user-friendly interface for land management, communication, and legal documentation.

## 🌟 Features

### 🏠 **Land Management**
- **Land Listings**: Villagers can list their agricultural land with detailed specifications
- **Land Discovery**: Farmers can browse and search available lands with advanced filters
- **Location Services**: GPS tracking and mapping for accurate land location
- **Land Verification**: Ownership verification system with document uploads

### 👥 **User Management**
- **Dual User Types**: Separate interfaces for landowners and farmers
- **Authentication**: Secure JWT-based authentication system
- **Profile Management**: Comprehensive user profiles with verification
- **Role-based Access**: Different permissions and features based on user type

### 💬 **Communication & Support**
- **Real-time Chat**: Direct messaging between landowners and farmers
- **AI Chatbot**: Intelligent farming assistant for guidance and support
- **24/7 Support**: Automated and human support system

### 📄 **Legal & Documentation**
- **Automated Agreements**: Generate farming permission and rental agreements
- **Digital Contracts**: Secure digital contract management
- **Document Storage**: Safe storage for legal documents and verifications

### 💳 **Payment System**
- **Secure Payments**: Integrated payment processing for rentals
- **Transaction History**: Complete financial tracking
- **Multiple Payment Methods**: Support for various payment options

### 📊 **Analytics & Reporting**
- **Dashboard Analytics**: User-specific insights and statistics
- **Activity Tracking**: Monitor land usage and rental activities
- **Performance Metrics**: Track platform usage and success rates

## 🛠 Tech Stack

### Backend (Server)
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt
- **Real-time**: Socket.io for live communication
- **File Upload**: Multer with Cloudinary
- **PDF Generation**: PDFKit for agreements
- **AI Integration**: OpenAI API for chatbot
- **Email**: Nodemailer for notifications
- **Security**: Helmet, CORS, Rate limiting

### Frontend (Client)
- **Framework**: React 18 with modern hooks
- **Routing**: React Router DOM
- **State Management**: React Context API
- **HTTP Client**: Axios with interceptors
- **Real-time**: Socket.io Client
- **Forms**: React Hook Form with validation
- **UI**: Custom CSS with modern design
- **Icons**: React Icons
- **Notifications**: React Hot Toast
- **Data Fetching**: React Query
- **Maps**: React Map GL (Mapbox)

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd village-farming-platform
   ```

2. **Backend Setup**
   ```bash
   cd server
   npm install
   cp env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd client
   npm install
   # Create .env file with API URL
   npm start
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
village-farming-platform/
├── server/                 # Backend application
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API endpoints
│   ├── middleware/        # Custom middleware
│   ├── utils/             # Utility functions
│   ├── server.js          # Main server file
│   └── package.json
├── client/                # Frontend application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React contexts
│   │   ├── services/      # API services
│   │   ├── styles/        # CSS files
│   │   └── App.js         # Main app component
│   └── package.json
└── README.md
```

## 🔧 Configuration

### Environment Variables

**Server (.env)**
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

**Client (.env)**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_MAPBOX_TOKEN=your_mapbox_token
```

## 📱 Key Features in Detail

### Authentication System
- Secure JWT-based authentication
- Role-based access control (landowner/farmer)
- Password encryption with bcrypt
- Email verification system
- Password reset functionality

### Land Management
- Comprehensive land listing with images
- Advanced search and filtering
- Location-based services with GPS
- Land ownership verification
- Rental request management

### Communication Platform
- Real-time chat between users
- AI-powered farming assistant
- File sharing capabilities
- Chat history and notifications

### Legal Framework
- Automated agreement generation
- Digital signature support
- Document management system
- Legal compliance features

### Payment Processing
- Secure payment integration
- Multiple payment methods
- Transaction tracking
- Financial reporting

## 🔒 Security Features

- JWT token authentication
- Password encryption
- Input validation and sanitization
- XSS and CSRF protection
- Rate limiting
- Secure file uploads
- HTTPS enforcement

## 📊 Performance Optimizations

- Database indexing
- Caching strategies
- Image optimization
- Code splitting
- Lazy loading
- Bundle optimization

## 🧪 Testing

```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas or local MongoDB
2. Configure environment variables
3. Deploy to Heroku, AWS, or similar platform
4. Set up SSL certificate

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy to Netlify, Vercel, or similar platform
3. Configure environment variables
4. Set up custom domain

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🙏 Acknowledgments

- React and Node.js communities
- MongoDB for database solutions
- OpenAI for AI integration
- All contributors and supporters

---

**Built with ❤️ for sustainable agriculture and rural development** 