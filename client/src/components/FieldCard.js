import React from 'react';
import { FaMapMarkedAlt, FaRupeeSign, FaTree, FaUser, FaTint } from 'react-icons/fa';

const FieldCard = ({
  title,
  location,
  acres,
  price,
  description,
  soilType,
  waterSource,
  owner,
  icon,
  onViewDetails,
}) => (
  <div className="field-card">
    <div className="field-icon">{icon || <FaTree color="#27ae60" />}</div>
    <h3 className="field-title">{title}</h3>
    <div className="field-location">
      <FaMapMarkedAlt style={{ marginRight: 6, color: '#3498db' }} />
      {location}
    </div>
    <div className="field-details">
      <span className="field-acres">{acres} acres</span>
      <span className="field-price">
        <FaRupeeSign style={{ marginRight: 2 }} />{price?.toLocaleString()}/acre
      </span>
    </div>
    {description && <p className="field-description">{description}</p>}
    <div className="field-extra-details">
      {soilType && (
        <span className="field-soil"><FaTree style={{ marginRight: 4 }} />Soil: {soilType}</span>
      )}
      {waterSource && (
        <span className="field-water"><FaTint style={{ marginRight: 4 }} />Water: {waterSource}</span>
      )}
      {owner && (
        <span className="field-owner"><FaUser style={{ marginRight: 4 }} />Owner: {owner}</span>
      )}
    </div>
    <button className="btn btn-outline field-btn" onClick={onViewDetails}>View Details</button>
  </div>
);

export default FieldCard; 