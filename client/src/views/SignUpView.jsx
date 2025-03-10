import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/SignUp.css';
import { useNavigate } from 'react-router-dom';

/**
 * SignUp view component that renders the user registration form.
 * Handles form submission and displays status messages.
 * 
 * @component
 * @param {Object} props Component properties
 * @param {Function} props.onSignUp Callback function for form submission
 * @param {string} props.error Error message to display
 * @param {boolean} props.success Success status for registration
 * @returns {React.ReactElement} Registration form with input fields
 */

const SignUpView = ({ onSignUp, error, success }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [validationErrors, setValidationErrors] = useState({});
  const [backendError, setBackendError] = useState('');

  useEffect(() => {
    if (error && error.toLowerCase().includes('username')) {
      setBackendError(error);
    } else {
      setBackendError('');
    }
  }, [error]);

  const validateForm = (formData) => {
    const errors = {};
    
    if (!formData.firstName.trim()) {
      errors.firstName = t('signup.error.required_first_name');
    }

    if (!formData.lastName.trim()) {
      errors.lastName = t('signup.error.required_last_name');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.email = t('signup.error.invalid_email');
    }

    const pnrRegex = /^\d{12}$/;
    if (!pnrRegex.test(formData.personNumber)) {
      errors.personNumber = t('signup.error.invalid_person_number');
    }

    if (formData.username.length < 3) {
      errors.username = t('signup.error.short_username');
    }

    if (formData.password.length < 8) {
      errors.password = t('signup.error.short_password');
    }

    return errors;
  };

  const handleInputChange = (e) => {
    const { name } = e.target;
    setValidationErrors(prev => ({
      ...prev,
      [name]: ''
    }));
    if (name === 'username') {
      setBackendError('');
    }
  };

  /**
   * Handles form submission by collecting input values and calling onSignUp
   * @param {Event} e Form submission event
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      firstName: e.target.firstName.value,
      lastName: e.target.lastName.value,
      email: e.target.email.value,
      personNumber: e.target.personNumber.value,
      username: e.target.username.value,
      password: e.target.password.value
    };

    console.log('Form submission data:', {
      ...formData,
      password: '[REDACTED]',
      personNumber: '[REDACTED]'
    });

    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      console.log('Errors detected in the register form:', errors);
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    onSignUp(formData);
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2 className="signup-title">{t('signup.title')}</h2>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{t('signup.success_message')}</div>}

        <form className="form-group" onSubmit={handleSubmit}>
          <label className="input-label">{t('signup.first_name')}</label>
          <input name="firstName" type="text" className="input-field" onChange={handleInputChange} />
          {validationErrors.firstName && <span className="error-message">{validationErrors.firstName}</span>}

          <label className="input-label">{t('signup.last_name')}</label>
          <input name="lastName" type="text" className="input-field" onChange={handleInputChange} />
          {validationErrors.lastName && <span className="error-message">{validationErrors.lastName}</span>}

          <label className="input-label">{t('signup.email')}</label>
          <input name="email" className="input-field" onChange={handleInputChange} />
          {validationErrors.email && <span className="error-message">{validationErrors.email}</span>}

          <label className="input-label">{t('signup.person_number')}</label>
          <input name="personNumber" type="text" className="input-field" onChange={handleInputChange} />
          {validationErrors.personNumber && <span className="error-message">{validationErrors.personNumber}</span>}

          <label className="input-label">{t('signup.username')}</label>
          <input name="username" type="text" className="input-field" onChange={handleInputChange} />
          {validationErrors.username && <span className="error-message">{validationErrors.username || backendError}</span>}

          <label className="input-label">{t('signup.password')}</label>
          <input name="password" type="password" className="input-field" onChange={handleInputChange} />
          {validationErrors.password && <span className="error-message">{validationErrors.password}</span>}

          <button type="submit" className="submit-button">{t('signup.sign_up')}</button>
        </form>
       
        <button className="submit-button" name="goBackToSignIn" onClick={() => navigate('/')}>
          {t('signup.go_back')}
        </button>
      </div>
    </div>
  );
};

export default SignUpView;
