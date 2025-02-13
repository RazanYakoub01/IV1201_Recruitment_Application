import React, { useState, useEffect } from 'react';
import '../styles/Recruiter.css'; 

const RecruiterView = ({ applications, error }) => {
  const [user, setUser] = useState(null);
  const [paginatedApplications, setPaginatedApplications] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [applicationsPerPage] = useState(10);
  const [showApplications, setShowApplications] = useState(false); 
  const [accessError, setAccessError] = useState(false); 
  const [errorMessage, setErrorMessage] = useState(""); 

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

  const handleFetchApplications = () => {
    if (applications && applications.length > 0) { 
      const indexOfLastApplication = currentPage * applicationsPerPage;
      const indexOfFirstApplication = indexOfLastApplication - applicationsPerPage;
      const currentApplications = applications.slice(indexOfFirstApplication, indexOfLastApplication);
      setPaginatedApplications(currentApplications);
      setShowApplications(true);
      setErrorMessage(""); 
    } else {
      setShowApplications(false); 
      setErrorMessage("No applications available at the moment."); 
    }
  };

  const handleNextPage = () => {
    if (currentPage < Math.ceil(applications.length / applicationsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  useEffect(() => {
    if (showApplications && applications.length > 0) {
      handleFetchApplications();
    }
  }, [currentPage, applications]); 

  const handleFetchApplicationsButton = () => {
    handleFetchApplications(); 
  };

  if (!user) {
    return <div className="error-message">You must be logged in to access this page. Please log in first!</div>;
  }

  if (accessError) {
    return <div className="error-message">You don't have access to this page.</div>;
  }

  return (
    <div className="recruiter-container">
      <div className="recruiter-box">
        {user.role === 1 ? ( 
          <>
            <h2 className="recruiter-header">Welcome, {user.username}!</h2>
            <button onClick={handleFetchApplicationsButton} className="fetch-applications-button">
              List All Applications
            </button>

            {errorMessage && <div className="error-message">{errorMessage}</div>}

            {showApplications && ( 
              <div>
                <table className="applications-table">
                  <thead>
                    <tr>
                      <th>Full Name</th>
                      <th>Status</th>
                      <th>Competences</th>
                      <th>Availability</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedApplications.map((app) => (
                      <tr key={app.application_id}>
                        <td>{app.name} {app.surname}</td>
                        <td>{app.application_status}</td>
                        <td>{app.competences}</td>
                        <td>{app.availability}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="pagination-controls">
                  <button onClick={handlePreviousPage} disabled={currentPage === 1}>
                    Previous
                  </button>
                  <button
                    onClick={handleNextPage}
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