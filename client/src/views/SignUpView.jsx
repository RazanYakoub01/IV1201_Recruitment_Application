import React, { useState, useEffect } from 'react';
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
      errors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    const pnrRegex = /^\d{12}$/;
    if (!pnrRegex.test(formData.personNumber)) {
      errors.personNumber = 'Personal number must be exactly 12 digits long and contain only numbers.';
    }

    if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }

    if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
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
      console.log('errors are detected in the register form:', errors)
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    onSignUp(formData);
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2 className="signup-title">Create an Account</h2>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">Account created successfully!</div>}

        <form className="form-group" onSubmit={handleSubmit}>
          <label className="input-label">First Name</label>
          <input name="firstName" type="text" required className="input-field" onChange={handleInputChange} />
          {validationErrors.firstName && <span className="error-message">{validationErrors.firstName}</span>}

          <label className="input-label">Last Name</label>
          <input name="lastName" type="text" required className="input-field" onChange={handleInputChange} />
          {validationErrors.lastName && <span className="error-message">{validationErrors.lastName}</span>}

          <label className="input-label">Email Address</label>
          <input name="email" type="email" required className="input-field" onChange={handleInputChange}/>
          {validationErrors.email && <span className="error-message">{validationErrors.email}</span>}

          <label className="input-label">Person Number</label>
          <input name="personNumber" type="text" pattern="\d*" required className="input-field" onChange={handleInputChange} />
          {validationErrors.personNumber && <span className="error-message">{validationErrors.personNumber}</span>}

          <label className="input-label">Username</label>
          <input name="username" type="text" required className="input-field" onChange={handleInputChange} />
          {validationErrors.username || backendError && <span className="error-message">{validationErrors.username || backendError}</span>}

          <label className="input-label">Password</label>
          <input name="password" type="password" required className="input-field" onChange={handleInputChange}/>
          {validationErrors.password && <span className="error-message">{validationErrors.password}</span>}

          <button type="submit" className="submit-button">Sign Up</button>
        </form>
       
        <button className="submit-button" onClick={() => navigate('/')}>
          Go back to sign in
        </button>
      
      </div>
    </div>
  );
};

<<<<<<< HEAD
export default SignUpView;
=======
export default SignUpView;
>>>>>>> ace32ee196174cff1efc96136fa9fe8bc6f56b1f
