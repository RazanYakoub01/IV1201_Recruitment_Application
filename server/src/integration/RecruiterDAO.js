const pool = require('../db');

/**
 * Fetches all applications from the database view.
 * @returns {Promise<Array>} - A list of applications.
 */
const getApplications = async () => {
  const client = await pool.connect();
  try {

    const query = 'SELECT application_id, name, surname, email, application_status, competences, availability, last_updated FROM application_view';
    const { rows } = await client.query(query);

    return rows;
  } catch (error) {
    console.error('Error fetching applications:', error);
    throw error;
  } finally {
    client.release(); 
  }
};

/**
 * Updates the status of an application with optimistic concurrency control.
 * @param {number} applicationId - The ID of the application to update.
 * @param {string} newStatus - The new status to set.
 * @param {string} lastUpdated - The timestamp when the recruiter last loaded the application.
 * @returns {Promise<Object>} - A result object with success status and message.
 */
const updateApplication = async (applicationId, newStatus, lastUpdated) => {
  const client = await pool.connect();
  try {

    if (!Number.isInteger(applicationId) || applicationId <= 0) {
      return { success: false, message: 'Invalid application ID. Must be a valid positive integer.' };
    }

    const validStatuses = ['unhandled', 'accepted', 'rejected'];
    if (!validStatuses.includes(newStatus)) {
      return { success: false, message: 'Invalid status. Allowed values: unhandled, accepted, rejected.' };
    }

    const query = 'SELECT last_updated FROM public.person WHERE person_id = $1';
    const result = await client.query(query, [applicationId]);

    if (result.rowCount === 0) {
      return { success: false, message: 'Application not found.' };
    }

    const currentLastUpdated = result.rows[0].last_updated;

    const currentLastUpdatedISO = new Date(currentLastUpdated).toISOString();
    const lastUpdatedISO = new Date(lastUpdated).toISOString();

    if (currentLastUpdatedISO !== lastUpdatedISO) {
      return {
        success: false,
        message: `The application has been modified by another user. Your update has been aborted. Refresh the page to see the new data before trying to modify it!`,
      };
    }

    const updateQuery = 'UPDATE public.person SET status = $1, last_updated = NOW() WHERE person_id = $2 RETURNING last_updated';
    const updatedResult = await client.query(updateQuery, [newStatus, applicationId]);

    const updatedLastUpdated = updatedResult.rows[0].last_updated;


    return { 
      success: true, 
      message: 'Application status updated successfully.',
      updatedLastUpdated: updatedLastUpdated, 
    };
  } catch (error) {
    console.error('Error updating application:', error);
    return { success: false, message: 'Internal server error' };
  } finally {
    client.release(); 
  }
};

module.exports = { getApplications, updateApplication };
