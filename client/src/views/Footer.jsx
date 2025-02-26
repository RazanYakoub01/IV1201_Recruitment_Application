import React from 'react';
import { useTranslation } from 'react-i18next'; // Import translation hook
import '../styles/Footer.css';

/**
 * Footer component for displaying site-wide footer content.
 *
 * @component
 * @returns {React.ReactElement} Renders the footer with translated copyright text.
 */
const Footer = () => {
  const { t } = useTranslation(); // Initialize translation

  return (
    <footer className="footer">
      <div className="footer-container">
        <p className="footer-text">{t("footer.copyright")}</p> {/* Use translated text */}
      </div>
    </footer>
  );
};

export default Footer;
