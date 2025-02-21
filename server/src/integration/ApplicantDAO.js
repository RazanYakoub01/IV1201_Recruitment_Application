const pool = require('../db');

/**
 * Fetches all competences (areas of expertise) from the database.
 * @returns {Promise<Array>} List of competences
 */
const getCompetences = async () => {
  const query = 'SELECT competence_id, name FROM public.competence';
  const result = await pool.query(query);
  return result.rows;
};

/**
 * Submits the applicant's application data (expertise and availability).
 * @param {number} userId - The ID of the applicant
 * @param {Array} expertise - List of expertise items
 * @param {Array} availability - List of availability items
 * @returns {Promise<void>}
 */
const submitApplication = async (userId, expertise, availability) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN'); 
    console.log('Begin submitApplication in UserDAO...');
    const expertisePromises = expertise.map(async (expert) => {
      const { competence_id, years_of_experience } = expert;
      console.log('Get:', {competence_id, years_of_experience}, 'as expert.');
      const query = `
        INSERT INTO public.competence_profile (person_id, competence_id, years_of_experience)
        VALUES ($1, $2, $3)
        RETURNING competence_profile_id
      `;
      await client.query(query, [userId, competence_id, years_of_experience]);
      console.log('Inserted competence into public.competence_profile:', 
        { query: query,
          userId: userId,
          competence_id: competence_id, 
          years_of_experience: years_of_experience});
    });

    const availabilityPromises = availability.map(async (period) => {
      const { from_date, to_date } = period;

      const query = `
        INSERT INTO public.availability (person_id, from_date, to_date)
        VALUES ($1, $2, $3)
      `;
      await client.query(query, [userId, from_date, to_date]);
    });

    await Promise.all([...expertisePromises, ...availabilityPromises]);

    const statusUpdateQuery = `
      UPDATE public.person
      SET status = 'unhandled'
      WHERE person_id = $1
    `;
  
    await client.query(statusUpdateQuery, [userId]);
    console.log('Updating application status:', {
      userId: userId,
      newStatus: 'unhandled',
      operation: 'UPDATE person status',
      timestamp: new Date().toISOString()
    });

    await client.query('COMMIT');
    console.log('Transaction committed successfully:', {
      operation: 'Submit application',
      userId: userId,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error submitting application:', err);
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { getCompetences, submitApplication };
