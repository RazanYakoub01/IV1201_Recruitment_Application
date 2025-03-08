const { Builder, By, until } = require('selenium-webdriver');

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
