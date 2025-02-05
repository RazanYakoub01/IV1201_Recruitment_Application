import React, { useState } from 'react';
import '../styles/SignUp.css';
import { useNavigate } from 'react-router-dom';

const SignUp = ({ onSignUp, error, success }) => {

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const firstName = e.target.firstName.value;
    const lastName = e.target.lastName.value;
    const email = e.target.email.value;
    const personNumber = e.target.personNumber.value;
    const username = e.target.username.value;
    const password = e.target.password.value;
    onSignUp({ firstName, lastName, email, personNumber, username, password });
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2 className="signup-title">Create an Account</h2>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">Account created successfully!</div>}

        <form className="form-group" onSubmit={handleSubmit}>
          <label className="input-label">First Name</label>
          <input name="firstName" type="text" required className="input-field" />

          <label className="input-label">Last Name</label>
          <input name="lastName" type="text" required className="input-field" />

          <label className="input-label">Email Address</label>
          <input name="email" type="email" required className="input-field" />

          <label className="input-label">Person Number</label>
          <input name="personNumber" type="text" pattern="\d*" required className="input-field" />

          <label className="input-label">Username</label>
          <input name="username" type="text" required className="input-field" />

          <label className="input-label">Password</label>
          <input name="password" type="password" required className="input-field" />

          <button type="submit" className="submit-button">Sign Up</button>
        </form>
       
        <button className="submit-button" onClick={() => navigate('/')}>
          Go back to sign in
        </button>
      
      </div>
    </div>
  );
};

export default SignUp;
