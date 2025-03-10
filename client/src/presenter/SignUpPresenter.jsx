import React, { useState } from 'react';
import SignUpView from '../views/SignUpView';
import { useTranslation } from 'react-i18next';

/**
 * Presenter component for handling sign-up logic and backend integration.
 * 
 * @param {Object} props Component properties
 * @param {Function} props.onSignUpSuccess Callback function for successful sign-up
 * @returns {React.ReactElement} Renders the SignUp view with necessary handlers
 */
const SignUpPresenter = ({ onSignUpSuccess }) => {
  const { t } = useTranslation();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Map backend error codes to user-friendly messages.
   */
  const errorMessages = {
    409: {
      default: t('signup.error.email_exists'),
      USERNAME_TAKEN: t('signup.error.username_taken')
    },
    400: {
      INVALID_EMAIL: t('signup.error.invalid_email'),
      INVALID_PNR: t('signup.error.invalid_person_number'),
      MISSING_FIELDS: t('signup.error.missing_fields')
    },
    500: t('signup.error.server_error')
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
        throw new Error(t('signup.error.no_internet'));
      }

      const endpoint = `${import.meta.env.VITE_BACKEND_URL}/users/signup`;
      console.log(`Sending POST to ${endpoint} for user ${userData.username}`);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = 
          errorMessages[response.status]?.[data.code] || 
          errorMessages[response.status]?.default ||
          data.message ||
          t('signup.error.server_error');

        console.log(response.status);
        throw new Error(errorMessage);
      }

      setSuccess(true);
      onSignUpSuccess();

    } catch (err) {
      setSuccess(false);
      if (err.name === 'AbortError') {
        setError(t('signup.error.request_timeout'));
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
