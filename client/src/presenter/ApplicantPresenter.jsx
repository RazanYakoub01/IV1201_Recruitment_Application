import React, { useState, useEffect } from 'react';
import ApplicantForm from '../views/ApplicantView';

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

  /**
   * Fetches a list of competences from the backend when the component mounts.
   * Updates the state with the retrieved competences.
   */
  useEffect(() => {
    const fetchCompetences = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/competences`);
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
  }, []);

  /**
   * Handles the submission of an application.
   * 
   * @param {number} userId - The ID of the applicant.
   * @param {Array} expertise - List of competences and expertise levels.
   * @param {Array} availability - List of available time periods.
   */
  const handleSubmit = async (userId, expertise, availability) => {
    try {
      const formattedExpertise = expertise.map(item => ({
        competence_id: Number(item.competence_id),
        years_of_experience: Number(item.years_of_experience)
      }));
  
      console.log('Formatted expertise data:', formattedExpertise);

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/applications/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, expertise: formattedExpertise, availability }),
      });

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

      } else {
        setError(data.message || 'Error submitting application');
      }
    } catch (err) {
      setError('Error submitting application');
    }
  };

  return (
    <ApplicantForm competences={competences} onSubmit={handleSubmit} />
  );
};

export default ApplicantFormPresenter;