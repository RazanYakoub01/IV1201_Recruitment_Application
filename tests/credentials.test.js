const { Builder, By, until } = require('selenium-webdriver');
const { expect } = require('@jest/globals');

const BASE_URL = 'http://localhost:8080';

jest.setTimeout(30000);

let globalUpdateLink = "";

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
 * Tests the email verification process in the restore view.
 * @param {WebDriver} driver - The Selenium WebDriver instance.
 */
async function testEmailVerification(driver) {
  await driver.get(`${BASE_URL}/restore`);

  const emailInput = await driver.findElement(By.id('email'));
  await emailInput.sendKeys('invalid-email');
  await driver.findElement(By.css('.submit-button')).click();

  const errorMessage = await getElementText(driver, '.error-message');
  expect(errorMessage).toContain('Invalid email format');

  await emailInput.clear();
  await emailInput.sendKeys('l_crane118@finnsinte.se');
  await driver.findElement(By.css('.submit-button')).click();

  const successMessage = await getElementText(driver, '.success-message');
  expect(successMessage).toContain('Email verified successfully and a link to restore your credentials was sent!');
}

/**
 * Tests invalid and missing token cases for the update credentials page.
 * @param {WebDriver} driver - The Selenium WebDriver instance.
 */
async function testInvalidOrMissingToken(driver) {
  await driver.get(`${BASE_URL}/update-credentials`); // No token
  const tokenError = await getElementText(driver, '.error-message');
  expect(tokenError).toContain('Invalid or missing token');

  await driver.get(`${BASE_URL}/update-credentials?token=invalid`);
  const invalidTokenError = await getElementText(driver, '.error-message');
  expect(invalidTokenError).toContain('Invalid token');
}

/**
 * Extracts the update link from the email preview and navigates to the update credentials page.
 * @param {WebDriver} driver - The Selenium WebDriver instance.
 * @returns {Promise<string>} The extracted update link.
 */
async function extractUpdateLink(driver) {
  const emailPreview = await getElementText(driver, '.email-preview pre');
  const updateLinkPattern = new RegExp(`(${BASE_URL.replace(/\//g, '\\/')}/update-credentials\\?token=[^ ]+)`);
  const linkMatch = emailPreview.match(updateLinkPattern);

  expect(linkMatch).not.toBeNull();
  globalUpdateLink = linkMatch[0];  
  return globalUpdateLink;
}

/**
 * Updates user credentials using the reset link.
 * @param {WebDriver} driver - The Selenium WebDriver instance.
 * @param {string} updateLink - The reset credentials URL.
 * @param {string} newUsername - The new username.
 * @param {string} newPassword - The new password.
 */
async function updateCredentials(driver, updateLink, newUsername, newPassword) {
  await driver.get(updateLink);

  await driver.wait(until.elementLocated(By.css('.update-container')), 5000);

  let usernameField = await driver.findElement(By.css('.input-field[type="text"]'));
  let passwordField = await driver.findElement(By.css('.input-field[type="password"]'));
  let submitButton = await driver.findElement(By.css('.submit-button'));

  const uniqueUsername = `${newUsername}${Date.now()}`;
  await usernameField.sendKeys(uniqueUsername);
  await passwordField.sendKeys(newPassword);
  await submitButton.click();

  await driver.wait(until.urlContains('/'), 5000);

  await driver.wait(until.elementLocated(By.id('username')), 15000);
  await driver.findElement(By.id('username')).sendKeys(uniqueUsername);
  await driver.findElement(By.id('password')).sendKeys(newPassword);
  await driver.findElement(By.css('.submit-button')).click();

  await driver.wait(until.urlContains('/applicant'), 5000);
  const currentUrl = await driver.getCurrentUrl();
  expect(currentUrl).toContain('/applicant');
}

/**
 * Attempts to update user credentials using the old username and checks for failure.
 * @param {WebDriver} driver - The Selenium WebDriver instance.
 * @param {string} updateLink - The reset credentials URL.
 * @param {string} oldUsername - The old username (JoelleWilkinson).
 * @param {string} newPassword - The new password.
 */
async function updateCredentialsWithOldUsername(driver, updateLink, oldUsername, newPassword) {
  await driver.get(updateLink);

  await driver.wait(until.elementLocated(By.css('.update-container')), 5000);

  let usernameField = await driver.findElement(By.css('.input-field[type="text"]'));
  let passwordField = await driver.findElement(By.css('.input-field[type="password"]'));
  let submitButton = await driver.findElement(By.css('.submit-button'));

  await usernameField.sendKeys(oldUsername);
  await passwordField.sendKeys(newPassword);
  await submitButton.click();

  const errorMessage = await getElementText(driver, '.error-message');
  expect(errorMessage).toContain('Failed to update credentials');
}

let driver;

beforeAll(async () => {
  driver = await new Builder().forBrowser('chrome').build();
});

afterAll(async () => {
  if (driver) {
    await driver.quit();
  }
});

describe('Email Verification and Credentials Update Tests', () => {
  test('Email verification process (invalid and valid email)', async () => {
    await testEmailVerification(driver);
  });

  test('Fail to update credentials using the old username', async () => {
    if (!globalUpdateLink) {
      await extractUpdateLink(driver); 
    }

    const oldUsername = 'JoelleWilkinson'; 
    const newPassword = 'NewPassword123!';
    await updateCredentialsWithOldUsername(driver, globalUpdateLink, oldUsername, newPassword);
  });

  test('Update credentials using valid token', async () => {
    if (!globalUpdateLink) {
      await extractUpdateLink(driver);
    }

    const newUsername = 'updatedUser';
    const newPassword = 'NewPassword123!';
    await updateCredentials(driver, globalUpdateLink, newUsername, newPassword);
  });

  test('Invalid or missing token in update credentials', async () => {
    await testInvalidOrMissingToken(driver);
  });
});
