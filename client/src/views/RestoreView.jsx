import React, { useState } from 'react';
import '../styles/Restore.css';

/**
 * RestoreView component provides the UI for restoring username and password.
 *
 * @param {Object} props Component properties
 * @param {Function} props.onVerify Callback for verifying personal number
 * @param {Function} props.onRestore Callback for restoring username & password
 * @param {string} props.error Error message to display if restore fails
 * @param {string} props.successMessage Success message to display if restore is successful
 * @returns {React.ReactElement} Restore credentials form
 */
const RestoreView = ({ onVerify, onRestore, error, successMessage }) => {
  const [personNumber, setPersonNumber] = useState('');
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const handleVerify = async () => {
    const success = await onVerify(personNumber);
    if (success) {
      setIsVerified(true);
    }
  };

  const handleRestore = (e) => {
    e.preventDefault();
    onRestore(personNumber, username, newPassword);
  };

  return (
    <div className="restore-container">
      <div className="restore-box">
        <h2 className="restore-header">Restore Credentials</h2>

        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        {!isVerified ? (
          <div className="input-group">
            <label className="input-label" htmlFor="personNumber">
              Enter your personal number:
            </label>
            <input
              type="text"
              id="personNumber"
              className="input-field"
              value={personNumber}
              onChange={(e) => setPersonNumber(e.target.value)}
              required
            />
            <button className="submit-button mt-4" onClick={handleVerify}>
              Verify
            </button>
          </div>
        ) : (
          <form onSubmit={handleRestore}>
            <div className="input-group">
              <label className="input-label" htmlFor="username">
                New Username:
              </label>
              <input
                type="text"
                id="username"
                className="input-field"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="newPassword">
                New Password:
              </label>
              <input
                type="password"
                id="newPassword"
                className="input-field"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="submit-button mt-6">
              Update Credentials
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default RestoreView;
