import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GoogleMapComponent from '../components/GoogleMap';
import { FaSave, FaTimes, FaLocationArrow } from 'react-icons/fa';

const AddLand = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    totalAcres: '',
    availableAcres: '',
    pricePerAcre: '',
    soilType: 'alluvial',
    waterSource: 'well',
    address: {
      village: '',
      city: '',
      district: '',
      state: '',
      pincode: ''
    },
    location: {
      coordinates: [78.9629, 20.5937] // Default to India center
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locating, setLocating] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    setError('');
  };

  const handleMapClick = (coordinates) => {
    setFormData(prev => ({
      ...prev,
      location: {
        coordinates: [coordinates.lng, coordinates.lat]
      }
    }));
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          location: {
            coordinates: [position.coords.longitude, position.coords.latitude]
          }
        }));
        setLocating(false);
      },
      (err) => {
        setError('Unable to fetch your location. Please allow location access.');
        setLocating(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate form data
      if (!formData.title || !formData.description || !formData.totalAcres || !formData.pricePerAcre) {
        throw new Error('Please fill in all required fields');
      }

      if (parseFloat(formData.availableAcres) > parseFloat(formData.totalAcres)) {
        throw new Error('Available acres cannot be more than total acres');
      }

      // Here you would typically send the data to your API
      console.log('Land data to submit:', formData);
      
      // For demo purposes, show success message
      alert('Land added successfully!');
      navigate('/lands');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  return (
    <div className="add-land-page">
      <div className="container">
        <div className="page-header">
          <h1>Add New Land Listing</h1>
          <p>List your agricultural land for rent to connect with farmers</p>
        </div>

        <div className="form-container">
          <form onSubmit={handleSubmit} className="land-form">
            <div className="form-grid">
              {/* Basic Information */}
              <div className="form-section">
                <h3>Basic Information</h3>
                
                <div className="form-group">
                  <label htmlFor="title">Land Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter land title (e.g., Green Acres Farm)"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description *</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your land, soil quality, facilities, etc."
                    rows="4"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="totalAcres">Total Acres *</label>
                    <input
                      type="number"
                      id="totalAcres"
                      name="totalAcres"
                      value={formData.totalAcres}
                      onChange={handleChange}
                      placeholder="0.0"
                      step="0.1"
                      min="0.1"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="availableAcres">Available Acres *</label>
                    <input
                      type="number"
                      id="availableAcres"
                      name="availableAcres"
                      value={formData.availableAcres}
                      onChange={handleChange}
                      placeholder="0.0"
                      step="0.1"
                      min="0.1"
                      max={formData.totalAcres}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="pricePerAcre">Price per Acre (₹) *</label>
                  <input
                    type="number"
                    id="pricePerAcre"
                    name="pricePerAcre"
                    value={formData.pricePerAcre}
                    onChange={handleChange}
                    placeholder="0"
                    min="100"
                    required
                  />
                </div>
              </div>

              {/* Land Characteristics */}
              <div className="form-section">
                <h3>Land Characteristics</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="soilType">Soil Type</label>
                    <select
                      id="soilType"
                      name="soilType"
                      value={formData.soilType}
                      onChange={handleChange}
                    >
                      <option value="alluvial">Alluvial</option>
                      <option value="black">Black</option>
                      <option value="red">Red</option>
                      <option value="laterite">Laterite</option>
                      <option value="mountain">Mountain</option>
                      <option value="desert">Desert</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="waterSource">Water Source</label>
                    <select
                      id="waterSource"
                      name="waterSource"
                      value={formData.waterSource}
                      onChange={handleChange}
                    >
                      <option value="well">Well</option>
                      <option value="borewell">Borewell</option>
                      <option value="canal">Canal</option>
                      <option value="river">River</option>
                      <option value="lake">Lake</option>
                      <option value="rainfed">Rainfed</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="form-section">
                <h3>Address Information</h3>
                
                <div className="form-group">
                  <label htmlFor="address.village">Village</label>
                  <input
                    type="text"
                    id="address.village"
                    name="address.village"
                    value={formData.address.village}
                    onChange={handleChange}
                    placeholder="Village name"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="address.city">City</label>
                    <input
                      type="text"
                      id="address.city"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleChange}
                      placeholder="City name"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="address.district">District</label>
                    <input
                      type="text"
                      id="address.district"
                      name="address.district"
                      value={formData.address.district}
                      onChange={handleChange}
                      placeholder="District name"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="address.state">State</label>
                    <input
                      type="text"
                      id="address.state"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleChange}
                      placeholder="State name"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="address.pincode">Pincode</label>
                    <input
                      type="text"
                      id="address.pincode"
                      name="address.pincode"
                      value={formData.address.pincode}
                      onChange={handleChange}
                      placeholder="Pincode"
                    />
                  </div>
                </div>
              </div>

              {/* Map Section */}
              <div className="form-section map-section">
                <h3>Land Location</h3>
                <p>Click on the map to set the exact location of your land</p>
                <button
                  type="button"
                  className="btn btn-outline use-location-btn"
                  onClick={handleUseMyLocation}
                  disabled={locating}
                  style={{ marginBottom: 16 }}
                >
                  <FaLocationArrow style={{ marginRight: 6 }} />
                  {locating ? 'Fetching location...' : 'Use My Location'}
                </button>
                <div className="map-container">
                  <GoogleMapComponent
                    center={{ 
                      lat: formData.location.coordinates[1], 
                      lng: formData.location.coordinates[0] 
                    }}
                    zoom={10}
                    onMapClick={handleMapClick}
                    height="300px"
                  />
                </div>
                
                <div className="coordinates-display">
                  <p><strong>Selected Coordinates:</strong></p>
                  <p>Latitude: {formData.location.coordinates[1].toFixed(6)}</p>
                  <p>Longitude: {formData.location.coordinates[0].toFixed(6)}</p>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {/* Form Actions */}
            <div className="form-actions">
              <button
                type="button"
                onClick={handleCancel}
                className="btn btn-secondary"
                disabled={loading}
              >
                <FaTimes /> Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                <FaSave /> {loading ? 'Adding Land...' : 'Add Land'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .add-land-page {
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

        .form-container {
          max-width: 800px;
          margin: 0 auto;
        }

        .land-form {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .form-grid {
          display: grid;
          gap: 30px;
        }

        .form-section {
          border-bottom: 1px solid #eee;
          padding-bottom: 20px;
        }

        .form-section:last-child {
          border-bottom: none;
        }

        .form-section h3 {
          color: #3498db;
          margin-bottom: 20px;
          border-bottom: 2px solid #3498db;
          padding-bottom: 5px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #2c3e50;
        }

        input, textarea, select {
          width: 100%;
          padding: 12px;
          border: 2px solid #ddd;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.3s ease;
        }

        input:focus, textarea:focus, select:focus {
          outline: none;
          border-color: #3498db;
        }

        textarea {
          resize: vertical;
          min-height: 100px;
        }

        .map-section {
          grid-column: 1 / -1;
        }

        .map-container {
          margin-bottom: 20px;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .coordinates-display {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #dee2e6;
        }

        .coordinates-display p {
          margin: 5px 0;
          font-family: monospace;
          color: #495057;
        }

        .error-message {
          background: #f8d7da;
          color: #721c24;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          border: 1px solid #f5c6cb;
        }

        .form-actions {
          display: flex;
          gap: 15px;
          justify-content: flex-end;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }

        .btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
          text-decoration: none;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-primary {
          background: #3498db;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #2980b9;
        }

        .btn-secondary {
          background: #95a5a6;
          color: white;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #7f8c8d;
        }

        .btn-outline {
          border: 2px solid #3498db;
          color: #3498db;
          background: #f8fff8;
          border-radius: 8px;
          padding: 8px 18px;
          font-weight: 500;
          transition: background 0.2s, color 0.2s;
        }

        .btn-outline:hover:not(:disabled) {
          background: #3498db;
          color: #fff;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }

          .form-actions {
            flex-direction: column;
          }

          .land-form {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default AddLand; 