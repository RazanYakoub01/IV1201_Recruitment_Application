import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
const Login = ({ onLogin, onNavigateToSignUp, onNavigateToRestore, error }) => {
  const { t } = useTranslation();
  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = (username, password) => {
    const errors = {};
    
    if (!username.trim()) {
      errors.username = t('login.error.required_username');
    }
    
    if (!password.trim()) {
      errors.password = t('login.error.required_password');
    }

    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;

    const errors = validateForm(username, password);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    onLogin(username, password);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">{t('login.title')}</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form className="form-group" onSubmit={handleSubmit}>
          <div>
            <label className="input-label" htmlFor="username">
              {t('login.username')}
            </label>
            <input id="username" name="username" type="text" className="input-field" />
            {validationErrors.username && (
              <span className="error-message">{validationErrors.username}</span>
            )}
          </div>
          
          <div className="mt-4">
            <label className="input-label" htmlFor="password">
              {t('login.password')}
            </label>
            <input id="password" name="password" type="password" className="input-field" />
            {validationErrors.password && (
              <span className="error-message">{validationErrors.password}</span>
            )}
          </div>

          <div className="mt-6">
            <button type="submit" className="submit-button">
              {t('login.sign_in')}
            </button>
          </div>
        </form>

        <div className="signup-redirect">
          <p>{t('login.no_account')}</p>
          <button onClick={onNavigateToSignUp} className="submit-button">
            {t('login.sign_up')}
          </button>

          <button onClick={onNavigateToRestore} className="submit-button">
            {t('login.forgot_password')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
