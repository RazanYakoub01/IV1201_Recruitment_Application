const pool = require('../db');
const bcrypt = require('bcrypt'); // Import bcrypt

/**
 * Finds a user by username in the database
 * @param {string} username - Username to search for
 * @returns {Promise<Object|null>} User object if found, null otherwise
 */
const findUserByUsername = async (username) => {
  const client = await pool.connect();
  try {
    const query = 'SELECT person_id, username, password, role_id, status FROM public.person WHERE username = $1';
    const result = await client.query(query, [username]);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];

  } catch (err) {
    console.error('Error executing query:', err);
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Creates a new user in the database with a hashed password
 * @param {Object} userData - The user's data
 * @returns {Promise<Object>} The created user
 */
const createUser = async ({ firstName, lastName, email, personNumber, username, password }) => {
  const client = await pool.connect();
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const query = `
      INSERT INTO public.person (name, surname, email, pnr, username, password, role_id, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'unsent')
      RETURNING person_id, username, role_id;
    `;

    const result = await client.query(query, [firstName, lastName, email, personNumber, username, hashedPassword, 2]);
    return result.rows[0];

  } catch (err) {
    console.error('Error creating user:', err);
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { findUserByUsername, createUser };
