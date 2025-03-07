import React, { useState, useEffect } from 'react';
import '../styles/Applicant.css';

/**
 * ApplicantForm Component
 * 
 * This component handles the job application process, allowing users to select their area of expertise,
 * specify years of experience, and define availability periods before submitting their application.
 * 
 * @param {Object} user - The authenticated user object
 * @param {boolean} accessError - Whether the user has access to this page
 * @param {function} onSubmit - Function to handle form submission
 * @param {Array} competences - List of available competences
 * @param {string} error - Error message from the presenter
 */
const ApplicantForm = ({ user, accessError, onSubmit, competences, error: presenterError }) => {
  const [selectedCompetence, setSelectedCompetence] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [expertise, setExpertise] = useState([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [availability, setAvailability] = useState([]);
  const [error, setError] = useState('');
  const [status, setStatus] = useState(null);

  /**
   * useEffect hook to set application status based on user data
   */
  useEffect(() => {
    if (user) {
      setStatus(user.application_status || 'unsent');
    }
  }, [user]);

  /**
   * Adds a selected competence and years of experience to the expertise list.
   */
  const handleAddExpertise = () => {
    if (!selectedCompetence || !yearsOfExperience) {
      setError('Please select a competence and years of experience.');
      return;
    }

    const experience = parseInt(yearsOfExperience, 10);
    if (isNaN(experience) || experience < 0 || experience > 99) {
      setError('Please enter a valid number of years of experience between 0 and 99.');
      return;
    }
  
    setExpertise([ 
      ...expertise,
      { competence_id: selectedCompetence, years_of_experience: yearsOfExperience },
    ]);
    setYearsOfExperience('');
    setError('');
  };

  /**
   * Adds an availability period with a start and end date to the availability list.
   */
  const handleAddAvailability = () => {
    if (!fromDate || !toDate) {
      setError('Please provide both start and end dates.');
      return;
    }

    const today = new Date().toISOString().split('T')[0]; 

    if (new Date(fromDate) < new Date(today) || new Date(toDate) < new Date(today)) {
      setError('Dates cannot be in the past.');
      return;
    }

    if (new Date(fromDate) > new Date(toDate)) {
      setError('From date cannot be later than To date.');
      return;
    }

    setError('');
    setAvailability([...availability, { from_date: fromDate, to_date: toDate }]);
    setFromDate('');
    setToDate('');
  };

  /**
   * Handles form submission, validating inputs and sending data to the onSubmit function.
   */
  const handleSubmit = () => {
    if (user) {
      if (expertise.length === 0 || availability.length === 0) {
        setError('Please add at least one competence and one availability period before submitting.');
        return; 
      }  
      const { person_id } = user;
      onSubmit(person_id, expertise, availability);
      setError('');
      setExpertise([]);
      setAvailability([]);
      setStatus('unhandled');
    } else {
      setError('User not found');
    }
  };

  /**
   * Cancels the form input, resetting all selections.
   */
  const handleCancel = () => {
    setSelectedCompetence('');
    setYearsOfExperience('');
    setExpertise([]);
    setFromDate('');
    setToDate('');
    setAvailability([]);
    setStatus('unsent');
    setError('');
  };

  /**
   * Renders appropriate status messages based on the application's current state.
   * 
   * @returns {JSX.Element} Status message component.
   */
  const renderStatusMessage = () => {
    if (status === 'accepted') {
      return (
        <div className="success-message">
          <h3>Your application has been accepted!</h3>
          <p>We will contact you soon!</p>
        </div>
      );
    } else if (status === 'rejected') {
      return (
        <div className="error-message">
          <h3>Sorry, this time we chose to go with other candidates.</h3>
          <p>We will inform you when the new application period opens up.</p>
        </div>
      );
    } else if (status === 'unhandled' || status === 'Missing Availability' || status === 'Missing Competence') {
      return (
        <div className="success-message">
          <h3>Your application is under review!</h3>
          <p>We are processing your details and will get back to you shortly.</p>
        </div>
      );
    } else {
      return (  
        <div className="error-message">
          <h3>Something went wrong.</h3>
          <p>Please log out and try again. If the issue persists, contact support.</p>
        </div>
      );
    }
  };

  /**
   * Renders an error message if the user is not logged in.
   */
  if (!user) {
    return <div className="error-message">You must be logged in to access this page. Please log in first!</div>;
  }

  /**
   * Renders an error message if the user does not have access to the applicant view.
   */
  if (accessError) {
    return <div className="error-message">You don't have access to this page.</div>;
  }

  return (
    <div className="applicant-container">
      <div className="applicant-box">
        <h2 className="applicant-header">Job Application</h2>

        <h3>Hello, {user.username}!</h3>

        {(error || presenterError) && <div className="error-message"><p>{error || presenterError}</p></div>}

        {status === 'unsent' ? (
          <>
            <div className="expertise-section">
              <h3 className="applicant-title">Select Area of Expertise</h3>
              <div className="applicant-input-group">
                <select
                  className="expertise-dropdown"
                  onChange={(e) => setSelectedCompetence(e.target.value)}
                  value={selectedCompetence}
                >
                  <option value="">Select Expertise</option>
                  {competences.map((competence) => (
                    <option key={competence.competence_id} value={competence.competence_id}>
                      {competence.name}
                    </option>
                  ))}
                </select>

                <input
                  className="expertise-dropdown"
                  type="number"
                  placeholder="Years of Experience"
                  value={yearsOfExperience}
                  onChange={(e) => setYearsOfExperience(e.target.value)}
                />
                <button className="submit-button" onClick={handleAddExpertise}>
                  Add Expertise
                </button>
              </div>
            </div>

            <div className="expertise-list">
              <h3>Your Expertise</h3>
              <ul>
                {expertise.map((expert, idx) => {
                  const competence = competences
                    .map((competence) => {
                      if (competence.competence_id == expert.competence_id) {
                        return competence.name;
                      }
                      return null;
                    })
                    .filter((name) => name !== null);
                  return (
                    <li key={idx}>
                      {competence.length > 0 ? competence[0] : 'Competence not found'}: {expert.years_of_experience} years
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="availability-section">
              <h3 className="applicant-title">Select Availability</h3>
              <div className="applicant-input-group">
                <input
                  className="expertise-dropdown"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
                <input
                  className="expertise-dropdown"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
                <button className="submit-button" onClick={handleAddAvailability}>
                  Add Availability
                </button>
              </div>
            </div>

            <div className="availability-list">
              <h3>Your Availability</h3>
              <ul>
                {availability.map((period, idx) => (
                  <li key={idx}>
                    From: {period.from_date}, To: {period.to_date}
                  </li>
                ))}
              </ul>
            </div>

            <button className="submit-button" onClick={handleSubmit}>
              Submit Application
            </button>
            <button className="cancel-button" onClick={handleCancel}>
              Cancel
            </button>
          </>
        ) : (
          renderStatusMessage()
        )}
      </div>
    </div>
  );
};

export default ApplicantForm;