import React, { useState } from 'react';
import { FaUserCircle } from 'react-icons/fa';

const defaultUser = {
  name: 'John Doe',
  email: 'johndoe@example.com',
  phone: '9876543210',
  userType: 'farmer',
  photo: '',
};

const Profile = () => {
  const [user, setUser] = useState(defaultUser);
  const [photo, setPhoto] = useState(user.photo);
  const [preview, setPreview] = useState(user.photo);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePhoto = () => {
    setUser({ ...user, photo: preview });
    setPhoto(preview);
    alert('Profile photo updated!');
  };

  return (
    <div className="profile-page">
      <div className="container">
        <h1>User Profile</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            {preview ? (
              <img src={preview} alt="Profile" style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', border: '2px solid #ccc' }} />
            ) : (
              <FaUserCircle size={120} color="#ccc" />
            )}
            <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ marginTop: '1rem' }} />
            <br />
            <button className="btn btn-primary" style={{ marginTop: '0.5rem' }} onClick={handleSavePhoto} disabled={!preview}>
              Save Photo
            </button>
          </div>
          <div>
            <h2>{user.name}</h2>
            <p><b>Email:</b> {user.email}</p>
            <p><b>Phone:</b> {user.phone}</p>
            <p><b>User Type:</b> {user.userType === 'farmer' ? 'Farmer' : 'Land Owner'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 