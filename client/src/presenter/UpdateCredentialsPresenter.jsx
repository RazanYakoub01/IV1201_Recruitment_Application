import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import UpdateCredentialsView from '../views/UpdateCredentialsView';

/**
 * UpdateCredentialsPresenter handles the logic for updating user credentials
 * after verifying the provided token.
 *
 * @component
 */
const UpdateCredentialsPresenter = () => {
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  /**
   * useEffect hook to check if the token is valid.
   * If missing or invalid, an error message is displayed.
   */
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('Invalid or missing token.');
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/validate-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Token validation failed.');
        }

        // Token is valid, proceed with any further actions!
      } catch (err) {
        setError(err.message || 'Failed to validate token.');
      }
    };

    validateToken();
  }, [token]);

  /**
   * Handles updating user credentials by sending a request to the backend.
   *
   * @param {string} username - The new username.
   * @param {string} newPassword - The new password.
   * @returns {Promise<void>}
   */
  const handleUpdateCredentials = async (username, newPassword) => {
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/update-credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, username, newPassword }),
      });

      if (!response.ok) throw new Error('Failed to update credentials');

      setSuccessMessage('Credentials updated successfully! Redirecting...');
      setTimeout(() => navigate('/'), 3000);

    } catch (err) {
      setError(err.message || 'Failed to update credentials.');
    }
  };

  return <UpdateCredentialsView onUpdate={handleUpdateCredentials} error={error} successMessage={successMessage} />;
};

export default UpdateCredentialsPresenter;
