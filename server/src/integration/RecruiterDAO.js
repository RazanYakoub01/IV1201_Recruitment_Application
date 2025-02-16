const pool = require('../db');

/**
 * Fetches all applications from the database view.
 * @returns {Promise<Array>} - A list of applications.
 */
const getApplications = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const query = 'SELECT application_id, name, surname, email, application_status, competences, availability, last_updated FROM application_view';
    const { rows } = await client.query(query);

    await client.query('COMMIT'); 

    return rows;
  } catch (error) {
    console.error('Error fetching applications:', error);
    await client.query('ROLLBACK'); 
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
    await client.query('BEGIN'); 

    const query = 'SELECT last_updated FROM public.person WHERE person_id = $1';
    const result = await client.query(query, [applicationId]);

    if (result.rowCount === 0) {
      await client.query('ROLLBACK'); 
      return { success: false, message: 'Application not found.' };
    }

    const currentLastUpdated = result.rows[0].last_updated;

    const currentLastUpdatedISO = new Date(currentLastUpdated).toISOString();
    const lastUpdatedISO = new Date(lastUpdated).toISOString();

    if (currentLastUpdatedISO !== lastUpdatedISO) {
      await client.query('ROLLBACK'); 
      return {
        success: false,
        message: `The application has been modified by another user. Your update has been aborted. Current Last Updated: ${currentLastUpdatedISO}, Your Last Updated: ${lastUpdatedISO}`,
      };
    }

    const updateQuery = 'UPDATE public.person SET status = $1, last_updated = NOW() WHERE person_id = $2 RETURNING last_updated';
    const updatedResult = await client.query(updateQuery, [newStatus, applicationId]);

    const updatedLastUpdated = updatedResult.rows[0].last_updated;

    await client.query('COMMIT'); 

    return { 
      success: true, 
      message: 'Application status updated successfully.',
      updatedLastUpdated: updatedLastUpdated, 
    };
  } catch (error) {
    console.error('Error updating application:', error);
    await client.query('ROLLBACK');
    return { success: false, message: 'Internal server error' };
  } finally {
    client.release(); 
  }
};

module.exports = { getApplications, updateApplication };
