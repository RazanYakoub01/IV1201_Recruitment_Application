import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPresenter from './presenter/LoginPresenter';
import SignUpPresenter from './presenter/SignUpPresenter';

const App = () => {
  const handleLoginSuccess = (role) => {
    console.log(`${role} logged in`);
  };

  const handleSignUpSuccess = () => {
    console.log('Sign up successful');
  };

  return (
    <Routes>
      <Route
        path="/"
        element={<LoginPresenter onLoginSuccess={handleLoginSuccess} />}
      />
      <Route
        path="/signup"
        element={<SignUpPresenter onSignUpSuccess={handleSignUpSuccess} />}
      />
    </Routes>
  );
};

export default App;
