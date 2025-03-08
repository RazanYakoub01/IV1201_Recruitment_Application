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
        console.error('Error parsing user:', e);
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
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Applications fetched:', data);
      if (data && Array.isArray(data)) {
        setApplications(data);
        setShowApplications(true);
        console.log('Applications state updated:', data.length, 'applications');
      } else if (data && data.applications && Array.isArray(data.applications)) {
        setApplications(data.applications);
        setShowApplications(true);
        console.log('Applications state updated:', data.applications.length, 'applications');
      } else {
        console.error('Unexpected data format:', data);
        setError('Received unexpected data format from server');
      }
      
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load applications. Please try again later.');
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