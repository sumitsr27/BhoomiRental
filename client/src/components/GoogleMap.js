import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const defaultCenter = {
  lat: 20.5937, // India center
  lng: 78.9629
};

const GoogleMapComponent = ({ 
  center = defaultCenter, 
  zoom = 10, 
  markers = [], 
  onMapClick = null,
  onMarkerClick = null,
  height = '400px',
  width = '100%'
}) => {
  const [selectedMarker, setSelectedMarker] = useState(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE'
  });

  const onLoad = useCallback(() => {}, []);
  const onUnmount = useCallback(() => {}, []);

  const handleMapClick = useCallback((event) => {
    if (onMapClick) {
      onMapClick({
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      });
    }
  }, [onMapClick]);

  const handleMarkerClick = useCallback((marker) => {
    setSelectedMarker(marker);
    if (onMarkerClick) {
      onMarkerClick(marker);
    }
  }, [onMarkerClick]);

  if (!isLoaded) {
    return (
      <div style={{ 
        width, 
        height, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        border: '1px solid #ddd',
        borderRadius: '8px'
      }}>
        <div>Loading map...</div>
      </div>
    );
  }

  return (
    <div style={{ width, height }}>
      <GoogleMap
        mapContainerStyle={{ ...containerStyle, height }}
        center={center}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleMapClick}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: true,
          fullscreenControl: true,
        }}
      >
        {markers.map((marker, index) => (
          <Marker
            key={index}
            position={{ lat: marker.lat, lng: marker.lng }}
            onClick={() => handleMarkerClick(marker)}
            title={marker.title || `Marker ${index + 1}`}
          />
        ))}

        {selectedMarker && (
          <InfoWindow
            position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div>
              <h3>{selectedMarker.title || 'Location'}</h3>
              {selectedMarker.description && (
                <p>{selectedMarker.description}</p>
              )}
              {selectedMarker.price && (
                <p><strong>Price:</strong> ₹{selectedMarker.price}/acre</p>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default GoogleMapComponent; 