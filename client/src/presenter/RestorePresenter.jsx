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
  const [showMessage, setShowMessage] = useState(false);
  const navigate = useNavigate();

  /**
   * Verifies if the personal number exists in the database.
   * @param {string} personNumber - The personal number entered by the user
   * @returns {boolean} - Returns true if verification is successful
   */
  const handleVerify = async (personNumber) => {
    setError('');
    setSuccessMessage('');
    setShowMessage(false);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/verify-person-number`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personNumber }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccessMessage('Personal number verified successfully.');
        setShowMessage(true);
        return true;
      } else {
        setError(data.message || 'Verification failed.');
        setShowMessage(true);
        return false;
      }
    } catch (err) {
      setError('Server error. Please try again later.');
      setShowMessage(true);
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
    setShowMessage(false);

    console.log('personNumber:', personNumber, 'userName:', username, 'password:', newPassword);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/update-credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personNumber, username, newPassword }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccessMessage('Your credentials have been updated. You can now log in. You will be sent back to the login page in a few seconds, so please wait.');
        setShowMessage(true);
        setTimeout(() => navigate('/'), 4000);
      } else {
        setError(data.message || 'Failed to update credentials.');
        setShowMessage(true);
      }
    } catch (err) {
      setError('Server error. Please try again later.');
      setShowMessage(true);
    }
  };

  return (
    <RestoreView
      onVerify={handleVerify}
      onRestore={handleRestore}
      error={error}
      successMessage={successMessage}
      showMessage={showMessage}
    />
  );
};

export default RestorePresenter;
