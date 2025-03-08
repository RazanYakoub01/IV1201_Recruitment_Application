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
    if (!firstName || !lastName || !email || !personNumber || !username || !password) {
      throw new Error('All fields are required.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format.');
    }

    const usernameRegex = /^[a-zA-Z0-9]{3,20}$/;
    if (!usernameRegex.test(username)) {
      throw new Error('Username must be 3-20 characters and contain only letters and numbers.');
    }

    const passwordRegex = /^.{8,}$/;
    if (!passwordRegex.test(password)) {
      throw new Error('Password must be at least 8 characters long.');
    }

    const pnrRegex = /^\d{12}$/;
    if (!pnrRegex.test(personNumber)) {
      throw new Error('Personal number must be exactly 12 digits long.');
    }
    const formattedPersonNumber = `${personNumber.slice(0, 8)}-${personNumber.slice(8)}`;

    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO public.person (name, surname, email, pnr, username, password, role_id, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'unsent')
      RETURNING person_id, username, role_id;
    `;

    const result = await client.query(query, [
      firstName, lastName, email, formattedPersonNumber, username, hashedPassword, 2
    ]);

    return result.rows[0];

  } catch (err) {
    console.error('Error creating user:', err.message);
    throw new Error(err.message); 
  } finally {
    client.release();
  }
};

/**
 * Updates a user's username and password in the database
 * @param {string} email - The user's email
 * @param {string} newUsername - The new username
 * @param {string} newPassword - The new hashed password
 * @returns {Promise<boolean>} True if update was successful, false otherwise
 */
const updateUserCredentials = async (email, newUsername, newPassword) => {
  const client = await pool.connect();
  
  try {
    if (!email || !newUsername || !newPassword) {
      throw new Error('Email, new username, and new password are required.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format.');
    }

    const usernameRegex = /^[a-zA-Z0-9]{3,20}$/;
    if (!usernameRegex.test(newUsername)) {
      throw new Error('Username must be 3-20 characters and contain only letters and numbers.');
    }

    const passwordRegex = /^.{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      throw new Error('Password must be at least 8 characters long.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const query = `
      UPDATE public.person 
      SET username = $1, password = $2 
      WHERE email = $3
    `;
    console.log('Executing Query:', query, 'with values:', newUsername, hashedPassword, email);

    const result = await client.query(query, [newUsername, hashedPassword, email]);

    return result.rowCount > 0;

  } catch (err) {
    console.error('Error updating user credentials:', err.message);
    throw new Error(err.message);
  } finally {
    client.release();
  }
};


module.exports = { findUserByUsername, findUserByEmail, findUserByPersonNumber, createUser, updateUserCredentials };
