import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, hasRole } from '../util/auth';

/**
 * ProtectedRoute component to restrict access to authenticated users with specific roles
 * Special handling for recruiter and applicant routes to allow custom error messages to be displayed
 * 
 * @param {Object} props Component properties
 * @param {React.ReactNode} props.children Child components to render if authentication passes
 * @param {number[]} props.allowedRoles Array of role IDs that are allowed to access this route
 * @returns {React.ReactElement} Either the protected content or a redirect
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();
  const isRecruiterRoute = location.pathname === '/recruiter';
  const isApplicantRoute = location.pathname === '/applicant';
  
  if ((isRecruiterRoute && allowedRoles.includes(1)) || 
      (isApplicantRoute && allowedRoles.includes(2))) {
    return children;
  }
  
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles.length > 0) {
    const userHasAllowedRole = allowedRoles.some(roleId => hasRole(roleId));
    
    if (!userHasAllowedRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;