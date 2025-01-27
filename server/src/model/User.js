/**
 * Represents a user in the system
 */
class User {
  /**
   * Creates a new User instance
   * @param {Object} params - User parameters
   * @param {number} params.person_id - Unique identifier for the person
   * @param {string} params.name - User's first name
   * @param {string} params.surname - User's last name
   * @param {string} params.pnr - Personal number
   * @param {string} params.email - User's email address
   * @param {string} params.password - User's password
   * @param {number} params.role_id - User's role identifier
   * @param {string} params.username - Username for login
   */
  constructor({
    person_id,
    name,
    surname,
    pnr,
    email,
    password,
    role_id,
    username
  }) {
    this.person_id = person_id;
    this.name = name;
    this.surname = surname;
    this.pnr = pnr;
    this.email = email;
    this.password = password;
    this.role_id = role_id;
    this.username = username;
  }

  /**
     * Gets the person's unique identifier
     * @return {number} The person ID
     */
  get personId() {
    return this.person_id;
  }

  /**
   * Gets the user's first name
   * @return {string} The user's first name
   */
  get firstName() {
    return this.name;
  }

  /**
   * Gets the user's last name
   * @return {string} The user's last name
   */
  get lastName() {
    return this.surname;
  }

  /**
   * Gets the user's personal number
   * @return {string} The personal number
   */
  get personalNumber() {
    return this.pnr;
  }

  /**
   * Gets the user's email address
   * @return {string} The email address
   */
  get emailAddress() {
    return this.email;
  }

  /**
   * Gets the user's password (Note: In practice, passwords should be handled securely)
   * @return {string} The password
   */
  get userPassword() {
    return this.password;
  }

  /**
   * Gets the user's role identifier
   * @return {number} The role ID
   */
  get roleId() {
    return this.role_id;
  }

  /**
   * Gets the username
   * @return {string} The username
   */
  get userName() {
    return this.username;
  }
}

module.exports = User;