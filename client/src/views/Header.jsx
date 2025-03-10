import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/Header.css';
import { logout } from '../util/auth';

const Header = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
  };

  const showNavigation = location.pathname !== '/' && location.pathname !== '/signup' && location.pathname !== '/restore';

  return (
    <header className="header">
      <div className="header-container">
        <h1 className="header-title">{t('header.title')}</h1>
        <div className="language-switcher">
          <label htmlFor="language-select" className="language-label">{t('language_switcher.choose_language')}</label>
          <select id="language-select" className="language-select" onChange={(e) => changeLanguage(e.target.value)}>
            <option value="en">English</option>
            <option value="sv">Svenska</option>
            <option value="es">Español</option>
          </select>
        </div>
        {showNavigation && (
          <nav>
            <button onClick={handleLogout} className="logout-button">
              {t('header.logout')}
            </button>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;