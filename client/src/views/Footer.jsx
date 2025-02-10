import React from 'react';
import '../styles/Footer.css';

/**
* Footer component for displaying site-wide footer content.
* 
* @component
* @returns {React.ReactElement} Renders the footer with copyright text
*/

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <p className="footer-text">© 2025 HireFlow. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;