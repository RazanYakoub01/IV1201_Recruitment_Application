import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Header.css';
import { logout } from '../util/auth';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    logout();
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