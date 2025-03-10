import React from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/Footer.css';

/**
* Footer component for displaying site-wide footer content.
* 
* @component
* @returns {React.ReactElement} Renders the footer with copyright text
*/

const Footer = () => {
  const { t } = useTranslation();
  
  return (
    <footer className="footer">
      <div className="footer-container">
        <p className="footer-text">{t('footer.copyright')}</p>
      </div>
    </footer>
  );
};

export default Footer;