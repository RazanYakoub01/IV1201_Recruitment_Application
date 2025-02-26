import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/Recruiter.css';

/**
 * RecruiterView component allows a recruiter to view and manage job applications.
 * It provides functionality for listing, paginating, and updating the status of applications.
 */
const RecruiterView = ({ applications, error, updateApplicationStatus, fetchApplications }) => {
  const { t } = useTranslation(); // Import translation function

  const [user, setUser] = useState(null);
  const [paginatedApplications, setPaginatedApplications] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [applicationsPerPage] = useState(10);
  const [showApplications, setShowApplications] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [accessError, setAccessError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if (parsedUser.role === 2) {
        setAccessError(true);
      }
    }
  }, []);

  useEffect(() => {
    if (applications && applications.length > 0) {
      handleFetchApplications();
    }
  }, [applications, currentPage]);

  const handleFetchApplications = () => {
    if (applications && applications.length > 0) {
      const indexOfLastApplication = currentPage * applicationsPerPage;
      const indexOfFirstApplication = indexOfLastApplication - applicationsPerPage;
      const currentApplications = applications.slice(indexOfFirstApplication, indexOfLastApplication);
      setPaginatedApplications(currentApplications);
      setShowApplications(true);
      setErrorMessage('');
    } else {
      setShowApplications(false);
      setErrorMessage(t('recruiter.no_applications'));
    }
  };

  const handleApplicationClick = (app) => {
    setSelectedApplication(app);
    setNewStatus(app.application_status);
  };

  const handleBackToApplications = () => {
    setSelectedApplication(null);
    setMessage(null);
  };

  const handleStatusChange = (e) => {
    setNewStatus(e.target.value);
  };

  const handleUpdateStatusClick = () => {
    if (selectedApplication) {
      const { application_id, last_updated } = selectedApplication;

      updateApplicationStatus(application_id, newStatus, last_updated, setSelectedApplication, setMessage)
        .then(() => {
          fetchApplications();
        })
        .catch((err) => {
          console.error('Error updating status:', err);
          setMessage({ type: 'error', text: t('recruiter.update_error') });
        });
    }
  };

  if (!user) {
    return <div className="error-message">{t('recruiter.login_required')}</div>;
  }

  if (accessError) {
    return <div className="error-message">{t('recruiter.access_denied')}</div>;
  }

  if (selectedApplication) {
    return (
      <div className="application-details-container">
        <h2>{t('recruiter.application_details')}</h2>
        {message && (
          <div className={`message ${message.type === 'success' ? 'success-message' : 'error-message'}`}>
            {message.text}
          </div>
        )}
        <p><strong>{t('recruiter.name')}:</strong> {selectedApplication.name} {selectedApplication.surname}</p>
        <p><strong>{t('recruiter.email')}:</strong> {selectedApplication.email}</p>
        <p><strong>{t('recruiter.status')}:</strong> {selectedApplication.application_status}</p>
        <p><strong>{t('recruiter.competences')}:</strong> {selectedApplication.competences}</p>
        <p><strong>{t('recruiter.availability')}:</strong> {selectedApplication.availability}</p>
        <p><strong>{t('recruiter.update_status')}:</strong>
          <select value={newStatus} onChange={handleStatusChange}>
            <option value="unhandled">{t('recruiter.status_unhandled')}</option>
            <option value="accepted">{t('recruiter.status_accepted')}</option>
            <option value="rejected">{t('recruiter.status_rejected')}</option>
          </select>
        </p>
        <button onClick={handleUpdateStatusClick} className="update-status-button">
          {t('recruiter.update_button')}
        </button>
        <button onClick={handleBackToApplications} className="back-button">
          {t('recruiter.back_button')}
        </button>
      </div>
    );
  }

  return (
    <div className="recruiter-container">
      <div className="recruiter-box">
        {user.role === 1 ? (
          <>
            <h2 className="recruiter-header">{t('recruiter.welcome')}, {user.username}!</h2>
            <button onClick={fetchApplications} className="fetch-applications-button">
              {t('recruiter.list_applications')}
            </button>

            {message && (
              <div className={`message ${message.type === 'success' ? 'success-message' : 'error-message'}`}>
                {message.text}
              </div>
            )}

            {errorMessage && <div className="error-message">{errorMessage}</div>}

            {showApplications && (
              <div>
                <table className="applications-table">
                  <thead>
                    <tr>
                      <th>{t('recruiter.full_name')}</th>
                      <th>{t('recruiter.email')}</th>
                      <th>{t('recruiter.status')}</th>
                      <th>{t('recruiter.competences')}</th>
                      <th>{t('recruiter.availability')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedApplications.map((app) => (
                      <tr key={app.application_id} onClick={() => handleApplicationClick(app)}>
                        <td>{app.name} {app.surname}</td>
                        <td>{app.email}</td>
                        <td>{app.application_status}</td>
                        <td>{app.competences}</td>
                        <td>{app.availability}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="pagination-controls">
                  <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
                    {t('recruiter.previous')}
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === Math.ceil(applications.length / applicationsPerPage)}
                  >
                    {t('recruiter.next')}
                  </button>
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
};

export default RecruiterView;
