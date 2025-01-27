const pool = require('../db');
const User = require('../model/User');

/**
 * Finds a user by username in the database
 * @param {string} username - Username to search for
 * @returns {Promise<User|null>} User object if found, null otherwise
 */
const findUserByUsername = async (username) => {
  const client = await pool.connect();
  try {
    const query = 'SELECT * FROM public.person WHERE username = $1';
    const result = await client.query(query, [username]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return new User(result.rows[0]);

  } catch (err) {
    console.error('Error executing query:', err);
    throw err;
  } finally {
    client.release();
  }
};

module.exports = {
  findUserByUsername
};