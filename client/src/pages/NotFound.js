import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="container">
      <div className="card text-center">
        <h1>404 - Page Not Found</h1>
        <p className="mt-20 mb-20">
          The page you are looking for does not exist.
        </p>
        <Link to="/" className="btn btn-primary">
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound; 