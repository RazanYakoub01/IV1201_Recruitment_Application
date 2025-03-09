const { Builder, By, until, Key } = require('selenium-webdriver');
const { login } = require('./loginHelper');
const { signup } = require('./signupHelper');
const { expect, afterEach } = require('@jest/globals');

jest.setTimeout(30000);

/**
 * Test suite for ApplicantForm functionality.
 * Tests include validation for missing and invalid data in the applicant form.
 */

describe('ApplicantForm Tests', () => {
  let driver;

  /**
  * Initializes the WebDriver and logs in before tests.
  */
  beforeAll(async () => {
    console.log("Initializing the test suite...");
    driver = await new Builder().forBrowser('chrome').build();
    console.log("Launching browser...");
  
    const uniqueUsername = `user${Date.now()}`; 
    const password = 'password123';
    const firstName = 'John';
    const lastName = 'Doe';
    const email = `johndoe${Date.now()}@example.com`;
    const personNumber = '199001011234';
  
    await signup(driver, firstName, lastName, email, personNumber, uniqueUsername, password);
    console.log("Signed up successfully");
  
    await login(driver, uniqueUsername, password);
    console.log("Logged in successfully");
  
    await driver.wait(until.urlContains('/applicant'), 10000);
    console.log("Navigated to applicant page");
  });
  
  /**
  * Closes the browser after all tests are completed.
  */
  afterAll(async () => {
    console.log("Closing browser...");
    await driver.quit();
    console.log("Browser closed");
  });

  /**
  * Runs after each test to click the cancel button if found.
  * Waits for the cancel button, clicks it if located, and logs the action.
  * If the button is not found within 5 seconds, logs a skip message.
  */
  afterEach(async () => {
    try {
      const cancelButton = await driver.wait(until.elementLocated(By.css('.cancel-button')), 5000);
      console.log("Found cancel button");
  
      await cancelButton.click();
      console.log("Clicked cancel button");
    } catch (error) {
      console.log("Cancel button not found, skipping...");
    }
  });
  
  test('Should show error message for missing expertise and availability', async () => {
    console.log("Running test: Missing expertise and availability");

    const submitButton = await driver.wait(until.elementLocated(By.id('submit')), 10000);
    console.log("Found submit button");

    await submitButton.click();
    console.log("Clicked submit button");

    const errorMessage = await driver.wait(until.elementLocated(By.css('.error-message')), 10000);
    const errorText = await errorMessage.getText();
    console.log("Received error message: " + errorText);
    expect(errorText).toContain('Please add at least one competence and one availability period before submitting.');
  });

  test('Should show error message for missing expertise and experience', async () => {
    console.log("Running test: Missing expertise and experience");

    const addExpertiseButton = await driver.wait(until.elementLocated(By.css('.submit-button')), 10000);
    console.log("Found expertise button");

    const competenceDropdown = await driver.wait(until.elementLocated(By.css('.expertise-dropdown')), 10000);
    const experienceInput = await driver.wait(until.elementLocated(By.css('.expertise-dropdown[type="number"]')), 10000);

    await addExpertiseButton.click();
    console.log("Clicked add expertise button");

    const errorMessage = await driver.wait(until.elementLocated(By.css('.error-message')), 10000);
    const errorText = await errorMessage.getText();
    console.log("Received error message: " + errorText);
    expect(errorText).toContain('Please select a competence and years of experience.');
  });

  test('Should show error message for invalid years of experience', async () => {
    console.log("Running test: Invalid years of experience");

    const addExpertiseButton = await driver.wait(until.elementLocated(By.css('.submit-button')), 10000);
    console.log("Found expertise button");

    const competenceDropdown = await driver.wait(until.elementLocated(By.css('.expertise-dropdown')), 10000);
    const experienceInput = await driver.wait(until.elementLocated(By.css('.expertise-dropdown[type="number"]')), 10000);

    await competenceDropdown.sendKeys('ticket sales');
    await experienceInput.sendKeys('-1');
    console.log("Set invalid experience value: -1");

    await addExpertiseButton.click();
    console.log("Clicked add expertise button");

    const errorMessage = await driver.wait(until.elementLocated(By.css('.error-message')), 10000);
    const errorText = await errorMessage.getText();
    console.log("Received error message: " + errorText);
    expect(errorText).toContain('Please enter a valid number of years of experience between 0 and 99.');
  });

  test('Should show error message for missing availability dates', async () => {
    console.log("Running test: Missing availability dates");

    const addAvailabilityButton = await driver.wait(until.elementLocated(By.id('addAvailability')), 10000);
    const fromDateInput = await driver.wait(until.elementLocated(By.name('fromDate')), 10000);
    const toDateInput = await driver.wait(until.elementLocated(By.name('toDate')), 10000);

    await fromDateInput.clear();
    await toDateInput.clear();
    console.log("Cleared date fields");

    await addAvailabilityButton.click();
    console.log("Clicked add availability button");

    const errorMessage = await driver.wait(until.elementLocated(By.css('.error-message')), 10000);
    const errorText = await errorMessage.getText();
    console.log("Received error message: " + errorText);
    expect(errorText).toContain('Please provide both start and end dates.');
  });

  test('Should show error message for dates in the past', async () => {
    console.log("Running test: Dates in the past");

    const addAvailabilityButton = await driver.wait(until.elementLocated(By.id('addAvailability')), 10000);
    const fromDateInput = await driver.wait(until.elementLocated(By.name('fromDate')), 10000);
    const toDateInput = await driver.wait(until.elementLocated(By.name('toDate')), 10000);

    await fromDateInput.clear();
    await toDateInput.clear();
    console.log("Cleared date fields");

    const pastDate = '2020-01-01';
    await fromDateInput.sendKeys(pastDate);
    await toDateInput.sendKeys(pastDate);
    console.log("Set past dates: " + pastDate);

    await addAvailabilityButton.click();
    console.log("Clicked add availability button");

    const errorMessage = await driver.wait(until.elementLocated(By.css('.error-message')), 10000);
    const errorText = await errorMessage.getText();
    console.log("Received error message: " + errorText);
    expect(errorText).toContain('Dates cannot be in the past.');
  });

  test('Should show error message for invalid date range (From date > To date)', async () => {
    console.log("Running test: Invalid date range (From > To)");

    const addAvailabilityButton = await driver.wait(until.elementLocated(By.id('addAvailability')), 10000);
    const fromDateInput = await driver.wait(until.elementLocated(By.name('fromDate')), 10000);
    const toDateInput = await driver.wait(until.elementLocated(By.name('toDate')), 10000);
    
    await fromDateInput.sendKeys(Key.chord(Key.CONTROL, "a"), Key.BACK_SPACE);
    await toDateInput.sendKeys(Key.chord(Key.CONTROL, "a"), Key.BACK_SPACE);
    console.log("Cleared date fields");
  
    const invalidFromDate = '2025-06-01';
    const invalidToDate = '2025-05-01';

    await fromDateInput.sendKeys(invalidFromDate);
    await toDateInput.sendKeys(invalidToDate);

    console.log("Set invalid date range: From - " + invalidFromDate + " To - " + invalidToDate);

    await addAvailabilityButton.click();
    console.log("Clicked add availability button");

    const errorMessage = await driver.wait(until.elementLocated(By.css('.error-message')), 10000);
    const errorText = await errorMessage.getText();
    console.log("Received error message: " + errorText);
    expect(errorText).toContain('From date cannot be later than To date.');
  });

  test('Should show error message for invalid date format', async () => {
    console.log("Running test: Invalid date format");
  
    const addAvailabilityButton = await driver.wait(until.elementLocated(By.id('addAvailability')), 10000);
    const fromDateInput = await driver.wait(until.elementLocated(By.name('fromDate')), 10000);
    const toDateInput = await driver.wait(until.elementLocated(By.name('toDate')), 10000);
  
    await fromDateInput.sendKeys(Key.chord(Key.CONTROL, "a"), Key.BACK_SPACE);
    await toDateInput.sendKeys(Key.chord(Key.CONTROL, "a"), Key.BACK_SPACE);
    console.log("Cleared date fields");
  
    const invalidFromDate = '01-06-2025'; 
    const invalidToDate = '2025/05/01';  
  
    await fromDateInput.sendKeys(invalidFromDate);
    await toDateInput.sendKeys(invalidToDate);
    console.log("Set invalid date format: From - " + invalidFromDate + " To - " + invalidToDate);
  
    await addAvailabilityButton.click();
    console.log("Clicked add availability button");
  
    const errorMessage = await driver.wait(until.elementLocated(By.css('.error-message')), 10000);
    const errorText = await errorMessage.getText();
    console.log("Received error message: " + errorText);
    expect(errorText).toContain('Invalid date format. Use YYYY-MM-DD.');
  });

  
  test('Should cancel the form input and reset fields', async () => {
    console.log("Running test: Cancel form input and reset fields");

    const cancelButton = await driver.wait(until.elementLocated(By.css('.cancel-button')), 10000);
    console.log("Found cancel button");

    await cancelButton.click();
    console.log("Clicked cancel button");

    const expertiseList = await driver.wait(until.elementLocated(By.css('.expertise-list ul')), 10000);
    const expertiseItems = await expertiseList.findElements(By.css('li'));
    console.log("Expertise list items: " + expertiseItems.length);
    expect(expertiseItems.length).toBe(0);

    const availabilityList = await driver.wait(until.elementLocated(By.css('.availability-list ul')), 10000);
    const availabilityItems = await availabilityList.findElements(By.css('li'));
    console.log("Availability list items: " + availabilityItems.length);
    expect(availabilityItems.length).toBe(0);
  });

  test('Should fill in correct data and submit the form successfully', async () => {
    console.log("Running test: Fill in correct data and submit");

    const competenceDropdown = await driver.wait(until.elementLocated(By.css('.expertise-dropdown')), 10000);
    const experienceInput = await driver.wait(until.elementLocated(By.css('.expertise-dropdown[type="number"]')), 10000);
    const addButton = await driver.wait(until.elementLocated(By.css('.submit-button')), 10000);

    await competenceDropdown.sendKeys('ticket sales');
    await experienceInput.sendKeys('5');
    console.log("Selected expertise: ticket sales, experience: 5");

    await addButton.click();
    console.log("Clicked add expertise button");

    const fromDateInput = await driver.wait(until.elementLocated(By.name('fromDate')), 10000);
    const toDateInput = await driver.wait(until.elementLocated(By.name('toDate')), 10000);
    const addAvailabilityButton = await driver.wait(until.elementLocated(By.id('addAvailability')), 10000);

    await fromDateInput.clear();
    await toDateInput.clear();
    console.log("Cleared date fields");

    await fromDateInput.sendKeys('2025-05-05');
    await toDateInput.sendKeys('2025-06-06');
    console.log("Set valid dates: From - 2025-05-05, To - 2025-06-06");

    await addAvailabilityButton.click();
    console.log("Clicked add availability button");

    const submitButton = await driver.wait(until.elementLocated(By.id('submit')), 10000);
    await submitButton.click();
    console.log("Clicked submit button");

    const successMessage = await driver.wait(until.elementLocated(By.css('.success-message')), 10000);
    const successText = await successMessage.getText();
    console.log("Received success message: " + successText);
    expect(successText).toContain('Your application is under review!');
  });
});
