import React, { useState } from 'react';
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
      return 'Email is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Invalid email format';
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
        <h2 className="restore-header">Reset Your Credentials</h2>

        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        <div className="input-group">
          <label className="input-label" htmlFor="email">
            Enter your registered email:
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
            Send Update Link
          </button>
        </div>

        {emailContent && (
          <div className="email-preview">
            <h3>Email Preview:</h3>
            <pre>{emailContent}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestoreView;
