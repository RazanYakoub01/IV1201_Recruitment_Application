import React, { useState } from 'react';

const UpdateCredentialsView = ({ onUpdate, error, successMessage }) => {
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  const validateInputs = () => {
    if (!username.trim()) return 'Username is required';
    if (newPassword.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

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
        <h2 className="update-header">Update Your Credentials</h2>

        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        <div className="input-group">
          <label className="input-label">New Username:</label>
          <input
            type="text"
            className="input-field"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label className="input-label">New Password:</label>
          <input
            type="password"
            className="input-field"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          {validationError && <span className="error-message">{validationError}</span>}
          
          <button className="submit-button" onClick={handleUpdate}>
            Update Credentials
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateCredentialsView;
