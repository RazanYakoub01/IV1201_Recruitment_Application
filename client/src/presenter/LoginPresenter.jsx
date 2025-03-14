import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Login from '../views/Login';
import { setAuthToken, setCurrentUser } from '../util/auth';

/**
 * Presenter component for handling login business logic and state management.
 * 
 * @param {Object} props Component properties
 * @param {Function} props.onLoginSuccess Callback function to handle successful login
 * @returns {React.ReactElement} Renders the Login view component with necessary handlers
 */
const LoginPresenter = ({ onLoginSuccess }) => {
  const { t } = useTranslation();
  const [error, setError] = useState('');
  const navigate = useNavigate(); 

  /**
   * Handles the login process when user submits credentials
   * @param {string} username - The username entered by the user
   * @param {string} password - The password entered by the user
   */
  const handleLogin = async (username, password) => {
    setError('');
    try {
      let endpoint = `${import.meta.env.VITE_BACKEND_URL}/users/login`;
      console.log(`Sending POST to ${endpoint} for user ${username}`);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();

      if (!response.ok) {
        switch (response.status) {
          case 400:
            throw new Error(t('login.error.required_username'));
          case 401:
            throw new Error(t('login.error.invalid_credentials'));
          case 500:
            throw new Error(t('login.error.server_error'));
          default:
            throw new Error(data.message || t('login.error.login_failed'));
        }
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setAuthToken(data.token);
      setCurrentUser(data.user);

      if (data.user.role === 1) {
        navigate('/recruiter');
      } else if (data.user.role === 2) {
        navigate('/applicant');
      } else {
        alert(t("login.error.unknown_role"));
      }

      onLoginSuccess(data.user.role); 
    } catch (err) {
      console.error('Login error:', {
        error: err.message,
        timestamp: new Date().toISOString()
      });

      if (err.name === 'AbortError') {
        setError(t('login.error.request_timeout'));
      } else {
        setError(err.message || t('login.error.login_failed'));
      }
    }
  };

  const handleNavigateToSignUp = () => {
    navigate('/signup');
  };

  const handleNavigateToRestore = () => {
    navigate('/restore');
  }

  return <Login onLogin={handleLogin} onNavigateToSignUp={handleNavigateToSignUp} onNavigateToRestore={handleNavigateToRestore} error={error} />;
};

export default LoginPresenter;
