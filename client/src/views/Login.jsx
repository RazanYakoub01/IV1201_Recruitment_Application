import React from 'react';
import './Login.css';

/**
 * Login view component that provides the user interface for the login form.
 * This component is responsible only for rendering the UI and handling direct user interactions.
 * 
 * @param {Object} props Component properties
 * @param {Function} props.onLogin Callback function to handle login submission
 * @param {string} props.error Error message to display if login fails
 * @returns {React.ReactElement} Renders the login form with username and password fields
 */
const Login = ({ onLogin, error }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;
    onLogin(username, password);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Sign in to your account</h2>
        
        {error && (
          <div className="error-message">{error}</div>
        )}
        
        <form className="form-group" onSubmit={handleSubmit}>
          <div>
            <label className="input-label" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="input-field"
            />
          </div>
          
          <div className="mt-4">
            <label className="input-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="input-field"
            />
          </div>

          <div className="mt-6">
            <button type="submit" className="submit-button">
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;