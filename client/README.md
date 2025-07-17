# Village Farming Platform - Client

A modern React application for connecting villagers with farmers for land rental and agricultural development.

## Features

### 🏠 **Land Management**
- Browse available farming lands with detailed information
- Search and filter lands by location, type, and price
- View land details with images and specifications
- Add new land listings (for landowners)

### 👥 **User Management**
- User registration and authentication
- Separate interfaces for landowners and farmers
- Profile management and settings
- Role-based access control

### 💬 **Communication**
- Real-time chat between users
- AI-powered farming assistant chatbot
- Support for farming queries and guidance

### 📄 **Legal & Documentation**
- Automated farming permission agreement generation
- Digital contract management
- Land ownership verification system

### 📍 **Location Services**
- GPS tracking for land locations
- Interactive maps for land visualization
- Location-based search and filtering

### 💳 **Payment System**
- Secure payment processing
- Rental payment tracking
- Financial transaction history

## Tech Stack

- **Frontend Framework**: React 18
- **Routing**: React Router DOM
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Real-time Communication**: Socket.io Client
- **Form Handling**: React Hook Form
- **UI Components**: Custom CSS with modern design
- **Icons**: React Icons
- **Notifications**: React Hot Toast
- **Data Fetching**: React Query
- **Maps**: React Map GL (Mapbox)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend server running (see server README)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the client directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_MAPBOX_TOKEN=your_mapbox_token_here
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3000`

### Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App
- `npm lint` - Run ESLint
- `npm lint:fix` - Fix ESLint errors

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout/         # Header, Footer, Layout components
│   └── ...
├── context/            # React Context providers
│   ├── AuthContext.js  # Authentication state management
│   └── ...
├── pages/              # Page components
│   ├── auth/           # Authentication pages
│   ├── Home.js         # Landing page
│   ├── Dashboard.js    # User dashboard
│   ├── Lands.js        # Land listing page
│   └── ...
├── services/           # API service functions
│   ├── authService.js  # Authentication API calls
│   └── ...
├── styles/             # CSS files
│   └── index.css       # Global styles and variables
├── utils/              # Utility functions
├── hooks/              # Custom React hooks
├── App.js              # Main application component
└── index.js            # Application entry point
```

## Key Components

### Authentication System
- JWT-based authentication
- Protected routes
- User role management (landowner/farmer)
- Automatic token refresh

### Land Management
- Responsive land cards with images
- Advanced search and filtering
- Location-based services
- Owner verification system

### Dashboard
- User-specific dashboard views
- Activity tracking
- Quick actions
- Statistics and analytics

### Chat System
- Real-time messaging
- File sharing capabilities
- Chat history
- AI-powered farming assistant

## Styling

The application uses a modern CSS approach with:
- CSS Custom Properties (variables) for theming
- Responsive design with mobile-first approach
- Modern animations and transitions
- Consistent design system

### Color Scheme
- Primary: Green (#2E7D32)
- Accent: Light Green (#4CAF50)
- Text: Dark Gray (#333333)
- Background: Light Gray (#F5F5F5)

## API Integration

The client communicates with the backend through RESTful APIs:
- Authentication endpoints
- Land management APIs
- Chat and messaging APIs
- Payment processing APIs
- File upload and management

## Security Features

- JWT token authentication
- Protected routes
- Input validation
- XSS protection
- CSRF protection
- Secure file uploads

## Performance Optimizations

- Code splitting with React.lazy()
- Image optimization
- Caching strategies
- Bundle size optimization
- Lazy loading of components

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository. 