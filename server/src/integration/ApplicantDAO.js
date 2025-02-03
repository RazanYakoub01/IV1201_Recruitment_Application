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

    const expertisePromises = expertise.map(async (expert) => {
      const { competence_id, years_of_experience } = expert;

      const query = `
        INSERT INTO public.competence_profile (person_id, competence_id, years_of_experience)
        VALUES ($1, $2, $3)
        RETURNING competence_profile_id
      `;
      await client.query(query, [userId, competence_id, years_of_experience]);
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

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error submitting application:', err);
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { getCompetences, submitApplication };
