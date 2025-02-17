import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Login from '../views/Login';

/**
 * Presenter component for handling login business logic and state management.
 * 
 * @param {Object} props Component properties
 * @param {Function} props.onLoginSuccess Callback function to handle successful login
 * @returns {React.ReactElement} Renders the Login view component with necessary handlers
 */
const LoginPresenter = ({ onLoginSuccess }) => {
  const [error, setError] = useState('');
  const navigate = useNavigate(); 

  /**
   * Handles the login process when user submits credentials
   * @param {string} username - The username entered by the user
   * @param {string} password - The password entered by the user
   */
  const handleLogin = async (username, password) => {
    try {
      let endpoint = `${import.meta.env.VITE_BACKEND_URL}/users/login`;
      console.log(`Sending POST to ${endpoint} for user ${username}`);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();

      
      if (response.ok) {
        alert(`Login successful! ${data.user.username} AND ${data.user.application_status} AND ${data.user.person_id} `);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        if (data.user.role === 1) {
          navigate('/recruiter');
        } else if (data.user.role === 2) {
          navigate('/applicant');
        } else {
          alert("Unknown role. Please contact support.");
        }

        onLoginSuccess(data.user.role);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setError(err.message);
    }
  };


  const handleNavigateToSignUp = () => {
    navigate('/signup');
  };

  return <Login onLogin={handleLogin} onNavigateToSignUp={handleNavigateToSignUp} error={error} />;
};

export default LoginPresenter;
