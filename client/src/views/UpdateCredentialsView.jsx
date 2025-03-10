import React, { useState } from 'react';
import '../styles/updateCredentials.css';
import { useTranslation } from 'react-i18next';

/**
 * UpdateCredentialsView Component - Allows users to update their credentials.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {Function} props.onUpdate - Function to handle credential update.
 * @param {string} [props.error] - Error message (if any).
 * @param {string} [props.successMessage] - Success message (if any).
 * @returns {JSX.Element} The rendered UpdateCredentialsView component.
 */
const UpdateCredentialsView = ({ onUpdate, error, successMessage }) => {
  const { t } = useTranslation(); // Load translations
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  /**
   * Validates the input fields using translations.
   *
   * @returns {string} An error message if validation fails, otherwise an empty string.
   */
  const validateInputs = () => {
    if (!username.trim()) return t('updateCredentials.error.required_username');
    const usernameRegex = /^[a-zA-Z0-9]{3,20}$/;
    if (!usernameRegex.test(username)) return t('updateCredentials.error.invalid_username');
    if (newPassword.length < 8) return t('updateCredentials.error.short_password');
    return '';
  };

  /**
   * Handles the update process by validating inputs and calling onUpdate.
   *
   * @returns {void}
   */
  const handleUpdate = () => {
    const error = validateInputs();
    if (error) {
      setValidationError(error);
      return;
    }
    
    setValidationError('');
    onUpdate(username, newPassword);
  };

  return (
    <div className="update-container">
      <div className="update-box">
        <h2 className="update-header">{t('updateCredentials.title')}</h2>

        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        <div className="input-group">
          <label className="input-label">{t('updateCredentials.username_label')}</label>
          <input
            type="text"
            className="input-field"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label className="input-label">{t('updateCredentials.password_label')}</label>
          <input
            type="password"
            className="input-field"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          {validationError && <span className="error-message">{validationError}</span>}
          
          <button className="submit-button" onClick={handleUpdate}>
            {t('updateCredentials.update_button')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateCredentialsView;
