import React, { useState } from 'react';
import RestoreView from '../views/RestoreView';

const RestorePresenter = () => {
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [emailContent, setEmailContent] = useState('');

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

  const sendUpdateEmail = async (email) => {
    setError(''); // Clear any previous errors
    setSuccessMessage(''); // Clear any previous success messages
    setEmailContent(''); // Clear email content field
  
    try {
      console.log('Sending update credentials email to:', email);
  
      // Make the POST request to the backend to generate the update email text
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/send-update-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate update email.');
      }
  
      // Set the success message
      setSuccessMessage('Update credentials link generated successfully.');
  
      // Set the email content from the backend's response
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
