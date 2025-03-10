import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  
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
      setError(t('applicant.error.select_competence'));
      return;
    }

    const experience = parseInt(yearsOfExperience, 10);
    if (isNaN(experience) || experience < 0 || experience > 99) {
      setError(t('applicant.error.valid_experience'));
      return;
    }
  
    setExpertise([...expertise, { competence_id: selectedCompetence, years_of_experience: yearsOfExperience }]);
    setYearsOfExperience('');
    setError('');
  };

  /**
   * Adds an availability period with a start and end date to the availability list.
   */
  const handleAddAvailability = () => {
    if (!fromDate || !toDate) {
      setError(t('applicant.error.select_dates'));
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    const dateRegex = /^(?:19|20)\d{2}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12][0-9]|3[01])$/;
    if (!dateRegex.test(fromDate) || !dateRegex.test(toDate)) {
      setError('Invalid date format. Use YYYY-MM-DD.');
      return;
    }

    if (new Date(fromDate) < new Date(today) || new Date(toDate) < new Date(today)) {
      setError(t('applicant.error.past_dates'));
      return;
    }

    if (new Date(fromDate) > new Date(toDate)) {
      setError(t('applicant.error.invalid_date_range'));
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
        setError(t('applicant.error.missing_data'));
        return; 
      }  
      const { person_id } = user;
      onSubmit(person_id, expertise, availability);
      setError('');
      setExpertise([]);
      setAvailability([]);
      setStatus('unhandled');
    } else {
      setError(t('applicant.error.user_not_found'));
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
          <h3>{t('applicant.status.accepted.title')}</h3>
          <p>{t('applicant.status.accepted.message')}</p>
        </div>
      );
    } else if (status === 'rejected') {
      return (
        <div className="error-message">
          <h3>{t('applicant.status.rejected.title')}</h3>
          <p>{t('applicant.status.rejected.message')}</p>
        </div>
      );
    } else if (status === 'unhandled' || status === 'Missing Availability' || status === 'Missing Competence') {
      return (
        <div className="success-message">
          <h3>{t('applicant.status.unhandled.title')}</h3>
          <p>{t('applicant.status.unhandled.message')}</p>
        </div>
      );
    } else {
      return (  
        <div className="error-message">
          <h3>{t('applicant.status.error.title')}</h3>
          <p>{t('applicant.status.error.message')}</p>
        </div>
      );
    }
  };

  /**
   * Renders an error message if the user is not logged in.
   */
  if (!user) {
    return <div className="error-message">{t('applicant.error.user_not_found')}</div>;
  }

  /**
   * Renders an error message if the user does not have access to the applicant view.
   */
  if (accessError) {
    return <div className="error-message">{t('applicant.error.access_denied')}</div>;
  }

  return (
    <div className="applicant-container">
      <div className="applicant-box">
        <h2 className="applicant-header">{t('applicant.title')}</h2>
        <h3>{t('applicant.greeting', { username: user.username })}</h3>
        {(error || presenterError) && <div className="error-message"><p>{error || presenterError}</p></div>}

        {status === 'unsent' ? (
          <>
            <div className="expertise-section">
              <h3 className="applicant-title">{t('applicant.select_expertise')}</h3>
              <div className="applicant-input-group">
                <select className="expertise-dropdown" onChange={(e) => setSelectedCompetence(e.target.value)} value={selectedCompetence}>
                  <option value="">{t('applicant.select_expertise_placeholder')}</option>
                  {competences.map((competence) => (
                    <option key={competence.competence_id} value={competence.competence_id}>{competence.name}</option>
                  ))}
                </select>
                <input className="expertise-dropdown" type="number" placeholder={t('applicant.years_of_experience')} value={yearsOfExperience} onChange={(e) => setYearsOfExperience(e.target.value)} />
                <button className="submit-button" onClick={handleAddExpertise}>{t('applicant.add_expertise')}</button>
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
              <h3 className="applicant-title">{t('applicant.select_availability')}</h3>
              <div className="applicant-input-group">
                <input className="expertise-dropdown" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                <input className="expertise-dropdown" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                <button className="submit-button" onClick={handleAddAvailability}>{t('applicant.add_availability')}</button>
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

            <button className="submit-button" onClick={handleSubmit}>{t('applicant.submit_application')}</button>
            <button className="cancel-button" onClick={handleCancel}>{t('applicant.cancel')}</button>
          </>
        ) : (
          renderStatusMessage()
        )}
      </div>
    </div>
  );
};

export default ApplicantForm;
