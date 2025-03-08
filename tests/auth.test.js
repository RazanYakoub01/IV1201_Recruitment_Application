const { Builder, By, until } = require('selenium-webdriver');
const { expect } = require('@jest/globals');

const BASE_URL = 'http://localhost:8080';

jest.setTimeout(30000);
/**
 * Waits for an element to be visible and retrieves its text.
 * @param {WebDriver} driver - The Selenium WebDriver instance.
 * @param {string} selector - The CSS selector of the element.
 * @returns {Promise<string>} The text of the element.
 */
async function getElementText(driver, selector) {
  const element = await driver.wait(until.elementLocated(By.css(selector)), 5000);
  return await element.getText();
}

/**
 * Tests unauthorized access to a specific URL without logging in.
 * 
 * @param {WebDriver} driver - The Selenium WebDriver instance.
 * @param {string} url - The URL to test for unauthorized access.
 * @param {string} expectedMessage - The expected error message to be displayed.
 */
async function testUnauthorizedAccess(driver, url, expectedMessage) {
  await driver.get(url);

  let errorMessage = await driver.wait(until.elementLocated(By.css('.error-message')), 5000);
  let text = await errorMessage.getText();

  expect(text).toContain(expectedMessage);
}

/**
 * Logs in as a specific user role (Recruiter or Applicant).
 * 
 * @param {WebDriver} driver - The Selenium WebDriver instance.
 * @param {string} username - The username of the user.
 * @param {string} password - The password of the user.
 */
async function login(driver, username, password) {
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
 * Tests role-based access control by attempting to manually change the URL.
 * 
 * @param {WebDriver} driver - The Selenium WebDriver instance.
 * @param {Object} loginDetails - The login credentials of the user.
 * @param {string} loginDetails.username - The username for login.
 * @param {string} loginDetails.password - The password for login.
 * @param {string} restrictedUrl - The URL to test for restricted access.
 * @param {string} expectedMessage - The expected error message for unauthorized access.
 */
async function testRoleAccess(driver, loginDetails, restrictedUrl, expectedMessage) {
  await login(driver, loginDetails.username, loginDetails.password);

  await driver.get(restrictedUrl); 
  let errorMessage = await driver.wait(until.elementLocated(By.css('.error-message')), 5000);
  let text = await errorMessage.getText();

  expect(text).toContain(expectedMessage);
}

/**
 * Runs all authentication tests, including unauthorized access tests and role-based access tests.
 */
describe('Authentication Tests', () => {
  let driver;

  beforeAll(async () => {
    driver = await new Builder().forBrowser('chrome').build();
  });

  afterAll(async () => {
    await driver.quit();
  });

  test('Unauthorized access tests', async () => {
    const unauthorizedTests = [
      { url: `${BASE_URL}/applicant`, expectedMessage: 'You must be logged in to access this page. Please log in first!' },
      { url: `${BASE_URL}/recruiter`, expectedMessage: 'You must be logged in to access this page. Please log in first!' },
      { url: `${BASE_URL}/update-credentials`, expectedMessage: 'Invalid or missing token.' }
    ];

    for (const testCase of unauthorizedTests) {
      await testUnauthorizedAccess(driver, testCase.url, testCase.expectedMessage);
    }
  });

  test('Role-based access control tests', async () => {
    const roleAccessTests = [
      {
        loginDetails: { username: 'JoelleWilkinson', password: 'LiZ98qvL8Lw' },
        restrictedUrl: `${BASE_URL}/applicant`,
        expectedMessage: 'You must be logged in to access this page. Please log in first!'
      },
      {
        loginDetails: { username: 'testuserselenium', password: 'password123' },
        restrictedUrl: `${BASE_URL}/recruiter`,
        expectedMessage: "You don't have access to this page."
      }
    ];

    for (const test of roleAccessTests) {
      await testRoleAccess(driver, test.loginDetails, test.restrictedUrl, test.expectedMessage);
    }
  });
});
