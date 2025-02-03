import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPresenter from './presenter/LoginPresenter';
import SignUpPresenter from './presenter/SignUpPresenter';
import RecruiterPresenter from './presenter/RecruiterPresenter';
import ApplicantPresenter from './presenter/ApplicantPresenter';

const App = () => {
  const handleLoginSuccess = (role) => {
    console.log(`${role} logged in`);
  };

  const handleSignUpSuccess = () => {
    console.log('Sign up successful');
  };

  return (
    <Routes>
      <Route path="/" element={<LoginPresenter onLoginSuccess={handleLoginSuccess} />} />
      <Route path="/signup" element={<SignUpPresenter onSignUpSuccess={handleSignUpSuccess} />} />
      <Route path="/recruiter" element={<RecruiterPresenter />} />
      <Route path="/applicant" element={<ApplicantPresenter />} />
    </Routes>
  );
};

export default App;
