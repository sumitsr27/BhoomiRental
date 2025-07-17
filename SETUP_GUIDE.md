# 🗺️ Google Maps Setup Guide for Village Farming Platform

## 📋 Prerequisites

### 1. **Software Requirements**
- ✅ Node.js (v14 or above) - [Download here](https://nodejs.org/)
- ✅ npm (comes with Node.js)
- ✅ MongoDB (local or cloud) - [Download here](https://www.mongodb.com/try/download/community)
- ✅ Git (optional)

### 2. **Google Maps API Key**
- ✅ Google Cloud Console account
- ✅ Enabled Maps JavaScript API
- ✅ API Key with proper restrictions

---

## 🚀 Quick Setup Steps

### **Step 1: Get Google Maps API Key**

1. **Go to Google Cloud Console**
   - Visit [console.cloud.google.com](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Enable Maps JavaScript API**
   - Go to "APIs & Services" → "Library"
   - Search for "Maps JavaScript API"
   - Click "Enable"

3. **Create API Key**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy your API key

4. **Restrict API Key (Recommended)**
   - Click on your API key
   - Under "Application restrictions" select "HTTP referrers"
   - Add: `http://localhost:3000/*` (for development)
   - Under "API restrictions" select "Restrict key"
   - Select "Maps JavaScript API"

### **Step 2: Set Up Environment Variables**

**Create `server/.env` file:**
```env
# Server Configuration
PORT=5001
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/village-farming

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Google Maps API
GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY_HERE

# Other configurations...
```

**Create `client/.env` file:**
```env
REACT_APP_API_URL=http://localhost:5001/api
REACT_APP_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY_HERE
```

### **Step 3: Install Dependencies**

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd client
npm install
```

### **Step 4: Start the Application**

**Start MongoDB:**
```bash
# On Windows (if using MongoDB Compass, just open it)
# On Mac/Linux:
mongod
```

**Start Backend:**
```bash
cd server
npm start
```

**Start Frontend:**
```bash
cd client
npm start
```

---

## 🗺️ Features Added

### **1. Google Maps Component**
- ✅ Interactive map with click functionality
- ✅ Marker support for land locations
- ✅ Info windows for land details
- ✅ Responsive design

### **2. Enhanced Lands Page**
- ✅ List and Map view toggle
- ✅ 4 demo land fields for rent
- ✅ Interactive land cards
- ✅ Detailed land information
- ✅ Owner contact details

### **3. Add Land Form**
- ✅ Complete land listing form
- ✅ Google Maps integration for location selection
- ✅ Form validation
- ✅ Responsive design

### **4. Updated Dashboard**
- ✅ Modern UI with quick actions
- ✅ Navigation to Add Land (for landowners)
- ✅ Statistics display
- ✅ Recent activity section

---

## 🎯 Demo Land Fields Added

The system now includes 4 demo land fields:

1. **Green Acres Farm** - ₹15,000/acre (3 acres available)
2. **Sunny Fields** - ₹18,000/acre (5 acres available)
3. **Golden Harvest Land** - ₹22,000/acre (8 acres available)
4. **Organic Valley Farm** - ₹25,000/acre (4 acres available)

---

## 🔧 Troubleshooting

### **Map Not Loading?**
1. ✅ Check if Google Maps API key is set correctly
2. ✅ Verify API key has Maps JavaScript API enabled
3. ✅ Check browser console for errors
4. ✅ Ensure API key restrictions allow localhost

### **Can't Add Land?**
1. ✅ Make sure you're logged in as a landowner
2. ✅ Check if backend server is running
3. ✅ Verify MongoDB is connected
4. ✅ Check browser console for errors

### **Database Issues?**
1. ✅ Ensure MongoDB is running
2. ✅ Check connection string in `.env`
3. ✅ Verify database permissions

---

## 📱 How to Use

### **For Landowners:**
1. Register/Login as "Land Owner"
2. Go to Dashboard → "Add Land"
3. Fill in land details and click on map to set location
4. Submit the form

### **For Farmers:**
1. Register/Login as "Farmer"
2. Go to "Browse Lands" to see available lands
3. Toggle between List and Map view
4. Click on lands to see details
5. Contact landowners

### **Map Features:**
- **List View**: Card-based layout with all land details
- **Map View**: Interactive map with markers
- **Click Markers**: See land information popup
- **Click Map**: Set location when adding land

---

## 🔒 Security Notes

- ✅ API key is restricted to localhost for development
- ✅ Environment variables protect sensitive data
- ✅ JWT authentication for user sessions
- ✅ Input validation on forms

---

## 🚀 Next Steps

1. **Add Real Data**: Connect to your backend API
2. **Payment Integration**: Add Stripe or other payment gateway
3. **Chat System**: Implement real-time messaging
4. **File Upload**: Add image upload for land photos
5. **Search & Filters**: Add advanced search functionality

---

## 📞 Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify all environment variables are set
3. Ensure all services are running
4. Check MongoDB connection

**Happy Farming! 🌾** 