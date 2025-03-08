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

    if (!Number.isInteger(userId) || userId <= 0) {
      throw new Error('Invalid user ID.');
    }

    if (!Array.isArray(expertise) || expertise.length === 0) {
      throw new Error('Expertise must be a non-empty array.');
    }

    for (const expert of expertise) {
      if (!expert.competence_id || !Number.isInteger(expert.competence_id)) {
        throw new Error('Competence ID must be a valid number.');
      }
      if (!expert.years_of_experience || isNaN(expert.years_of_experience) || expert.years_of_experience < 0) {
        throw new Error('Years of experience must be a positive number.');
      }
    }

    if (!Array.isArray(availability) || availability.length === 0) {
      throw new Error('Availability must be a non-empty array.');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dateRegex = /^(?:19|20)\d{2}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12][0-9]|3[01])$/;

    for (const period of availability) {
      const { from_date, to_date } = period;

      if (!from_date || !to_date) {
        throw new Error('Availability periods must have both from_date and to_date.');
      }

      if (!dateRegex.test(from_date) || !dateRegex.test(to_date)) {
        throw new Error(`Invalid date format. Use YYYY-MM-DD. Received: from_date=${from_date}, to_date=${to_date}`);
      }

      const fromDate = new Date(from_date);
      const toDate = new Date(to_date);
      fromDate.setHours(0, 0, 0, 0);
      toDate.setHours(0, 0, 0, 0);

      if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
        throw new Error(`Invalid date values. Could not parse: from_date=${from_date}, to_date=${to_date}`);
      }

      if (fromDate < today) {
        throw new Error('Start date cannot be in the past.');
      }

      if (fromDate > toDate) {
        throw new Error('From date cannot be later than to date.');
      }
    }

    const expertisePromises = expertise.map(async (expert) => {
      const { competence_id, years_of_experience } = expert;
      const query = `
        INSERT INTO public.competence_profile (person_id, competence_id, years_of_experience)
        VALUES ($1, $2, $3)
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

    const statusUpdateQuery = `
      UPDATE public.person
      SET status = 'unhandled'
      WHERE person_id = $1
    `;
    await client.query(statusUpdateQuery, [userId]);

    await client.query('COMMIT');
    console.log('Application submitted successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error submitting application:', err);
    throw new Error(err.message);
  } finally {
    client.release();
  }
};


module.exports = { getCompetences, submitApplication };