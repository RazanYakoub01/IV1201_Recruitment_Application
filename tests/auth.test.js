const { Builder, By, until } = require('selenium-webdriver');

const BASE_URL = 'http://localhost:8080';

/**
 * Tests unauthorized access to a specific URL without logging in.
 * 
 * @param {WebDriver} driver - The Selenium WebDriver instance.
 * @param {string} url - The URL to test for unauthorized access.
 * @param {string} expectedMessage - The expected error message to be displayed.
 */
async function testUnauthorizedAccess(driver, url, expectedMessage) {
  try {
    console.log(`\n🔹 Testing unauthorized access to ${url}`);
    await driver.get(url); 

    let errorMessage = await driver.wait(until.elementLocated(By.css('.error-message')), 5000);
    let text = await errorMessage.getText();

    if (text.includes(expectedMessage)) {
      console.log(`✅ Test Passed: Correct error message displayed for ${url}`);
    } else {
      console.error(`❌ Test Failed: Unexpected message for ${url}: "${text}"`);
    }
  } catch (error) {
    console.error(`❌ Test Failed: Error when testing ${url}`, error);
  }
}

/**
 * Logs in as a specific user role (Recruiter or Applicant).
 * 
 * @param {WebDriver} driver - The Selenium WebDriver instance.
 * @param {string} username - The username of the user.
 * @param {string} password - The password of the user.
 */
async function login(driver, username, password) {
  console.log(`\n🔹 Logging in as ${username}`);
  await driver.get(BASE_URL); 

  let usernameField = await driver.wait(until.elementLocated(By.id('username')), 5000);
  await usernameField.sendKeys(username);

  let passwordField = await driver.wait(until.elementLocated(By.id('password')), 5000);
  await passwordField.sendKeys(password);

  let signInButton = await driver.findElement(By.css('.submit-button'));
  await signInButton.click();

  await driver.wait(until.urlContains(username.includes('JoelleWilkinson') ? '/recruiter' : '/applicant'), 5000);
  console.log(`✅ Logged in as ${username}`);
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
  try {
    await login(driver, loginDetails.username, loginDetails.password);
    console.log(`\n🔹 Trying to access ${restrictedUrl} manually...`);

    await driver.get(restrictedUrl); 
    let errorMessage = await driver.wait(until.elementLocated(By.css('.error-message')), 5000);
    let text = await errorMessage.getText();

    if (text.includes(expectedMessage)) {
      console.log(`✅ Test Passed: Correct error message displayed for ${restrictedUrl}`);
    } else {
      console.error(`❌ Test Failed: Unexpected message for ${restrictedUrl}: "${text}"`);
    }
  } catch (error) {
    console.error(`❌ Test Failed: Error when testing ${restrictedUrl}`, error);
  }
}

/**
 * Runs all authentication tests, including unauthorized access tests and role-based access tests.
 */
(async function runTests() {
  let driver = await new Builder().forBrowser('chrome').build();

  try {
    // Test cases for unauthorized access (without login)
    const unauthorizedTests = [
      { url: `${BASE_URL}/applicant`, expectedMessage: 'You must be logged in to access this page. Please log in first!' },
      { url: `${BASE_URL}/recruiter`, expectedMessage: 'You must be logged in to access this page. Please log in first!' },
      { url: `${BASE_URL}/update-credentials`, expectedMessage: 'Invalid or missing token.' }
    ];

    for (const testCase of unauthorizedTests) {
      await testUnauthorizedAccess(driver, testCase.url, testCase.expectedMessage);
    }

    // Test cases for role-based access control
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

  } finally {
    await driver.quit();
    console.log('\n🎉 All tests completed!');
  }
})();
