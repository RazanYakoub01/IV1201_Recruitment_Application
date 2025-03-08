import React, { useState } from 'react';
import RestoreView from '../views/RestoreView';

/**
 * RestorePresenter handles the logic for verifying a user's email
 * and sending an update credentials email.
 *
 * @component
 */
const RestorePresenter = () => {
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [emailContent, setEmailContent] = useState('');

  /**
   * Handles email verification by sending a request to the backend.
   *
   * @param {string} email - The email address to verify.
   * @returns {Promise<void>}
   */
  const handleVerifyEmail = async (email) => {
    setError('');
    setSuccessMessage('');
    setEmailContent('');

    try {
      console.log('Verifying email:', email);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      if (!response.ok) {
        switch (response.status) {
          case 400:
            throw new Error('Invalid email format');
          case 404:
            throw new Error('Email not found');
          default:
            throw new Error(data.message || 'Verification failed');
        }
      }

      setSuccessMessage('Email verified successfully. Sending update link...');
      sendUpdateEmail(email);
    } catch (err) {
      console.error('Verification error:', err);
      setError(err.message || 'Server error. Please try again later.');
    }
  };

  /**
   * Sends an email containing an update credentials link.
   *
   * @param {string} email - The email address to send the update credentials email.
   * @returns {Promise<void>}
   */
  const sendUpdateEmail = async (email) => {
    setError(''); 
    setSuccessMessage(''); 
    setEmailContent('');
  
    try {
      console.log('Sending update credentials email to:', email);
  
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/send-update-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate update email.');
      }
  
      setSuccessMessage('Email verified successfully and a link to restore your credentials was sent!');
      setEmailContent(data.emailText);
  
    } catch (err) {
      console.error('Email sending error:', err);
      setError(err.message || 'Failed to generate update email.');
    }
  };

  return (
    <RestoreView
      onVerify={handleVerifyEmail}
      error={error}
      successMessage={successMessage}
      emailContent={emailContent}
    />
  );
};

export default RestorePresenter;
