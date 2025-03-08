const { By, until } = require('selenium-webdriver');

/**
 * Helper function to sign up a user with the provided details.
 * 
 * @param {WebDriver} driver - The WebDriver instance.
 * @param {string} firstName - The user's first name.
 * @param {string} lastName - The user's last name.
 * @param {string} email - The user's email address.
 * @param {string} personNumber - The user's personal number.
 * @param {string} username - The desired username.
 * @param {string} password - The desired password.
 * @returns {WebDriver} - The WebDriver instance after submission.
 */
async function signup(driver, firstName, lastName, email, personNumber, username, password) {
  await driver.get('http://localhost:8080/signup');
  
  await driver.wait(until.elementLocated(By.name('firstName')), 5000).sendKeys(firstName);
  await driver.wait(until.elementLocated(By.name('lastName')), 5000).sendKeys(lastName);
  await driver.wait(until.elementLocated(By.name('email')), 5000).sendKeys(email);
  await driver.wait(until.elementLocated(By.name('personNumber')), 5000).sendKeys(personNumber);
  await driver.wait(until.elementLocated(By.name('username')), 5000).sendKeys(username);
  await driver.wait(until.elementLocated(By.name('password')), 5000).sendKeys(password);

  let signUpButton = await driver.findElement(By.css('.submit-button'));
  await signUpButton.click();

  await driver.wait(until.elementLocated(By.css('.success-message, .error-message')), 5000);

  return driver;
}

module.exports = { signup };
