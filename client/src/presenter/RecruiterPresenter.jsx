import React, { useState, useEffect } from 'react';
import RecruiterView from '../views/RecruiterView';
import { useNavigate } from 'react-router-dom';
import { createAuthHeaders, isRecruiter } from '../util/auth';

/**
 * The RecruiterPresenter component handles fetching and updating applications.
 * It manages application data and communicates with the RecruiterView component.
 * 
 * @component
 */
const RecruiterPresenter = () => {
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState('');
  const [showApplications, setShowApplications] = useState(false); 
  const navigate = useNavigate();

  // Check if user is authenticated and is a recruiter
  useEffect(() => {
    if (!isRecruiter()) {
      navigate('/');
    }
  }, [navigate]);

  /**
   * Fetches applications from the backend and updates the state accordingly.
   * Includes JWT token in the request header.
   * If fetching fails, it sets an error message.
   */
  const fetchApplications = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/applications/fetch`, 
        { headers: createAuthHeaders() }
      );
       // Handle authentication errors
       if (response.status === 401 || response.status === 403) {
        navigate('/');
        return;
      }

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

  /**
   * Updates the status of a specific job application.
   * Includes JWT token in the request header.
   * 
   * @param {number} applicationId - The ID of the application to update.
   * @param {string} newStatus - The new status of the application.
   * @param {string} lastUpdated - The timestamp of the last update.
   * @param {function} setSelectedApplication - Function to update the selected application state.
   * @param {function} setMessage - Function to set a success or error message.
   */
  const updateApplicationStatus = async (applicationId, newStatus, lastUpdated, setSelectedApplication, setMessage) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/applications/update`, {
            method: 'POST',
            headers: createAuthHeaders(),
            body: JSON.stringify({
                application_id: applicationId,
                status: newStatus,
                lastUpdated: lastUpdated, 
            }),
        });

        // Handle authentication errors
      if (response.status === 401 || response.status === 403) {
        navigate('/');
        return;
      }

        const data = await response.json();

        if (response.ok) {
            setMessage({ type: 'success', text: 'Application status updated successfully' });
            setSelectedApplication((prev) => ({ ...prev, application_status: newStatus }));

            setApplications((prevApplications) =>
                prevApplications.map((app) =>
                    app.application_id === applicationId ? { ...app, application_status: newStatus } : app
                )
            );
        } else {
            setMessage({ type: 'error', text: data.message || 'Error updating application status' });
        }
    } catch (err) {
        console.error('Error in updating application status:', err);
        setMessage({ type: 'error', text: 'Error updating application status' });
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