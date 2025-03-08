const { Builder, By, until } = require('selenium-webdriver');

/**
 * Logs in to the web application with the provided username and password.
 *
 * This function navigates to the login page, waits for the username and password fields to become 
 * available, enters the provided credentials, and clicks the login button. After the login action, 
 * the function returns the WebDriver instance.
 * 
 * @param {WebDriver} driver - The WebDriver instance used to interact with the browser.
 * @param {string} username - The username to use for logging in.
 * @param {string} password - The password to use for logging in.
 * 
 * @returns {WebDriver} The WebDriver instance after the login action has been performed.
 */
async function login(driver, username, password) {
  await driver.get('http://localhost:8080/'); 

  let usernameField = await driver.wait(until.elementLocated(By.id('username')), 5000);
  await usernameField.sendKeys(username);

  let passwordField = await driver.wait(until.elementLocated(By.id('password')), 5000);
  await passwordField.sendKeys(password);

  let signInButton = await driver.findElement(By.css('.submit-button'));
  await signInButton.click();

  return driver; 
}

module.exports = { login };
