import React, { useState, useEffect } from 'react';
import ApplicantForm from '../views/ApplicantView';

const ApplicantFormPresenter = () => {
  const [competences, setCompetences] = useState([]);

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
