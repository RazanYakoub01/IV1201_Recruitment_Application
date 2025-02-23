import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RestoreView from '../views/RestoreView';

/**
 * The RestorePresenter component handles restoring user credentials.
 * It manages user data and communicates with the RestoreView component.
 * 
 * @component
 */
const RestorePresenter = () => {
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  /**
   * Verifies if the personal number exists in the database.
   * @param {string} personNumber - The personal number entered by the user
   * @returns {boolean} - Returns true if verification is successful
   */
  const handleVerify = async (personNumber) => {
    setError('');
    setSuccessMessage('');

    try {
      console.log('Verifying person number:', { personNumber });
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/verify-person-number`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personNumber })
      });

      const data = await response.json();
      if (!response.ok) {
        switch (response.status) {
          case 400:
            throw new Error('Invalid personal number format');
          case 404:
            throw new Error('Personal number not found');
          default:
            throw new Error(data.message || 'Verification failed');
        }
      }

      setSuccessMessage('Personal number verified successfully.');
      return true;

    } catch (err) {
      console.error('Verification error:', err);
      if (err.name === 'AbortError') {
        setError('Request timed out. Please try again.');
      } else {
        setError(err.message || 'Server error. Please try again later.');
      }
      return false;
    }
  };

  /**
   * Handles restoring username and password.
   * @param {string} personNumber - The verified personal number
   * @param {string} username - The new username
   * @param {string} newPassword - The new password
   */
  const handleRestore = async (personNumber, username, newPassword) => {
    setError('');
    setSuccessMessage('');

    console.log('personNumber:', personNumber, 'userName:', username, 'password:', newPassword);

    try {
      console.log('Updating credentials for:', { 
        personNumber, 
        username,
        timestamp: new Date().toISOString()
      });

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/update-credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personNumber, username, newPassword })
      });

      const data = await response.json();
      if (!response.ok) {
        switch (response.status) {
          case 409:
            throw new Error('Username is already taken');
          case 400:
            throw new Error(data.message || 'Invalid input');
          default:
            throw new Error('Failed to update credentials');
        }
      }

      setSuccessMessage('Credentials updated successfully. Redirecting to login...');
      setTimeout(() => navigate('/'), 3000);

    } catch (err) {
      console.error('Restore error:', err);
      if (err.name === 'AbortError') {
        setError('Request timed out. Please try again.');
      } else {
        setError(err.message);
      }
    }
  };

  return (
    <RestoreView
      onVerify={handleVerify}
      onRestore={handleRestore}
      error={error}
      successMessage={successMessage}
    />
  );
};

export default RestorePresenter;
