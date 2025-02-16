import React, { useState, useEffect } from 'react';
import RecruiterView from '../views/RecruiterView';

const RecruiterPresenter = () => {
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState('');
  const [showApplications, setShowApplications] = useState(false); 
  const fetchApplications = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/applications/fetch`);
      const data = await response.json();

      if (data.success) {
        setApplications(data.applications);
        setShowApplications(true);  
        setError('');
      } else {
        setError('Error fetching applications');
        setShowApplications(false);  
      }
    } catch (err) {
      setError('Error fetching applications');
      setShowApplications(false);  
    }
  };

  const updateApplicationStatus = async (applicationId, newStatus, lastUpdated, setSelectedApplication) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/applications/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: applicationId,
          status: newStatus,
          lastUpdated: lastUpdated, 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Application status updated successfully');
        setSelectedApplication((prev) => ({ ...prev, application_status: newStatus }));

        setApplications((prevApplications) =>
          prevApplications.map((app) =>
            app.application_id === applicationId ? { ...app, application_status: newStatus } : app
          )
        );
      } else {
        alert(data.message || 'Error updating application status');
      }
    } catch (err) {
      console.error('Error in updating application status:', err);
      alert('Error updating application status');
    }
  };

  return (
    <RecruiterView
      applications={applications}
      error={error}
      showApplications={showApplications}  
      fetchApplications={fetchApplications}  
      updateApplicationStatus={updateApplicationStatus}
    />
  );
};

export default RecruiterPresenter;
