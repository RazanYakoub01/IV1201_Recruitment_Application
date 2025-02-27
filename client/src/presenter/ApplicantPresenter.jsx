import React, { useState, useEffect } from 'react';
import ApplicantForm from '../views/ApplicantView';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, createAuthHeaders, isApplicant } from '../util/auth';

/**
 * The ApplicantFormPresenter component handles fetching competences
 * and submitting job applications. It acts as a bridge between the 
 * ApplicantForm view and backend logic.
 * 
 * @component
 */
const ApplicantFormPresenter = () => {
  const [competences, setCompetences] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  /**
   * Check if user is authenticated and is an applicant
   */
  useEffect(() => {
    if (!isApplicant()) {
      navigate('/');
    }
  }, [navigate]);

  /**
   * Fetches a list of competences from the backend when the component mounts.
   * Updates the state with the retrieved competences.
   */
  useEffect(() => {
    const fetchCompetences = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/competences`, {
          headers: createAuthHeaders()
        });
        
        // If token is invalid or expired, redirect to login
        if (response.status === 401) {
          navigate('/');
          return;
        }
        
        const data = await response.json();
        if (data.success) {
          setCompetences(data.competences);
        } else {
          setError('Error fetching competences');
        }
      } catch (err) {
        setError('Error fetching competences');
      }
    };
    
    fetchCompetences();
  }, [navigate]);

  /**
   * Handles the submission of an application.
   * 
   * @param {number} userId - The ID of the applicant.
   * @param {Array} expertise - List of competences and expertise levels.
   * @param {Array} availability - List of available time periods.
   */
  const handleSubmit = async (userId, expertise, availability) => {
    try {
      const currentUser = getCurrentUser();
      
      if (!currentUser) {
        navigate('/');
        return;
      }
      
      const userId = currentUser.person_id;

      const formattedExpertise = expertise.map(item => ({
        competence_id: Number(item.competence_id),
        years_of_experience: Number(item.years_of_experience)
      }));
  
      console.log('Formatted expertise data:', formattedExpertise);

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/applications/submit`, {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify({ userId, expertise: formattedExpertise, availability }),
      });

      // Handle authentication errors
      if (response.status === 401) {
        navigate('/');
        return;
      }

      console.log('Sending application submission request:', {
        endpoint: `${import.meta.env.VITE_BACKEND_URL}/applications/submit`,
        method: 'POST',
        userId: userId,
        expertiseCount: expertise?.length || 0,
        availabilityCount: availability?.length || 0,
        timestamp: new Date().toISOString()
      });

      const data = await response.json();
      if (response.ok) {

        console.log('Application submission response:', {
          status: response.status,
          success: response.ok,
          data: data,
          timestamp: new Date().toISOString()
        });

        alert('Application submitted successfully');
      } else {
        setError(data.message || 'Error submitting application');
      }
    } catch (err) {
      setError('Error submitting application');
    }
  };

  return (
    <ApplicantForm competences={competences} onSubmit={handleSubmit} error={error}/>
  );
};

export default ApplicantFormPresenter;