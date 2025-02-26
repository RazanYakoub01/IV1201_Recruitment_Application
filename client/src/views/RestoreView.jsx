import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/Restore.css';

/**
 * RestoreView component provides the UI for restoring username and password.
 */
const RestoreView = ({ onVerify, onRestore, error, successMessage }) => {
  const { t } = useTranslation(); // Import translation function

  const [personNumber, setPersonNumber] = useState('');
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const validatePersonNumber = (pnr) => {
    if (!pnr.trim()) {
      return t('restore.error.required_person_number');
    }
    const pnrRegex = /^\d{12}$/;
    if (!pnrRegex.test(pnr)) {
      return t('restore.error.invalid_person_number');
    }
    return '';
  };

  const validateCredentials = () => {
    const errors = {};
    
    if (!username.trim()) {
      errors.username = t('restore.error.required_username');
    } else if (username.length < 3) {
      errors.username = t('restore.error.short_username');
    }

    if (!newPassword.trim()) {
      errors.password = t('restore.error.required_password');
    } else if (newPassword.length < 8) {
      errors.password = t('restore.error.short_password');
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
        <h2 className="restore-header">{t('restore.title')}</h2>

        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        {!isVerified ? (
          <div className="input-group">
            <label className="input-label" htmlFor="personNumber">
              {t('restore.enter_person_number')}
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
              {t('restore.verify_button')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleRestore}>
            <div className="input-group">
              <label className="input-label" htmlFor="username">
                {t('restore.new_username')}
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
                {t('restore.new_password')}
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
              {t('restore.update_credentials')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default RestoreView;
