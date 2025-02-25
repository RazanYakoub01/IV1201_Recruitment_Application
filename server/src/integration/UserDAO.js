const pool = require('../db');
const bcrypt = require('bcrypt');

/**
 * Finds a user by username in the database
 * @param {string} username - Username to search for
 * @returns {Promise<Object|null>} User object if found, null otherwise
 */
const findUserByUsername = async (username) => {
  const client = await pool.connect();
  try {
    const query = `
      SELECT person_id, username, password, role_id, status 
      FROM public.person 
      WHERE username = $1
    `;
    const result = await client.query(query, [username]);

    return result.rows.length ? result.rows[0] : null;
  } catch (err) {
    console.error('Error executing query:', err);
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Finds a user by email in the database
 * @param {string} email - Email address to search for
 * @returns {Promise<Object|null>} User object if found, null otherwise
 */
const findUserByEmail = async (email) => {
  const client = await pool.connect();
  try {
    const query = `
      SELECT person_id, email, username, role_id, status 
      FROM public.person 
      WHERE email = $1
    `;
    const result = await client.query(query, [email]);

    return result.rows.length ? result.rows[0] : null;
  } catch (err) {
    console.error('Error executing query:', err);
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Finds a user by personal number in the database
 * @param {string} personNumber - Personal number to search for
 * @returns {Promise<Object|null>} User object if found, null otherwise
 */
const findUserByPersonNumber = async (personNumber) => {
  const client = await pool.connect();
  try {
    const query = `
      SELECT person_id, username 
      FROM public.person 
      WHERE pnr = $1
    `;
    const result = await client.query(query, [personNumber]);

    return result.rows.length ? result.rows[0] : null;
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
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO public.person (name, surname, email, pnr, username, password, role_id, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'unsent')
      RETURNING person_id, username, role_id;
    `;

    const result = await client.query(query, [
      firstName, lastName, email, personNumber, username, hashedPassword, 2
    ]);

    return result.rows[0];
  } catch (err) {
    console.error('Error creating user:', err);
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Updates a user's username and password in the database
 * @param {string} personNumber - The user's personal number
 * @param {string} newUsername - The new username
 * @param {string} newPassword - The new hashed password
 * @returns {Promise<boolean>} True if update was successful, false otherwise
 */
const updateUserCredentials = async (email, newUsername, newPassword) => {
  const client = await pool.connect();
  try {
    const query = `
      UPDATE public.person 
      SET username = $1, password = $2 
      WHERE email = $3
    `;
    console.log('Executing Query:', query, 'with values:', newUsername, newPassword, email);
    
    const result = await client.query(query, [newUsername, newPassword, email]);

    return result.rowCount > 0; // Returns true if a row was updated
  } catch (err) {
    console.error('Error updating user credentials:', err);
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { findUserByUsername, findUserByEmail, findUserByPersonNumber, createUser, updateUserCredentials };
