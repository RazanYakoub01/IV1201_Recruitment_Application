import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import UpdateCredentialsView from '../views/UpdateCredentialsView';

const UpdateCredentialsPresenter = () => {
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing token.');
    }
  }, [token]);

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
