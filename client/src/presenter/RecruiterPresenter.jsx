import React, { useState, useEffect } from 'react';
import RecruiterView from '../views/RecruiterView';
import { useNavigate } from 'react-router-dom';
import { createAuthHeaders } from '../util/auth';
import { useTranslation } from 'react-i18next';

/**
 * The RecruiterPresenter component handles fetching and updating applications.
 * It manages application data and communicates with the RecruiterView component.
 * 
 * @component
 */
const RecruiterPresenter = () => {
  const { t } = useTranslation(); // Use translation hook
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState('');
  const [showApplications, setShowApplications] = useState(false);
  const [user, setUser] = useState(null);
  const [accessError, setAccessError] = useState(false);
  
  const navigate = useNavigate();

  // Check authentication and authorization on component mount
  useEffect(() => {
    // Try to get user from localStorage (for JWT implementation)
    const storedUser = localStorage.getItem('user');
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        
        if (parsedUser.role !== 1) {
          setAccessError(true);
        }
      } catch (e) {
        console.error(t('recruiter.error.parsing_user'), e);
        setUser(null);
      }
    }
    
  }, []);

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
      
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('user'); 
        setUser(null);
        return;
      }
      
      if (!response.ok) {
        throw new Error(t('recruiter.error.fetch_failed', { statusText: response.statusText }));
      }
      
      const data = await response.json();
      console.log(t('recruiter.log.applications_fetched'), data);
      if (data && Array.isArray(data)) {
        setApplications(data);
        setShowApplications(true);
        console.log(t('recruiter.log.applications_updated', { count: data.length }));
      } else if (data && data.applications && Array.isArray(data.applications)) {
        setApplications(data.applications);
        setShowApplications(true);
        console.log(t('recruiter.log.applications_updated', { count: data.applications.length }));
      } else {
        console.error(t('recruiter.error.unexpected_data_format'), data);
        setError(t('recruiter.error.unexpected_data_format'));
      }
      
    } catch (err) {
      console.error(t('recruiter.error.fetch_error'), err);
      setError(t('recruiter.error.fetch_error'));
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

        const data = await response.json();

        if (response.ok) {
            setMessage({ type: 'success', text: t('recruiter.update_success') });
            setSelectedApplication((prev) => ({ ...prev, application_status: newStatus }));

            setApplications((prevApplications) =>
                prevApplications.map((app) =>
                    app.application_id === applicationId ? { ...app, application_status: newStatus } : app
                )
            );
        } else {
            setMessage({ type: 'error', text: data.message || t('recruiter.update_error') });
        }
      } catch (err) {
        console.error(t('recruiter.error.update_status'), err);
        setMessage({ type: 'error', text: t('recruiter.error.update_status') });   
      }
  };

  return (
    <RecruiterView
      user={user}
      accessError={accessError}
      applications={applications}
      error={error}
      showApplications={showApplications}
      fetchApplications={fetchApplications}
      updateApplicationStatus={updateApplicationStatus}
    />
  );
};

export default RecruiterPresenter;
