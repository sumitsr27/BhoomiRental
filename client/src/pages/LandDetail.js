import React from 'react';
import { useParams } from 'react-router-dom';
import { FaMapMarkedAlt, FaRupeeSign, FaAcre, FaUser, FaPhone, FaEnvelope } from 'react-icons/fa';

const LandDetail = () => {
  const { id } = useParams();

  return (
    <div className="land-detail-page">
      <div className="container">
        <h1>Land Details</h1>
        <p>Land ID: {id}</p>
        <p>This page will show detailed information about the selected land.</p>
      </div>
    </div>
  );
};

export default LandDetail; 