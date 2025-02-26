import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import '../styles/Header.css';

/**
 * Header component for navigation, logout, and language switching.
 * 
 * @component
 * @returns {React.ReactElement} The header component with internationalized text.
 */
const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation(); // Initialize translation
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  /**
   * Handles user logout, clearing local storage and navigating to login.
   */
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  };

  // Show navigation buttons only if not on the login, signup, or restore page
  const showNavigation = location.pathname !== '/' && location.pathname !== '/signup' && location.pathname !== '/restore';

  return (
    <header className="header">
      <div className="header-container">
        <h1 className="header-title">{t("header.title")}</h1>

        <div className="header-actions">
          {showNavigation && (
            <nav>
              <button
                onClick={handleLogout}
                className="logout-button"
              >
                {t("header.logout")}
              </button>
            </nav>
          )}
          <LanguageSwitcher /> {/* Language Switcher Component */}
        </div>
      </div>
    </header>
  );
};

export default Header;
