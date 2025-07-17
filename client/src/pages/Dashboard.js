import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkedAlt, FaPlus, FaComments, FaUser, FaSignOutAlt } from 'react-icons/fa';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <div className="header-content">
            <h1>Dashboard</h1>
            <button onClick={handleLogout} className="btn btn-secondary">
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
        
        <div className="user-welcome">
          <div className="user-info">
            <div className="user-avatar">
              <FaUser />
            </div>
            <div className="user-details">
              <h2>Welcome back, {user?.name}!</h2>
              <p className="user-type">{user?.userType === 'farmer' ? 'Farmer' : 'Land Owner'}</p>
              <p className="user-email">{user?.email}</p>
              {user?.phone && <p className="user-phone">{user?.phone}</p>}
            </div>
          </div>
        </div>

        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="action-grid">
            <div className="action-card" onClick={() => handleNavigation('/lands')}>
              <div className="action-icon">
                <FaMapMarkedAlt />
              </div>
              <h4>Browse Lands</h4>
              <p>Find available agricultural lands for rent</p>
            </div>

            {user?.userType === 'landowner' && (
              <div className="action-card" onClick={() => handleNavigation('/add-land')}>
                <div className="action-icon">
                  <FaPlus />
                </div>
                <h4>Add Land</h4>
                <p>List your agricultural land for rent</p>
              </div>
            )}

            <div className="action-card" onClick={() => handleNavigation('/chat')}>
              <div className="action-icon">
                <FaComments />
              </div>
              <h4>Messages</h4>
              <p>Chat with landowners and farmers</p>
            </div>

            <div className="action-card" onClick={() => handleNavigation('/profile')}>
              <div className="action-icon">
                <FaUser />
              </div>
              <h4>Profile</h4>
              <p>Update your profile and settings</p>
            </div>
          </div>
        </div>

        <div className="dashboard-stats">
          <h3>Your Statistics</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <h4>Total Lands</h4>
              <div className="stat-value">0</div>
              <p>Lands you've listed</p>
            </div>
            <div className="stat-card">
              <h4>Active Rentals</h4>
              <div className="stat-value">0</div>
              <p>Current rental agreements</p>
            </div>
            <div className="stat-card">
              <h4>Messages</h4>
              <div className="stat-value">0</div>
              <p>Unread messages</p>
            </div>
            <div className="stat-card">
              <h4>Earnings</h4>
              <div className="stat-value">₹0</div>
              <p>Total earnings this month</p>
            </div>
          </div>
        </div>

        <div className="recent-activity">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">
                <FaUser />
              </div>
              <div className="activity-content">
                <p>Welcome to Village Farming Platform!</p>
                <span className="activity-time">Just now</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard-page {
          padding: 20px 0;
        }

        .dashboard-header {
          background: white;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 30px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-content h1 {
          color: #2c3e50;
          margin: 0;
        }

        .user-welcome {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          padding: 30px;
          margin-bottom: 30px;
          color: white;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .user-avatar {
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
        }

        .user-details h2 {
          margin: 0 0 5px 0;
          font-size: 24px;
        }

        .user-type {
          background: rgba(255, 255, 255, 0.2);
          padding: 5px 15px;
          border-radius: 20px;
          display: inline-block;
          margin: 5px 0;
          font-size: 14px;
        }

        .user-email, .user-phone {
          margin: 5px 0;
          opacity: 0.9;
        }

        .quick-actions {
          background: white;
          border-radius: 12px;
          padding: 30px;
          margin-bottom: 30px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .quick-actions h3 {
          color: #2c3e50;
          margin-bottom: 20px;
        }

        .action-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .action-card {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 25px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }

        .action-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
          border-color: #3498db;
        }

        .action-icon {
          width: 60px;
          height: 60px;
          background: #3498db;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 15px;
          font-size: 24px;
          color: white;
        }

        .action-card h4 {
          color: #2c3e50;
          margin: 0 0 10px 0;
        }

        .action-card p {
          color: #666;
          margin: 0;
          font-size: 14px;
        }

        .dashboard-stats {
          background: white;
          border-radius: 12px;
          padding: 30px;
          margin-bottom: 30px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .dashboard-stats h3 {
          color: #2c3e50;
          margin-bottom: 20px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .stat-card {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
        }

        .stat-card h4 {
          color: #666;
          margin: 0 0 10px 0;
          font-size: 14px;
        }

        .stat-value {
          font-size: 32px;
          font-weight: bold;
          color: #3498db;
          margin-bottom: 5px;
        }

        .stat-card p {
          color: #666;
          margin: 0;
          font-size: 12px;
        }

        .recent-activity {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .recent-activity h3 {
          color: #2c3e50;
          margin-bottom: 20px;
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px 0;
          border-bottom: 1px solid #eee;
        }

        .activity-item:last-child {
          border-bottom: none;
        }

        .activity-icon {
          width: 40px;
          height: 40px;
          background: #3498db;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 16px;
        }

        .activity-content p {
          margin: 0 0 5px 0;
          color: #2c3e50;
        }

        .activity-time {
          color: #666;
          font-size: 12px;
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

        .btn-secondary {
          background: #95a5a6;
          color: white;
        }

        .btn-secondary:hover {
          background: #7f8c8d;
        }

        @media (max-width: 768px) {
          .user-info {
            flex-direction: column;
            text-align: center;
          }

          .action-grid {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .header-content {
            flex-direction: column;
            gap: 15px;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard; 