const { Builder, By, until } = require('selenium-webdriver');

/**
 * Function to correctly set a date in a React-controlled <input type="date"> field.
 */
async function setReactDateInput(driver, dateInputElement, dateString) {
  // Use JavaScript to directly set the date value and manually trigger events
  await driver.executeScript(`
    arguments[0].value = arguments[1]; 
    arguments[0].dispatchEvent(new Event('input', { bubbles: true })); 
    arguments[0].dispatchEvent(new Event('change', { bubbles: true })); 
  `, dateInputElement, dateString);
}

/**
 * Logs in as an applicant and navigates to the applicant page.
 */
async function loginAsApplicant() {
  let driver = await new Builder().forBrowser('chrome').build();
  try {
    console.log(`🔹 Logging in as applicant...`);
    await driver.get('http://localhost:8080/');

    let usernameField = await driver.wait(until.elementLocated(By.id('username')), 5000);
    await usernameField.sendKeys('testuserselenium');

    let passwordField = await driver.wait(until.elementLocated(By.id('password')), 5000);
    await passwordField.sendKeys('password123');

    let signInButton = await driver.findElement(By.css('.submit-button'));
    await signInButton.click();

    await driver.wait(until.urlContains('/applicant'), 5000);

    return driver;
  } catch (error) {
    console.error('❌ Login Test Failed:', error);
    await driver.quit();
  }
}

/**
 * Test case: Successfully submit an application with valid data.
 */
async function testSuccessfulApplication() {
  let driver = await loginAsApplicant();
  if (!driver) return;

  try {
    console.log(`🔹 Running test for successful application submission...`);

    // Select competence
    let competenceDropdown = await driver.wait(until.elementLocated(By.css('select.expertise-dropdown')), 5000);
    await competenceDropdown.click();
    let option = await driver.wait(until.elementLocated(By.css('select.expertise-dropdown option[value="1"]')), 5000);
    await option.click();

    // Input years of experience
    let experienceField = await driver.wait(until.elementLocated(By.css('input[type="number"]')), 5000);
    await experienceField.sendKeys('3');

    // Add expertise
    let addExpertiseButton = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Add Expertise')]")), 5000);
    await addExpertiseButton.click();

    // Wait to ensure expertise is added
    await driver.wait(until.elementLocated(By.css('.expertise-list li')), 5000);
    console.log("✅ Expertise added successfully");

    // Define correct hardcoded date values
    let fromDateString = "2025-06-01";
    let toDateString = "2025-06-28";

    // Locate date input fields
    let fromDate = await driver.wait(until.elementLocated(By.css('input[type="date"]:nth-of-type(1)')), 5000);
    let toDate = await driver.wait(until.elementLocated(By.css('input[type="date"]:nth-of-type(2)')), 5000);

    console.log(`🔹 Setting date values properly using JavaScript...`);

    // Use JavaScript to set values properly
    await setReactDateInput(driver, fromDate, fromDateString);
    await setReactDateInput(driver, toDate, toDateString);

    // Wait a bit to allow UI update
    await driver.sleep(1000);

    // Verify the values were correctly entered
    let enteredFromDate = await fromDate.getAttribute("value");
    let enteredToDate = await toDate.getAttribute("value");
    console.log(`🔹 After Input -> From: ${enteredFromDate}, To: ${enteredToDate}`);

    // Click "Add Availability"
    let addAvailabilityButton = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Add Availability')]")), 5000);
    await addAvailabilityButton.click();

    // Wait to ensure availability is added
    await driver.wait(until.elementLocated(By.css('.availability-list li')), 5000);
    console.log("✅ Availability added successfully");

    // Submit application
    let submitButton = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Submit Application')]")), 5000);
    await submitButton.click();

    // Wait for success message
    let successMessage = await driver.wait(until.elementLocated(By.css('.success-message h3')), 10000);
    let text = await successMessage.getText();

    if (text.includes('Your application is under review!')) {
      console.log(`✅ Test Passed: Application submitted successfully.`);
    } else {
      console.error(`❌ Test Failed: Expected success message not found.`);
    }
  } catch (error) {
    console.error('❌ Test Failed:', error);
  } finally {
    await driver.quit();
  }
}

/**
 * Run all test cases.
 */
(async function runTests() {
  await testSuccessfulApplication();
})();
