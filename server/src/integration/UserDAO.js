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

/**
 * Creates a new user in the database
 * 
 * @param {Object} userData - The user's data
 * @param {string} userData.username - The user's username
 * @param {string} userData.password - The user's password
 * @param {string} userData.email - The user's email
 * @param {string} userData.firstName - The user's firstName
 * @param {string} userData.lastName - The user's lastName
 * @param {string} userData.personNumber - The user's personNumber
 * @returns {Promise<User>} The created user
 */
const createUser = async ({ firstName, lastName, email, personNumber, username, password }) => {
  const client = await pool.connect();
  try {
    const query = `
      INSERT INTO public.person (name, surname, email, pnr, username, password, role_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const result = await client.query(query, [firstName, lastName, email, personNumber, username, password, 2]);
    return new User(result.rows[0]);
  } catch (err) {
    console.error('Error creating user:', err);
    throw err;
  } finally {
    client.release();
  }
};


module.exports = { findUserByUsername, createUser };