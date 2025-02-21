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
  const [validationErrors, setValidationErrors] = useState({});

  const validatePersonNumber = (pnr) => {
    if (!pnr.trim()) {
      return 'Personal number is required';
    }
    const pnrRegex = /^\d{12}$/;
    if (!pnrRegex.test(pnr)) {
      return 'Personal number must be exactly 12 digits';
    }
    return '';
  };

  const validateCredentials = () => {
    const errors = {};
    
    if (!username.trim()) {
      errors.username = 'Username is required';
    } else if (username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }

    if (!newPassword.trim()) {
      errors.password = 'Password is required';
    } else if (newPassword.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    return errors;
  };

  const handleVerify = async () => {
    const pnrError = validatePersonNumber(personNumber);
    if (pnrError) {
      setValidationErrors({ personNumber: pnrError });
      return;
    }

    setValidationErrors({});
    const success = await onVerify(personNumber);
    if (success) {
      setIsVerified(true);
    }
  };

  const handleRestore = (e) => {
    e.preventDefault();
    const errors = validateCredentials();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
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
              onChange={(e) => {
                setPersonNumber(e.target.value);
                setValidationErrors({});
              }}
              required
            />
            {validationErrors.personNumber && (
              <span className="error-message">{validationErrors.personNumber}</span>
            )}
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
                onChange={(e) => {
                  setUsername(e.target.value);
                  setValidationErrors({...validationErrors, username: ''});
                }}
                required
              />
              {validationErrors.username && (
                <span className="error-message">{validationErrors.username}</span>
              )}
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
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setValidationErrors({...validationErrors, password: ''});
                }}
                required
              />
              {validationErrors.password && (
                <span className="error-message">{validationErrors.password}</span>
              )}
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
