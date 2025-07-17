import React, { useState } from 'react';
import GoogleMapComponent from '../components/GoogleMap';
import { FaMapMarkedAlt, FaTree, FaUser, FaPhone, FaEnvelope, FaSearch } from 'react-icons/fa';

const Lands = () => {
  const [selectedLand, setSelectedLand] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'

  // Demo land data
  const demoLands = [
    {
      id: 1,
      title: "Green Acres Farm",
      description: "Fertile agricultural land with good irrigation facilities. Perfect for rice and wheat cultivation.",
      totalAcres: 5,
      availableAcres: 3,
      pricePerAcre: 15000,
      location: { lat: 20.5937, lng: 78.9629 },
      owner: "Rajesh Kumar",
      phone: "+91 98765 43210",
      email: "rajesh@example.com",
      soilType: "Alluvial",
      waterSource: "Canal",
      village: "Village A",
      city: "City A",
      district: "District A",
      state: "Maharashtra"
    },
    {
      id: 2,
      title: "Sunny Fields",
      description: "Well-maintained land with modern farming infrastructure. Suitable for organic farming.",
      totalAcres: 8,
      availableAcres: 5,
      pricePerAcre: 18000,
      location: { lat: 21.1702, lng: 79.0949 },
      owner: "Priya Sharma",
      phone: "+91 98765 43211",
      email: "priya@example.com",
      soilType: "Black",
      waterSource: "Borewell",
      village: "Village B",
      city: "City B",
      district: "District B",
      state: "Maharashtra"
    },
    {
      id: 3,
      title: "Golden Harvest Land",
      description: "Premium agricultural land with excellent soil quality. Ideal for cash crops and vegetables.",
      totalAcres: 12,
      availableAcres: 8,
      pricePerAcre: 22000,
      location: { lat: 19.0760, lng: 72.8777 },
      owner: "Amit Patel",
      phone: "+91 98765 43212",
      email: "amit@example.com",
      soilType: "Red",
      waterSource: "River",
      village: "Village C",
      city: "City C",
      district: "District C",
      state: "Maharashtra"
    },
    {
      id: 4,
      title: "Organic Valley Farm",
      description: "Certified organic land with natural farming practices. Perfect for sustainable agriculture.",
      totalAcres: 6,
      availableAcres: 4,
      pricePerAcre: 25000,
      location: { lat: 18.5204, lng: 73.8567 },
      owner: "Sita Devi",
      phone: "+91 98765 43213",
      email: "sita@example.com",
      soilType: "Laterite",
      waterSource: "Well",
      village: "Village D",
      city: "City D",
      district: "District D",
      state: "Maharashtra"
    }
  ];

  // Convert lands to map markers
  const mapMarkers = demoLands.map(land => ({
    lat: land.location.lat,
    lng: land.location.lng,
    title: land.title,
    description: land.description,
    price: land.pricePerAcre
  }));

  const handleMapClick = (coordinates) => {
    console.log('Map clicked at:', coordinates);
  };

  const handleMarkerClick = (marker) => {
    const land = demoLands.find(l => 
      l.location.lat === marker.lat && l.location.lng === marker.lng
    );
    setSelectedLand(land);
  };

  const handleLandSelect = (land) => {
    setSelectedLand(land);
  };

  return (
    <div className="lands-page">
      <div className="container">
        <div className="page-header">
          <h1>Available Lands for Rent</h1>
          <p>Browse and connect with landowners for agricultural opportunities</p>
        </div>

        {/* View Mode Toggle */}
        <div className="view-toggle">
          <button 
            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <FaSearch /> List View
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'map' ? 'active' : ''}`}
            onClick={() => setViewMode('map')}
          >
            <FaMapMarkedAlt /> Map View
          </button>
        </div>

        {viewMode === 'map' ? (
          <div className="map-container">
            <GoogleMapComponent
              center={{ lat: 20.5937, lng: 78.9629 }}
              zoom={6}
              markers={mapMarkers}
              onMapClick={handleMapClick}
              onMarkerClick={handleMarkerClick}
              height="500px"
            />
          </div>
        ) : (
          <div className="lands-grid">
            {demoLands.map((land) => (
              <div 
                key={land.id} 
                className={`land-card ${selectedLand?.id === land.id ? 'selected' : ''}`}
                onClick={() => handleLandSelect(land)}
              >
                <div className="land-card-header">
                  <h3>{land.title}</h3>
                  <span className="price">₹{land.pricePerAcre.toLocaleString()}/acre</span>
                </div>
                
                <div className="land-details">
                  <p className="description">{land.description}</p>
                  
                  <div className="land-stats">
                    <div className="stat">
                      <FaTree />
                      <span>{land.availableAcres} acres available</span>
                    </div>
                    <div className="stat">
                      <FaMapMarkedAlt />
                      <span>{land.village}, {land.city}</span>
                    </div>
                    <div className="stat">
                      <span>Soil: {land.soilType}</span>
                    </div>
                    <div className="stat">
                      <span>Water: {land.waterSource}</span>
                    </div>
                  </div>

                  <div className="owner-info">
                    <div className="owner">
                      <FaUser />
                      <span>{land.owner}</span>
                    </div>
                    <div className="contact">
                      <FaPhone />
                      <span>{land.phone}</span>
                    </div>
                    <div className="contact">
                      <FaEnvelope />
                      <span>{land.email}</span>
                    </div>
                  </div>
                </div>

                <div className="land-actions">
                  <button className="btn btn-primary">View Details</button>
                  <button className="btn btn-secondary">Contact Owner</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Selected Land Details */}
        {selectedLand && (
          <div className="selected-land-details">
            <h2>{selectedLand.title}</h2>
            <div className="land-detail-grid">
              <div className="detail-section">
                <h3>Land Information</h3>
                <p><strong>Total Acres:</strong> {selectedLand.totalAcres}</p>
                <p><strong>Available Acres:</strong> {selectedLand.availableAcres}</p>
                <p><strong>Price per Acre:</strong> ₹{selectedLand.pricePerAcre.toLocaleString()}</p>
                <p><strong>Soil Type:</strong> {selectedLand.soilType}</p>
                <p><strong>Water Source:</strong> {selectedLand.waterSource}</p>
              </div>
              
              <div className="detail-section">
                <h3>Location</h3>
                <p><strong>Village:</strong> {selectedLand.village}</p>
                <p><strong>City:</strong> {selectedLand.city}</p>
                <p><strong>District:</strong> {selectedLand.district}</p>
                <p><strong>State:</strong> {selectedLand.state}</p>
              </div>

              <div className="detail-section">
                <h3>Owner Contact</h3>
                <p><strong>Name:</strong> {selectedLand.owner}</p>
                <p><strong>Phone:</strong> {selectedLand.phone}</p>
                <p><strong>Email:</strong> {selectedLand.email}</p>
              </div>
            </div>

            <div className="action-buttons">
              <button className="btn btn-primary">Request Rental</button>
              <button className="btn btn-secondary">Send Message</button>
              <button className="btn btn-outline" onClick={() => setSelectedLand(null)}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .lands-page {
          padding: 20px 0;
        }

        .page-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .page-header h1 {
          color: #2c3e50;
          margin-bottom: 10px;
        }

        .view-toggle {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-bottom: 30px;
        }

        .toggle-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border: 2px solid #3498db;
          background: white;
          color: #3498db;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .toggle-btn.active {
          background: #3498db;
          color: white;
        }

        .toggle-btn:hover {
          background: #3498db;
          color: white;
        }

        .map-container {
          margin-bottom: 30px;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .lands-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .land-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }

        .land-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }

        .land-card.selected {
          border-color: #3498db;
          background: #f8f9ff;
        }

        .land-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .land-card-header h3 {
          color: #2c3e50;
          margin: 0;
        }

        .price {
          background: #27ae60;
          color: white;
          padding: 5px 10px;
          border-radius: 6px;
          font-weight: bold;
        }

        .land-details {
          margin-bottom: 20px;
        }

        .description {
          color: #666;
          margin-bottom: 15px;
          line-height: 1.5;
        }

        .land-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 15px;
        }

        .stat {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #555;
          font-size: 14px;
        }

        .owner-info {
          border-top: 1px solid #eee;
          padding-top: 15px;
        }

        .owner, .contact {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 5px;
          color: #666;
          font-size: 14px;
        }

        .land-actions {
          display: flex;
          gap: 10px;
        }

        .selected-land-details {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          margin-top: 30px;
        }

        .selected-land-details h2 {
          color: #2c3e50;
          margin-bottom: 20px;
          text-align: center;
        }

        .land-detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 30px;
          margin-bottom: 30px;
        }

        .detail-section h3 {
          color: #3498db;
          margin-bottom: 15px;
          border-bottom: 2px solid #3498db;
          padding-bottom: 5px;
        }

        .detail-section p {
          margin-bottom: 8px;
          color: #555;
        }

        .action-buttons {
          display: flex;
          gap: 15px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-block;
          text-align: center;
        }

        .btn-primary {
          background: #3498db;
          color: white;
        }

        .btn-primary:hover {
          background: #2980b9;
        }

        .btn-secondary {
          background: #27ae60;
          color: white;
        }

        .btn-secondary:hover {
          background: #229954;
        }

        .btn-outline {
          background: transparent;
          color: #666;
          border: 2px solid #ddd;
        }

        .btn-outline:hover {
          background: #f5f5f5;
        }

        @media (max-width: 768px) {
          .lands-grid {
            grid-template-columns: 1fr;
          }

          .land-stats {
            grid-template-columns: 1fr;
          }

          .land-detail-grid {
            grid-template-columns: 1fr;
          }

          .action-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default Lands; 