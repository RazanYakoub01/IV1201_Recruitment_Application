/**
 * Authentication utility module for the HireFlow application
 * Handles token storage, user data, and authentication checks
 */

/**
 * Get the auth token from localStorage
 * @returns {string|null} The JWT token or null if not found
 */
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

/**
 * Set the auth token in localStorage
 * @param {string} token - The JWT token to store
 */
export const setAuthToken = (token) => {
  localStorage.setItem('token', token);
};

/**
 * Remove the auth token from localStorage
 */
export const removeAuthToken = () => {
  localStorage.removeItem('token');
};

/**
 * Get the current user data from localStorage
 * @returns {Object|null} The user object or null if not found
 */
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

/**
 * Set the current user data in localStorage
 * @param {Object} user - The user object to store
 */
export const setCurrentUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

/**
 * Remove the current user data from localStorage
 */
export const removeCurrentUser = () => {
  localStorage.removeItem('user');
};

/**
 * Check if the user is authenticated by verifying token existence
 * @returns {boolean} True if authenticated, false otherwise
 */
export const isAuthenticated = () => {
  return !!getAuthToken() && !!getCurrentUser();
};

/**
 * Check if the current user has a specific role
 * @param {number} roleId - The role ID to check for
 * @returns {boolean} True if the user has the role, false otherwise
 */
export const hasRole = (roleId) => {
  const user = getCurrentUser();
  return user && user.role === roleId;
};

/**
 * Check if the current user is a recruiter (role ID 1)
 * @returns {boolean} True if the user is a recruiter, false otherwise
 */
export const isRecruiter = () => {
  return hasRole(1);
};

/**
 * Check if the current user is an applicant (role ID 2)
 * @returns {boolean} True if the user is an applicant, false otherwise
 */
export const isApplicant = () => {
  return hasRole(2);
};

/**
 * Log out the user by removing token and user data
 */
export const logout = () => {
  removeAuthToken();
  removeCurrentUser();
  
  // Dispatch a custom event that App.jsx can listen for
  window.dispatchEvent(new Event('logout'));
};

/**
 * Create headers with Authorization token for API requests
 * @returns {Object} Headers object with Content-Type and Authorization if token exists
 */
export const createAuthHeaders = () => {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};