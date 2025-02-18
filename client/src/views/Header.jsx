import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Header.css';

/**
* Header component that provides navigation and user authentication controls.
* This component handles the application header, logout functionality, and conditional navigation display.
* 
* @component
* @param {Object} props Component properties
* @returns {React.ReactElement} Renders the header with title and conditional logout button
* 
* Uses:
* - useNavigate: For navigation after logout
* - useLocation: To determine current route for conditional rendering
* - localStorage: For user authentication state management
*/

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  };

  const showNavigation = location.pathname !== '/' && location.pathname !== '/signup' && location.pathname !== '/restore';

  return (
    <header className="header">
      <div className="header-container">
        <h1 className="header-title">HireFlow</h1>
        {showNavigation && (
          <nav>
            <button
              onClick={handleLogout}
              className="logout-button"
            >
              Logout
            </button>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;