import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FaUser, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import './Header.css';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <h1>Village Farming</h1>
        </Link>

        <nav className={`nav ${isMobileMenuOpen ? 'nav-open' : ''}`}>
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/lands" className="nav-link">Available Lands</Link>
          {user && (
            <>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/chat" className="nav-link">Chat</Link>
            </>
          )}
          <Link to="/about" className="nav-link">About</Link>
        </nav>

        <div className="header-actions">
          {user ? (
            <div className="user-menu">
              <button className="user-menu-btn">
                <FaUser />
                <span>{user.name}</span>
              </button>
              <div className="user-dropdown">
                <Link to="/profile" className="dropdown-item">Profile</Link>
                <Link to="/my-lands" className="dropdown-item">My Lands</Link>
                <Link to="/my-rentals" className="dropdown-item">My Rentals</Link>
                <button onClick={handleLogout} className="dropdown-item logout-btn">
                  <FaSignOutAlt />
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-outline">Login</Link>
              <Link to="/register" className="btn btn-primary">Register</Link>
            </div>
          )}

          <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header; 