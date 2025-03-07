import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LoginPresenter from './presenter/LoginPresenter';
import SignUpPresenter from './presenter/SignUpPresenter';
import RecruiterPresenter from './presenter/RecruiterPresenter';
import ApplicantPresenter from './presenter/ApplicantPresenter';
import RestorePresenter from './presenter/RestorePresenter';
import UpdateCredentialsPresenter from './presenter/UpdateCredentialsPresenter';

import ProtectedRoute from './components/ProtectedRoute';
import { isAuthenticated, isRecruiter, isApplicant } from './util/auth';


const App = () => {
  const [authenticated, setAuthenticated] = useState(isAuthenticated());

  // Check authentication status on mount and when auth state changes
  useEffect(() => {
    // Function to update authentication state
    const updateAuthState = () => {
      setAuthenticated(isAuthenticated());
    };

    // Listen for storage events (localStorage changes)
    window.addEventListener('storage', updateAuthState);
    
    // Check initial authentication
    updateAuthState();
    
    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener('storage', updateAuthState);
    };
  }, []);

  // Add a custom event listener for logout
  useEffect(() => {
    const handleStorageChange = () => {
      setAuthenticated(isAuthenticated());
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const handleLogout = () => {
      setAuthenticated(false);
    };
    
    window.addEventListener('logout', handleLogout);
    return () => {
      window.removeEventListener('logout', handleLogout);
    };
  }, []);

  const handleLoginSuccess = (role) => {
    console.log(`${role} logged in`);
    setAuthenticated(true);
  };

  const handleSignUpSuccess = () => {
    console.log('Sign up successful');
  };

  return (
    <Routes>
      {/* Public routes - no authentication required */}
      <Route 
        path="/" 
        element={
          authenticated ? (
            isRecruiter() ? 
              <Navigate to="/recruiter" replace /> : 
              <Navigate to="/applicant" replace />
          ) : (
            <Layout showHeader={true}>
              <LoginPresenter onLoginSuccess={handleLoginSuccess} />
            </Layout>
          )
        } 
      />
      <Route path="/signup" element={<Layout showHeader={true}> <SignUpPresenter onSignUpSuccess={handleSignUpSuccess} /> </Layout>} />
      <Route path="/restore" element={<Layout showHeader={true}> <RestorePresenter /> </Layout>} />
      <Route path="/update-credentials" element={<Layout showHeader={true}> <UpdateCredentialsPresenter /> </Layout>} />

      {/* Protected routes - authentication required */}
      <Route 
        path="/recruiter" 
        element={
          <ProtectedRoute allowedRoles={[1]}>
            <Layout showHeader={true}>
              <RecruiterPresenter />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/applicant" 
        element={
          <ProtectedRoute allowedRoles={[2]}>
            <Layout showHeader={true}>
              <ApplicantPresenter />
            </Layout>
          </ProtectedRoute>
        } 
      />

      {/* Catch all other routes and redirect */}
      <Route 
        path="*" 
        element={<Navigate to="/" replace />} 
      />

    </Routes>
  );
};

export default App;
