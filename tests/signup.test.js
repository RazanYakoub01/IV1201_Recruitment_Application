const { Builder, By, until } = require('selenium-webdriver');
const { expect } = require('@jest/globals');

const baseUrl = 'http://localhost:8080/';

/**
 * Function to test the sign-up functionality of the web application.
 * Fills in the sign-up form with the provided user details and submits the form.
 * 
 * @param {WebDriver} driver - The WebDriver instance
 * @param {Object} userDetails - The user details to fill in the form
 * @param {string} userDetails.firstName - The user's first name
 * @param {string} userDetails.lastName - The user's last name
 * @param {string} userDetails.email - The user's email address
 * @param {string} userDetails.personNumber - The user's personal number
 * @param {string} userDetails.username - The user's desired username
 * @param {string} userDetails.password - The user's desired password
 */
async function fillSignUpForm(driver, { firstName, lastName, email, personNumber, username, password }) {
  if (firstName !== undefined) await driver.findElement(By.name('firstName')).sendKeys(firstName);
  if (lastName !== undefined) await driver.findElement(By.name('lastName')).sendKeys(lastName);
  if (email !== undefined) await driver.findElement(By.name('email')).sendKeys(email);
  if (personNumber !== undefined) await driver.findElement(By.name('personNumber')).sendKeys(personNumber);
  if (username !== undefined) await driver.findElement(By.name('username')).sendKeys(username);
  if (password !== undefined) await driver.findElement(By.name('password')).sendKeys(password);
  
  let signUpButton = await driver.findElement(By.css('.submit-button'));
  await signUpButton.click();

  await driver.wait(until.elementLocated(By.css('.success-message, .error-message')), 5000);
}

/**
 * Function to check if an error message is displayed on the page.
 * 
 * @param {WebDriver} driver - The WebDriver instance
 * @param {string} expectedError - The expected error message to check for
 */
async function checkForErrorMessage(driver, expectedError) {
  let errorElements = await driver.findElements(By.css('.error-message'));
  let found = false;
  for (let element of errorElements) {
    let errorText = await element.getText();
    if (errorText.includes(expectedError)) {
      found = true;
      break;
    }
  }
  expect(found).toBe(true);
}

describe('Sign-Up Tests', () => {
  let driver;
  
  beforeAll(async () => {
    driver = await new Builder().forBrowser('chrome').build();
  });

  afterAll(async () => {
    await driver.quit();
  });

  beforeEach(async () => {
    await driver.get(`${baseUrl}signup`);
  });

  test('Successful Signup', async () => {
    await fillSignUpForm(driver, {
      firstName: 'John',
      lastName: 'Doe',
      email: `johndoe${Date.now()}@example.com`,
      personNumber: '199001011234',
      username: `john_doe${Date.now()}`,
      password: 'Password123!',
    });

    const successMessage = await driver.findElements(By.css('.success-message'));
    expect(successMessage.length).toBeGreaterThan(0);
  });

  test('Duplicate Username', async () => {
    await fillSignUpForm(driver, {
      firstName: 'John',
      lastName: 'Doe',
      email: `johndoe${Date.now()}@example.com`,
      personNumber: '199001011234',
      username: 'john_doe', // Reuse username
      password: 'Password123!',
    });

    await checkForErrorMessage(driver, 'This username is already taken');
  });

  test('Missing First Name', async () => {
    await fillSignUpForm(driver, {
      lastName: 'Doe',
      email: `johndoe${Date.now()}@example.com`,
      personNumber: '199001011234',
      username: `john_doe${Date.now()}`,
      password: 'Password123!',
    });

    await checkForErrorMessage(driver, 'First name is required');
  });

  test('Missing Last Name', async () => {
    await fillSignUpForm(driver, {
      firstName: 'John',
      email: `johndoe${Date.now()}@example.com`,
      personNumber: '199001011234',
      username: `john_doe${Date.now()}`,
      password: 'Password123!',
    });

    await checkForErrorMessage(driver, 'Last name is required');
  });

  test('Missing Email', async () => {
    await fillSignUpForm(driver, {
      firstName: 'John',
      lastName: 'Doe',
      personNumber: '199001011234',
      username: `john_doe${Date.now()}`,
      password: 'Password123!',
    });

    await checkForErrorMessage(driver, 'Invalid email format');
  });

  test('Missing Username', async () => {
    await fillSignUpForm(driver, {
      firstName: 'John',
      lastName: 'Doe',
      email: `johndoe${Date.now()}@example.com`,
      personNumber: '199001011234',
      password: 'Password123!',
    });

    await checkForErrorMessage(driver, 'Username must be at least 3 characters');
  });

  test('Missing Password', async () => {
    await fillSignUpForm(driver, {
      firstName: 'John',
      lastName: 'Doe',
      email: `johndoe${Date.now()}@example.com`,
      personNumber: '199001011234',
      username: `john_doe${Date.now()}`,
    });

    await checkForErrorMessage(driver, 'Password must be at least 8 characters');
  });

  test('Missing All Fields', async () => {
    await fillSignUpForm(driver, {});
    
    await checkForErrorMessage(driver, 'First name is required');
    await checkForErrorMessage(driver, 'Last name is required');
    await checkForErrorMessage(driver, 'Invalid email format');
    await checkForErrorMessage(driver, 'Personal number must be exactly 12 digits');
    await checkForErrorMessage(driver, 'Username must be at least 3 characters');
    await checkForErrorMessage(driver, 'Password must be at least 8 characters');
  });

  test('Invalid Personal Number', async () => {
    await fillSignUpForm(driver, {
      firstName: 'John',
      lastName: 'Doe',
      email: `johndoe${Date.now()}@example.com`,
      personNumber: 'abcd1234efgh',
      username: `john_doe${Date.now()}`,
      password: 'Password123!',
    });

    await checkForErrorMessage(driver, 'Personal number must be exactly 12 digits long and contain only numbers.');
  });

  test('Invalid Email Format', async () => {
    await fillSignUpForm(driver, {
      firstName: 'John',
      lastName: 'Doe',
      email: 'invalid_email_format',
      personNumber: '199001011234',
      username: `john_doe${Date.now()}`,
      password: 'Password123!',
    });

    await checkForErrorMessage(driver, 'Invalid email format');
  });

  test('Short Password', async () => {
    await fillSignUpForm(driver, {
      firstName: 'John',
      lastName: 'Doe',
      email: `johndoe${Date.now()}@example.com`,
      personNumber: '199001011234',
      username: `john_doe${Date.now()}`,
      password: 'pass',
    });

    await checkForErrorMessage(driver, 'Password must be at least 8 characters');
  });

  test('Going Back to Login', async () => {
    let goBackButton = await driver.findElement(By.name('goBackToSignIn'));
    await goBackButton.click();

    await driver.wait(until.elementLocated(By.css('.login-title')), 5000);
    let currentUrl = await driver.getCurrentUrl();
    let loginTitle = await driver.findElement(By.css('.login-title'));
    let titleText = await loginTitle.getText();

    expect(currentUrl).toBe(baseUrl);
    expect(titleText).toBe('Sign in to your account');
  });
});
