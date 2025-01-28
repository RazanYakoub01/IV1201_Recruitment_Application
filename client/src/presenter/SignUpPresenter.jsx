import React, { useState } from 'react';
import SignUp from '../views/signUp';

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

  /**
   * Handles sign-up by sending user data to the backend.
   * 
   * @param {Object} userData - The user's sign-up data
   */
  const handleSignUp = async (userData) => {
    try {
      const endpoint = `${import.meta.env.VITE_BACKEND_URL}/users/signup`;
      console.log(`Sending POST to ${endpoint} for user ${userData.username}`);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        setError('');
        setSuccess(true);
        onSignUpSuccess();
      } else {
        throw new Error(data.message || 'Sign-up failed');
      }
    } catch (err) {
      setSuccess(false);
      setError(err.message);
    }
  };

  return <SignUp onSignUp={handleSignUp} error={error} success={success} />;
};

export default SignUpPresenter;
