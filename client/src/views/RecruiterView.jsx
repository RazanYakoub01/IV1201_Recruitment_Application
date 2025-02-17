import React, { useState, useEffect } from 'react';
import '../styles/Recruiter.css';

/**
 * RecruiterView component allows a recruiter to view and manage job applications.
 * It provides functionality for listing, paginating, and updating the status of applications.
 * 
 * @param {Array} applications - List of applications to be displayed.
 * @param {string} error - Error message to display, if any.
 * @param {function} updateApplicationStatus - Function to update the status of an application.
 * @param {function} fetchApplications - Function to fetch all applications.
 */
const RecruiterView = ({ applications, error, updateApplicationStatus, fetchApplications }) => {
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

  /**
   * useEffect hook to fetch the user from localStorage and check their role.
   */
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

  /**
   * useEffect hook to fetch applications when they are available and when the current page changes.
   */
  useEffect(() => {
    if (applications && applications.length > 0) {
      handleFetchApplications();
    }
  }, [applications, currentPage]);

  /**
   * Handles the pagination and sets the displayed applications based on the current page.
   */
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
      setErrorMessage('No applications available at the moment.');
    }
  };

  /**
   * Sets the selected application and its current status.
   * @param {Object} app - The application to be selected.
   */
  const handleApplicationClick = (app) => {
    setSelectedApplication(app);
    setNewStatus(app.application_status);
  };

  /**
   * Resets the selected application and message, and goes back to the list of applications.
   */
  const handleBackToApplications = () => {
    setSelectedApplication(null);
    setMessage(null); 
  };

  /**
   * Handles the change of the application status.
   * @param {Event} e - The event triggered by changing the status.
   */
  const handleStatusChange = (e) => {
    setNewStatus(e.target.value);
  };

  /**
   * Handles the update of the application status.
   */
  const handleUpdateStatusClick = () => {
    if (selectedApplication) {
      const { application_id, last_updated } = selectedApplication;

      updateApplicationStatus(application_id, newStatus, last_updated, setSelectedApplication, setMessage)
        .then(() => {
          fetchApplications();
        })
        .catch((err) => {
          console.error('Error updating status:', err);
          setMessage({ type: 'error', text: 'Error updating application status' });
        });
    }
  };

  /**
   * Renders an error message if the user is not logged in.
   */
  if (!user) {
    return <div className="error-message">You must be logged in to access this page. Please log in first!</div>;
  }

  /**
   * Renders an error message if the user does not have access to the recruiter view.
   */
  if (accessError) {
    return <div className="error-message">You don't have access to this page.</div>;
  }

  /**
   * Renders the details of a selected application.
   */
  if (selectedApplication) {
    return (
      <div className="application-details-container">
        <h2>Application Details</h2>
        {message && (
          <div className={`message ${message.type === 'success' ? 'success-message' : 'error-message'}`}>
            {message.text}
          </div>
        )}
        <p><strong>Name:</strong> {selectedApplication.name} {selectedApplication.surname}</p>
        <p><strong>Email:</strong> {selectedApplication.email}</p>
        <p><strong>Current Application Status:</strong> {selectedApplication.application_status}</p>
        <p><strong>Applicants Competences:</strong> {selectedApplication.competences}</p>
        <p><strong>Applicants Availability:</strong> {selectedApplication.availability}</p>
        <p><strong>Updated Status:</strong> 
          <select value={newStatus} onChange={handleStatusChange}>
            <option value="unhandled">Unhandled</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </p>
        <button onClick={handleUpdateStatusClick} className="update-status-button">
          Update Status
        </button>
        <button onClick={handleBackToApplications} className="back-button">
          Back to Applications
        </button>
      </div>
    );
  }

  /**
   * Renders the list of applications with pagination.
   */
  return (
    <div className="recruiter-container">
      <div className="recruiter-box">
        {user.role === 1 ? (
          <>
            <h2 className="recruiter-header">Welcome, {user.username}!</h2>
            <button onClick={fetchApplications} className="fetch-applications-button">
              List All Applications
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
                      <th>Full Name</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Competences</th>
                      <th>Availability</th>
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
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === Math.ceil(applications.length / applicationsPerPage)}
                  >
                    Next
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