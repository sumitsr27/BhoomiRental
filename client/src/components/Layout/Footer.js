import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Village Farming</h3>
          <p>Connecting villagers with farmers for sustainable land rental and agricultural development.</p>
          <div className="social-links">
            <a href="#" className="social-link">
              <FaFacebook />
            </a>
            <a href="#" className="social-link">
              <FaTwitter />
            </a>
            <a href="#" className="social-link">
              <FaInstagram />
            </a>
            <a href="#" className="social-link">
              <FaLinkedin />
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/lands">Available Lands</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Services</h4>
          <ul className="footer-links">
            <li><Link to="/lands">Land Rental</Link></li>
            <li><Link to="/chat">Farming Support</Link></li>
            <li><Link to="/agreements">Legal Agreements</Link></li>
            <li><Link to="/verification">Land Verification</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contact Info</h4>
          <div className="contact-info">
            <div className="contact-item">
              <FaPhone />
              <span>+91 98765 43210</span>
            </div>
            <div className="contact-item">
              <FaEnvelope />
              <span>info@villagefarming.com</span>
            </div>
            <div className="contact-item">
              <FaMapMarkerAlt />
              <span>Village Farming Hub, Rural India</span>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p>&copy; 2024 Village Farming. All rights reserved.</p>
          <div className="footer-bottom-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 