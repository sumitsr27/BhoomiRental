import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaTree, FaMapMarkedAlt, FaRupeeSign, FaRobot, FaTimes } from 'react-icons/fa';
import Chatbot from './Chatbot';
import FieldCard from '../components/FieldCard';

const featuredFields = [
  {
    id: 1,
    title: 'Green Acres Farm',
    location: 'Village A, Maharashtra',
    price: 15000,
    acres: 3,
    icon: <FaTree color="#27ae60" />,
  },
  {
    id: 2,
    title: 'Sunny Fields',
    location: 'Village B, Maharashtra',
    price: 18000,
    acres: 5,
    icon: <FaTree color="#f1c40f" />,
  },
  {
    id: 3,
    title: 'Golden Harvest Land',
    location: 'Village C, Maharashtra',
    price: 22000,
    acres: 8,
    icon: <FaTree color="#e67e22" />,
  },
  {
    id: 4,
    title: 'Organic Valley Farm',
    location: 'Village D, Maharashtra',
    price: 25000,
    acres: 4,
    icon: <FaTree color="#2ecc71" />,
  },
];

const Home = () => {
  const [showChatbot, setShowChatbot] = useState(false);
  return (
    <div className="container home-page" style={{ position: 'relative', zIndex: 1 }}>
      {/* Animated Field Background */}
      <div className="animated-field-bg"></div>
      <div className="card text-center home-hero">
        <h1>Welcome to Village Farming Platform</h1>
        <p className="mt-20 mb-20">
          Connect villagers with farmers for land rental and agricultural opportunities.
        </p>
        <div>
          <Link to="/login" className="btn btn-primary">
            Login
          </Link>
          <Link to="/register" className="btn btn-secondary" style={{ marginLeft: '10px' }}>
            Register
          </Link>
        </div>
      </div>

      {/* Featured Fields Section */}
      <section className="featured-fields-section">
        <h2 className="section-title">Featured Fields for Rent</h2>
        <div className="fields-grid">
          {featuredFields.map(field => (
            <FieldCard
              key={field.id}
              title={field.title}
              location={field.location}
              acres={field.acres}
              price={field.price}
              icon={field.icon}
              // Add more fields if available in the future
              onViewDetails={() => window.location.href = '/lands'}
            />
          ))}
        </div>
      </section>

      {/* Floating Chatbot Button */}
      <button
        className="chatbot-fab"
        onClick={() => setShowChatbot(true)}
        title="Chat with AI Farming Assistant"
      >
        <FaRobot size={28} />
      </button>

      {/* Chatbot Modal */}
      {showChatbot && (
        <div className="chatbot-modal-bg" onClick={() => setShowChatbot(false)}>
          <div className="chatbot-modal" onClick={e => e.stopPropagation()}>
            <button className="chatbot-close" onClick={() => setShowChatbot(false)}><FaTimes /></button>
            <Chatbot />
          </div>
        </div>
      )}

      <style>{`
        .animated-field-bg {
          position: fixed;
          left: 0; right: 0; bottom: 0; height: 220px;
          width: 100vw;
          z-index: 0;
          background: url('https://cdn.pixabay.com/photo/2016/11/29/09/32/agriculture-1867314_1280.jpg') repeat-x bottom/cover;
          animation: moveField 40s linear infinite;
          opacity: 0.25;
        }
        @keyframes moveField {
          0% { background-position-x: 0; }
          100% { background-position-x: -1200px; }
        }
        .chatbot-fab {
          position: fixed;
          bottom: 32px;
          right: 32px;
          background: #764ba2;
          color: #fff;
          border: none;
          border-radius: 50%;
          width: 60px;
          height: 60px;
          box-shadow: 0 4px 16px rgba(102, 126, 234, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          cursor: pointer;
          z-index: 1001;
          transition: background 0.2s;
        }
        .chatbot-fab:hover {
          background: #667eea;
        }
        .chatbot-modal-bg {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.3);
          z-index: 1002;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .chatbot-modal {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(44, 62, 80, 0.18);
          padding: 0;
          max-width: 420px;
          width: 100vw;
          min-height: 480px;
          position: relative;
          overflow: hidden;
        }
        .chatbot-close {
          position: absolute;
          top: 8px;
          right: 8px;
          background: transparent;
          border: none;
          font-size: 1.5rem;
          color: #764ba2;
          cursor: pointer;
          z-index: 10;
        }
      `}</style>
    </div>
  );
};

export default Home; 