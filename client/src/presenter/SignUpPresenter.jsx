import React, { useState } from 'react';
import SignUpView from '../views/SignUpView';

/**
 * Presenter component for handling sign-up logic and backend integration.
 * 
 * @param {Object} props Component properties
 * @param {Function} props.onSignUpSuccess Callback function for successful sign-up
 * @returns {React.ReactElement} Renders the SignUp view with necessary handlers
 */
const SignUpPresenter = ({ onSignUpSuccess }) => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Map backend error codes to user-friendly messages.
   */
  const errorMessages = {
    409: {
      default: 'Username or email already exists',
      USERNAME_TAKEN: 'This username is already taken'
    },
    400: {
      INVALID_EMAIL: 'Please enter a valid email address',
      INVALID_PNR: 'Please enter a valid person number',
      MISSING_FIELDS: 'Please fill in all required fields'
    },
    500: 'Unable to complete registration. Please try again later'
  };

  /**
   * Handles sign-up by sending user data to the backend.
   * 
   * @param {Object} userData - The user's sign-up data
   */
  const handleSignUp = async (userData) => {
    setIsLoading(true);
    setError('');

    try {
      if (!navigator.onLine) {
        throw new Error('No internet connection');
      }

      const endpoint = `${import.meta.env.VITE_BACKEND_URL}/users/signup`;
      console.log(`Sending POST to ${endpoint} for user ${userData.username}`);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
        signal: AbortSignal.timeout(10000)
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = 
          errorMessages[response.status]?.[data.code] || 
          errorMessages[response.status]?.default ||
          data.message ||
          'Registration failed';
        console.log(response.status);
        throw new Error(errorMessage);
      }

      setSuccess(true);
      onSignUpSuccess();

      } catch (err) {
        setSuccess(false);
        if (err.name === 'AbortError') {
          setError('Request timed out. Please try again.');
        } else {
          setError(err.message);
        }
        console.error('SignUp Error:', {
          error: err.message,
          userData: { ...userData, password: '[REDACTED]' }
        });
      } finally {
        setIsLoading(false);
      }
  };

  return <SignUpView onSignUp={handleSignUp} error={error} success={success} />;
};

export default SignUpPresenter;
