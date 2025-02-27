import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css'; // Reusing the same styles

/**
 * Unauthorized view component that displays an error message when a user tries to access
 * a page they don't have permission to view.
 * 
 * @returns {React.ReactElement} Renders the unauthorized message with navigation options
 */
const Unauthorized = () => {
  const navigate = useNavigate();

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Access Denied</h2>
        
        <div className="error-message">
          You don't have permission to access this page.
        </div>
        
        <div className="mt-6">
          <button onClick={handleBackToLogin} className="submit-button">
            Back to Login
          </button>
        </div>
        
        <div className="mt-4">
          <button onClick={handleGoHome} className="submit-button">
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;