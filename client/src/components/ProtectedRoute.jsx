import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, hasRole } from '../util/auth';

/**
 * ProtectedRoute component to restrict access to authenticated users with specific roles
 * 
 * @param {Object} props Component properties
 * @param {React.ReactNode} props.children Child components to render if authentication passes
 * @param {number[]} props.allowedRoles Array of role IDs that are allowed to access this route
 * @returns {React.ReactElement} Either the protected content or a redirect
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  // Check if user is authenticated
  if (!isAuthenticated()) {
    // Redirect to login page if not authenticated
    return <Navigate to="/" replace />;
  }

  // If roles are specified, check if user has at least one of the allowed roles
  if (allowedRoles.length > 0) {
    const userHasAllowedRole = allowedRoles.some(roleId => hasRole(roleId));
    
    if (!userHasAllowedRole) {
      // Redirect to unauthorized page if user doesn't have the required role
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // If all checks pass, render the protected content
  return children;
};

export default ProtectedRoute;