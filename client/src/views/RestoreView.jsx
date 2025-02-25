import React, { useState } from 'react';
import '../styles/Restore.css';

const RestoreView = ({ onVerify, error, successMessage, emailContent }) => {
  const [email, setEmail] = useState('');
  const [validationError, setValidationError] = useState('');

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
