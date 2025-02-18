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
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/applications/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, expertise, availability }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('Application submitted successfully');
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