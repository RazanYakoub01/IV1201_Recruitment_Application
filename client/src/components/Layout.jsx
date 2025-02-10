import React from 'react';
import Header from '../views/Header';
import Footer from '../views/Footer';
import '../styles/Layout.css';

/**
* Layout component providing the application's base structure.
* Wraps all pages with common header and footer components.
* 
* @component
* @param {Object} props Component properties
* @param {React.ReactNode} props.children Main content to be rendered
* @param {boolean} [props.showHeader=true] Controls header visibility
* @returns {React.ReactElement} Renders the page layout with header, main content, and footer
*/

const Layout = ({ children, showHeader = true }) => {
  return (
    <div className="layout">
      {showHeader && <Header />}
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;