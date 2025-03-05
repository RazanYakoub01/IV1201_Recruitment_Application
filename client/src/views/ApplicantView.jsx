import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; // Import i18n
import '../styles/Applicant.css';

const ApplicantForm = ({ onSubmit, competences }) => {
  const { t } = useTranslation(); // Initialize translation
  const [user, setUser] = useState(null);
  const [selectedCompetence, setSelectedCompetence] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [expertise, setExpertise] = useState([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [availability, setAvailability] = useState([]);
  const [error, setError] = useState('');
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setStatus(parsedUser.application_status);
    }
  }, []);

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

  const handleAddAvailability = () => {
    if (!fromDate || !toDate) {
      setError(t('applicant.error.select_dates'));
      return;
    }

    const today = new Date().toISOString().split('T')[0];

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

  if (!user || status === null) {
    return <div className="error-message">{t('applicant.error.user_not_found')}</div>;
  }

  return (
    <div className="applicant-container">
      <div className="applicant-box">
        <h2 className="applicant-header">{t('applicant.title')}</h2>
        <h3>{t('applicant.greeting', { username: user.username })}</h3>

        {error && <div className="error-message"><p>{error}</p></div>}

        {status === 'unsent' ? (
          <>
            <div className="expertise-section">
              <h3 className="applicant-title">{t('applicant.select_expertise')}</h3>
              <div className="applicant-input-group">
                <select
                  className="expertise-dropdown"
                  onChange={(e) => setSelectedCompetence(e.target.value)}
                  value={selectedCompetence}
                >
                  <option value="">{t('applicant.select_expertise_placeholder')}</option>
                  {competences.map((competence) => (
                    <option key={competence.competence_id} value={competence.competence_id}>
                      {competence.name}
                    </option>
                  ))}
                </select>

                <input
                  className="expertise-dropdown"
                  type="number"
                  placeholder={t('applicant.years_of_experience')}
                  value={yearsOfExperience}
                  onChange={(e) => setYearsOfExperience(e.target.value)}
                />
                <button className="submit-button" onClick={handleAddExpertise}>
                  {t('applicant.add_expertise')}
                </button>
              </div>
            </div>

            <div className="availability-section">
              <h3 className="applicant-title">{t('applicant.select_availability')}</h3>
              <div className="applicant-input-group">
                <input className="expertise-dropdown" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                <input className="expertise-dropdown" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                <button className="submit-button" onClick={handleAddAvailability}>
                  {t('applicant.add_availability')}
                </button>
              </div>
            </div>

            <button className="submit-button" onClick={handleSubmit}>
              {t('applicant.submit_application')}
            </button>
            <button className="cancel-button" onClick={handleCancel}>
              {t('applicant.cancel')}
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
