import React from 'react';
import LoginPresenter from './presenter/LoginPresenter';

/**
 * Main application component that currently focuses on the login functionality.
 * Handles different user roles (recruiter/applicant) after successful login.
 * 
 * @returns {React.ReactElement} The main application component
 */
const App = () => {
  /**
   * Handles successful login based on user role
   * @param {string} role - The role of the logged-in user ('recruiter' or 'applicant')
   */
  const handleLoginSuccess = (role) => {
    if (role === 'recruiter') {
      // Handle recruiter login 
      console.log('Recruiter logged in');
      // TODO: Add recruiter-specific logic here
    } else {
      // Handle applicant login
      console.log('Applicant logged in');
      // TODO: Add applicant-specific logic here
    }
  };

  return (
    <div className="App">
      <LoginPresenter onLoginSuccess={handleLoginSuccess} />
    </div>
  );
};

export default App;