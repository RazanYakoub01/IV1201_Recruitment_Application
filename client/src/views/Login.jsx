import React from 'react';
import '../styles/Login.css';

/**
 * Login view component that provides the user interface for the login form.
 * This component is responsible only for rendering the UI and handling direct user interactions.
 * 
 * @param {Object} props Component properties
 * @param {Function} props.onLogin Callback function to handle login submission
 * @param {Function} props.onNavigateToSignUp Callback function to navigate to the Sign Up page
 * @param {string} props.error Error message to display if login fails
 * @returns {React.ReactElement} Renders the login form with username and password fields
 */
const Login = ({ onLogin, onNavigateToSignUp, error }) => {
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

        <div className="signup-redirect">
          <p>Don't have an account?</p>
          <button onClick={onNavigateToSignUp} className="signup-button">
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
