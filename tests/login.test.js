const { Builder, By, until } = require('selenium-webdriver');
const { login } = require('./loginHelper');
const { expect } = require('@jest/globals');

/**
 * Helper function to test login functionality
 * @param {WebDriver} driver - The WebDriver instance
 * @param {string} username - The username for login
 * @param {string} password - The password for login
 * @param {string} expectedError - The expected error message (if any)
 * @param {string} expectedWelcomeMessage - The expected welcome message (for successful login)
 * @param {string} expectedPageUrl - The expected page URL after login
 */
async function testLogin(driver, username, password, expectedError, expectedWelcomeMessage, expectedPageUrl) {
  await driver.get('http://localhost:8080/');

  const usernameField = await driver.wait(until.elementLocated(By.id('username')), 5000);
  if (username) await usernameField.sendKeys(username);

  const passwordField = await driver.wait(until.elementLocated(By.id('password')), 5000);
  if (password) await passwordField.sendKeys(password);

  const signInButton = await driver.findElement(By.css('.submit-button'));
  await signInButton.click();

  if (expectedError) {
    const errorMessage = await driver.wait(until.elementLocated(By.css('.error-message')), 5000);
    const text = await errorMessage.getText();
    expect(text).toContain(expectedError);
  } else {
    await driver.wait(until.urlContains(expectedPageUrl), 5000);

    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toContain(expectedPageUrl);

    if (expectedPageUrl === '/applicant') {
      const applicantSpecificElement = await driver.wait(until.elementLocated(By.css('h3')), 5000);
      const applicantGreeting = await applicantSpecificElement.getText();
      expect(applicantGreeting).toContain(`Hello, ${username}!`);
    }

    if (expectedPageUrl === '/recruiter') {
      const welcomeMessage = await driver.wait(until.elementLocated(By.css('.recruiter-header')), 5000);
      const welcomeText = await welcomeMessage.getText();
      expect(welcomeText).toContain(expectedWelcomeMessage);
    }
  }
}

/**
 * Helper function to test the "Sign Up" button
 * @param {WebDriver} driver - The WebDriver instance
 */
async function testSignUp(driver) {
  await driver.get('http://localhost:8080/');

  const signUpButton = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(),'Sign Up')]")), 5000);
  await signUpButton.click();

  const currentUrl = await driver.getCurrentUrl();
  expect(currentUrl).toContain('/signup');

  const signUpTitle = await driver.wait(until.elementLocated(By.css('.signup-title')), 5000);
  const titleText = await signUpTitle.getText();
  expect(titleText).toContain('Create an Account');
}

/**
 * Helper function to test the "Forgot Username or Password?" button
 * @param {WebDriver} driver - The WebDriver instance
 */
async function testRestore(driver) {
  await driver.get('http://localhost:8080/');

  const forgotButton = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(),'Forgot Username or Password?')]")), 5000);
  await forgotButton.click();

  const currentUrl = await driver.getCurrentUrl();
  expect(currentUrl).toContain('/restore');

  const restoreTitle = await driver.wait(until.elementLocated(By.css('.restore-header')), 5000);
  const restoreText = await restoreTitle.getText();
  expect(restoreText).toContain('Reset Your Credentials');
}

describe('Login, Sign Up and Restore Tests', () => {
  let driver;

  beforeAll(async () => {
    driver = await new Builder().forBrowser('chrome').build();
  });

  afterAll(async () => {
    await driver.quit();
  });

  test('Test invalid credentials for login', async () => {
    await testLogin(driver, 'invalidUser', 'wrongPassword', 'Invalid username or password', null, null);
  });

  test('Test missing username', async () => {
    await testLogin(driver, '', 'somePassword', 'Username is required', null, null);
  });

  test('Test missing password', async () => {
    await testLogin(driver, 'validUser', '', 'Password is required', null, null);
  });

  test('Test missing both username and password', async () => {
    await testLogin(driver, '', '', 'Username is required', null, null);
  });

  test('Test successful login for JoelleWilkinson with recruiter page', async () => {
    await testLogin(driver, 'JoelleWilkinson', 'LiZ98qvL8Lw', null, 'Welcome, JoelleWilkinson!', '/recruiter');
  });

  test('Test successful login for testuserselenium with applicant page', async () => {
    await testLogin(driver, 'testuserselenium', 'password123', null, 'Hello, testuserselenium!', '/applicant');
  });

  test('Test "Sign Up" button', async () => {
    await testSignUp(driver);
  });

  test('Test "Forgot Username or Password?" button', async () => {
    await testRestore(driver);
  });
});
