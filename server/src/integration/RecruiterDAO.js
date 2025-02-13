const pool = require('../db'); 

/**
 * Fetches all applications from the database view.
 * @returns {Promise<Array>} - A list of applications.
 */
const getApplications = async () => {
  try {
    const query = 'SELECT application_id, name, surname, email, application_status, competences, availability FROM application_view';
    const { rows } = await pool.query(query);
    return rows;
  } catch (error) {
    console.error('Error fetching applications:', error);
    throw error;
  }
};

module.exports = { getApplications };
