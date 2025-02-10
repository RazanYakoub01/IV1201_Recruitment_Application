import React, { useState, useEffect } from 'react';
import RecruiterView from '../views/RecruiterView';

const RecruiterPresenter = () => {
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/applications/fetch`);
        const data = await response.json();

        if (data.success) {
          setApplications(data.applications);
        } else {
          setError('Error fetching applications');
        }
      } catch (err) {
        setError('Error fetching applications');
      }
    };

    fetchApplications();
  }, []);

  return (
    <RecruiterView applications={applications} error={error} />
  );
};

export default RecruiterPresenter;
