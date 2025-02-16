import React, { useState, useEffect } from 'react';
import '../styles/Recruiter.css';

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
      setErrorMessage('No applications available at the moment.');
    }
  };

  const handleApplicationClick = (app) => {
    setSelectedApplication(app);
    setNewStatus(app.application_status); 
  };

  const handleBackToApplications = () => {
    setSelectedApplication(null);
  };

  const handleStatusChange = (e) => {
    setNewStatus(e.target.value);
  };

  const handleUpdateStatusClick = () => {
    if (selectedApplication) {
      const { application_id, last_updated } = selectedApplication;
  
      updateApplicationStatus(application_id, newStatus, last_updated, setSelectedApplication)
        .then(() => {
          fetchApplications();
        })
        .catch((err) => {
          console.error('Error updating status:', err);
          alert('Error updating application status');
        });
    }
  };

  if (!user) {
    return <div className="error-message">You must be logged in to access this page. Please log in first!</div>;
  }

  if (accessError) {
    return <div className="error-message">You don't have access to this page.</div>;
  }

  if (selectedApplication) {
    return (
      <div className="application-details-container">
        <h2>Application Details</h2>
        <p><strong>Name:</strong> {selectedApplication.name} {selectedApplication.surname}</p>
        <p><strong>Email:</strong> {selectedApplication.email}</p>
        <p><strong>Current Application Status:</strong>{selectedApplication.application_status}</p>
        <p><strong>Applicants Competences:</strong>{selectedApplication.competences}</p>
        <p><strong>Applicants Availability:</strong>{selectedApplication.availability}</p>
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

  return (
    <div className="recruiter-container">
      <div className="recruiter-box">
        {user.role === 1 ? (
          <>
            <h2 className="recruiter-header">Welcome, {user.username}!</h2>
            <button onClick={fetchApplications} className="fetch-applications-button">
              List All Applications
            </button>

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
