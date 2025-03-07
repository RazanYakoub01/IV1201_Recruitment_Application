const { Builder, By, until } = require('selenium-webdriver');
const { Browser } = require('selenium-webdriver');

describe('Login', () => {
  let driver;

  // Setup before tests run
  beforeAll(async () => {
    driver = await new Builder().forBrowser(Browser.CHROME).build();
  });

  // Cleanup after tests complete
  afterAll(async () => {
    await driver.quit();
  });

  test('Sign in with invalid credentials', async () => {
    await driver.get('http://localhost:8080/');
    const usernameField = await driver.findElement(By.id('username'));
    const passwordField = await driver.findElement(By.id('password'));
    await usernameField.sendKeys("foo");
    await passwordField.sendKeys("bar");
    const signInButton = await driver.findElement(By.css('.submit-button'));
    await signInButton.click();

    const errorMessage = await driver.wait(until.elementLocated(By.css('.error-message')), 3000)
    expect(errorMessage).toBeTruthy();
    const errorMessageTest = await errorMessage.getText();
    expect(errorMessageTest).toBe("Invalid username or password");
  });

  test('signup button redirect to signup page', async () => {
    await driver.get('http://localhost:8080/');
    await driver.wait(until.elementLocated(By.xpath("//button[contains(text(),'Sign Up')]")), 5000);
    const signUpButton = await driver.findElement(By.xpath("//button[contains(text(),'Sign Up')]"));
    await signUpButton.click();

    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toBe('http://localhost:8080/signup');
  });

  test('restore button redirect to restore page', async () => {
    await driver.get('http://localhost:8080/');
    const restoreButton = await driver.findElement(By.xpath("//button[contains(text(),'Forgot Username or Password?')]"));
    await restoreButton.click();

    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toBe('http://localhost:8080/restore');
  });

  test('Sign in with valid applicant credentials', async () => {
    await driver.get('http://localhost:8080/');
    const usernameField = await driver.findElement(By.id('username'));
    const passwordField = await driver.findElement(By.id('password'));
    await usernameField.sendKeys("testuser1");
    await passwordField.sendKeys("test1234");
    const signInButton = await driver.findElement(By.css('.submit-button'));
    await signInButton.click();

    await driver.wait(until.alertIsPresent(), 5000);

    const alert = await driver.switchTo().alert();
    const alertText = await alert.getText();
    expect(alertText).toContain('Login successful!');
  
    await alert.accept();

    const applicantSpecificElement = await driver.wait(until.elementLocated(By.css('h3')), 5000);
    const applicantGreeting = await applicantSpecificElement.getText();
    expect(applicantGreeting).toContain('Hello, testuser1!');
  });

});