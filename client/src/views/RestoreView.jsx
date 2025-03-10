import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/Restore.css';

/**
 * RestoreView Component - Allows users to request a credential reset link.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {Function} props.onVerify - Function to handle email verification.
 * @param {string} [props.error] - Error message (if any).
 * @param {string} [props.successMessage] - Success message (if any).
 * @param {string} [props.emailContent] - Preview content of the email (if available).
 * @returns {JSX.Element} The rendered RestoreView component.
 */
const RestoreView = ({ onVerify, error, successMessage, emailContent }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [validationError, setValidationError] = useState('');

  /**
   * Validates the email input.
   *
   * @param {string} email - The email entered by the user.
   * @returns {string} An error message if invalid, otherwise an empty string.
   */
  const validateEmail = (email) => {
    if (!email.trim()) {
      return t('restore.error.required_email');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return t('restore.error.invalid_email');
    }

    return '';
  };

  /**
   * Handles the email verification process.
   *
   * @returns {void}
   */
  const handleVerify = async () => {
    const emailError = validateEmail(email);
    if (emailError) {
      setValidationError(emailError);
      return;
    }

    setValidationError('');
    onVerify(email);
  };

  return (
    <div className="restore-container">
      <div className="restore-box">
        <h2 className="restore-header">{t('restore.title')}</h2>

        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{t('restore.success_message')}</div>}

        <div className="input-group">
          <label className="input-label" htmlFor="email">
            {t('restore.email_label')}
          </label>
          <input
            type="email"
            id="email"
            className="input-field"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setValidationError('');
            }}
            required
          />
          {validationError && <span className="error-message">{validationError}</span>}
          <button className="submit-button mt-4" onClick={handleVerify}>
            {t('restore.send_link')}
          </button>
        </div>

        {emailContent && (
          <div className="email-preview">
            <h3>{t('restore.email_preview')}</h3>
            <pre>{emailContent}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestoreView;
