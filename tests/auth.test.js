const { Builder, By, until } = require('selenium-webdriver');
const { expect } = require('@jest/globals');

const BASE_URL = 'https://iv1201-recruitment-application-frontend.onrender.com';

jest.setTimeout(30000);

/**
 * Logs in as a specific user role (Recruiter or Applicant).
 * @param {WebDriver} driver - The Selenium WebDriver instance.
 * @param {string} username - The username of the user.
 * @param {string} password - The password of the user.
 */
async function login(driver, username, password) {
  console.log(`Logging in as: ${username}`);

  await driver.get(BASE_URL);

  let usernameField = await driver.wait(until.elementLocated(By.id('username')), 5000);
  await usernameField.sendKeys(username);

  let passwordField = await driver.wait(until.elementLocated(By.id('password')), 5000);
  await passwordField.sendKeys(password);

  let signInButton = await driver.findElement(By.css('.submit-button'));
  await signInButton.click();

  await driver.wait(until.urlContains(username.includes('JoelleWilkinson') ? '/recruiter' : '/applicant'), 5000);
}

/**
 * Tests role-based access control by attempting to access a restricted URL.
 * @param {WebDriver} driver - The Selenium WebDriver instance.
 * @param {Object} loginDetails - The login credentials of the user.
 * @param {string} loginDetails.username - The username for login.
 * @param {string} loginDetails.password - The password for login.
 * @param {string} restrictedUrl - The URL to test for restricted access.
 * @param {string} expectedMessage - The expected error message for unauthorized access.
 */
async function testRoleAccess(driver, loginDetails, restrictedUrl, expectedMessage) {
  await login(driver, loginDetails.username, loginDetails.password);

  console.log(`Attempting to access restricted URL: ${restrictedUrl}`);
  await driver.get(restrictedUrl);

  let errorMessage = await driver.wait(until.elementLocated(By.css('.error-message')), 5000);
  let text = await errorMessage.getText();

  console.log(`Error message displayed: ${text}`);
  expect(text).toContain(expectedMessage);
}

describe('Authentication Tests', () => {
  let driver;

  beforeEach(async () => {
    driver = await new Builder().forBrowser('chrome').build();
  });

  afterEach(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  test('Unauthorized access tests', async () => {
    const unauthorizedTests = [
      { url: `${BASE_URL}/applicant`, expectedMessage: 'You must be logged in to access this page. Please log in first!' },
      { url: `${BASE_URL}/recruiter`, expectedMessage: 'You must be logged in to access this page. Please log in first!' },
      { url: `${BASE_URL}/update-credentials`, expectedMessage: 'Invalid or missing token.' }
    ];

    for (const testCase of unauthorizedTests) {
      console.log(`Testing unauthorized access to: ${testCase.url}`);
      await driver.get(testCase.url);

      let errorMessage = await driver.wait(until.elementLocated(By.css('.error-message')), 5000);
      let text = await errorMessage.getText();

      expect(text).toContain(testCase.expectedMessage);
    }
  });

  test('Recruiter role should not access applicant pages', async () => {
    await testRoleAccess(
      driver,
      { username: 'JoelleWilkinson', password: 'LiZ98qvL8Lw' },
      `${BASE_URL}/applicant`,
      "You don't have access to this page."
    );
  });

  test('Applicant role should not access recruiter pages', async () => {
    await testRoleAccess(
      driver,
      { username: 'testuserselenium', password: 'password123' },
      `${BASE_URL}/recruiter`,
      "You don't have access to this page."
    );
  });
});
