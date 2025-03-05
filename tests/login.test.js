const { Builder, By, until } = require('selenium-webdriver');

/**
 * Test the login functionality of the application by verifying different credentials.
 * @param {string} username - The username input for login.
 * @param {string} password - The password input for login.
 * @param {string} expectedError - The expected error message if login fails.
 * @param {string} expectedWelcomeMessage - The expected welcome message if login is successful.
 * @param {string} expectedPageUrl - The expected page URL after login.
 */
async function testLogin(username, password, expectedError, expectedWelcomeMessage, expectedPageUrl) {
  let driver = await new Builder().forBrowser('chrome').build();
  try {
    console.log(`\n🔹 Running test with username: '${username}' | password: '${password}'`);
    await driver.get('http://localhost:8080/');

    let usernameField = await driver.wait(until.elementLocated(By.id('username')), 5000);
    if (username) await usernameField.sendKeys(username);

    let passwordField = await driver.wait(until.elementLocated(By.id('password')), 5000);
    if (password) await passwordField.sendKeys(password);

    let signInButton = await driver.findElement(By.css('.submit-button'));
    await signInButton.click();

    if (expectedError) {
      let errorMessage = await driver.wait(until.elementLocated(By.css('.error-message')), 5000);
      let text = await errorMessage.getText();
      if (text.includes(expectedError)) {
        console.log(`✅ Test Passed: Expected error message '${expectedError}' displayed.`);
      } else {
        console.error(`❌ Test Failed: Expected '${expectedError}', but got '${text}'.`);
      }
    } else {
      await driver.wait(until.urlContains(expectedPageUrl), 5000);

      let currentUrl = await driver.getCurrentUrl();
      if (currentUrl.includes(expectedPageUrl)) {
        console.log(`✅ Test Passed: Correct URL '${expectedPageUrl}' after login.`);
      } else {
        console.error(`❌ Test Failed: Expected '${expectedPageUrl}', but got '${currentUrl}'.`);
      }

      if (expectedPageUrl === '/applicant') {
        let applicantSpecificElement = await driver.wait(until.elementLocated(By.css('h3')), 5000);
        let applicantGreeting = await applicantSpecificElement.getText();
        if (applicantGreeting.includes(`Hello, ${username}!`)) {
          console.log('✅ Test Passed: Found correct greeting message on applicant page!');
        } else {
          console.error(`❌ Test Failed: Expected 'Hello, ${username}!' on applicant page, but got '${applicantGreeting}'.`);
        }
      }

      if (expectedPageUrl === '/recruiter') {
        let welcomeMessage = await driver.wait(until.elementLocated(By.css('.recruiter-header')), 5000);
        let welcomeText = await welcomeMessage.getText();
        if (welcomeText.includes(expectedWelcomeMessage)) {
            console.log(`✅ Test Passed: Successfully logged in and found welcome message: '${expectedWelcomeMessage}'`);
        } else {
            console.error(`❌ Test Failed: Expected '${expectedWelcomeMessage}', but got '${welcomeText}'.`);
        }
      }
    }
  } catch (error) {
    console.error('❌ Test Failed:', error);
  } finally {
    await driver.quit();
  }
}

/**
 * Test the "Sign Up" button by checking if it navigates to the sign-up page.
 */
async function testSignUp() {
  let driver = await new Builder().forBrowser('chrome').build();
  try {
    console.log(`\n🔹 Running test for "Sign Up" button`);
    await driver.get('http://localhost:8080/');

    let signUpButton = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(),'Sign Up')]")), 5000);
    await signUpButton.click();

    let currentUrl = await driver.getCurrentUrl();
    if (currentUrl.includes('/signup')) {
      console.log(`✅ Test Passed: Correct URL '/signup' after clicking "Sign Up" button.`);
    } else {
      console.error(`❌ Test Failed: Expected '/signup', but got '${currentUrl}'.`);
    }

    let signUpTitle = await driver.wait(until.elementLocated(By.css('.signup-title')), 5000);
    let titleText = await signUpTitle.getText();
    if (titleText.includes('Create an Account')) {
      console.log(`✅ Test Passed: Found correct "Create an Account" title on the Sign Up page.`);
    } else {
      console.error(`❌ Test Failed: Expected 'Create an Account', but got '${titleText}'.`);
    }
  } catch (error) {
    console.error('❌ Test Failed:', error);
  } finally {
    await driver.quit();
  }
}

/**
 * Test the "Forgot Username or Password?" button by checking if it navigates to the restore page.
 */
async function testRestore() {
  let driver = await new Builder().forBrowser('chrome').build();
  try {
    console.log(`\n🔹 Running test for "Forgot Username or Password?" button`);
    await driver.get('http://localhost:8080/');

    let forgotButton = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(),'Forgot Username or Password?')]")), 5000);
    await forgotButton.click();

    let currentUrl = await driver.getCurrentUrl();
    if (currentUrl.includes('/restore')) {
      console.log(`✅ Test Passed: Correct URL '/restore' after clicking "Forgot Username or Password?" button.`);
    } else {
      console.error(`❌ Test Failed: Expected '/restore', but got '${currentUrl}'.`);
    }

    let restoreTitle = await driver.wait(until.elementLocated(By.css('.restore-header')), 5000);
    let restoreText = await restoreTitle.getText();
    if (restoreText.includes('Reset Your Credentials')) {
      console.log(`✅ Test Passed: Found correct "Reset Your Credentials" title on the Restore page.`);
    } else {
      console.error(`❌ Test Failed: Expected 'Reset Your Credentials', but got '${restoreText}'.`);
    }
  } catch (error) {
    console.error('❌ Test Failed:', error);
  } finally {
    await driver.quit();
  }
}

/**
 * Run all the defined test cases for login, sign-up, and password restore functionality.
 */
(async function runTests() {
  // Test invalid credentials
  await testLogin('invalidUser', 'wrongPassword', 'Invalid username or password', null, null); 

  // Test missing username
  await testLogin('', 'somePassword', 'Username is required', null, null); 
  
  // Test missing password
  await testLogin('validUser', '', 'Password is required', null, null); 
  
  // Test missing both username and password
  await testLogin('', '', 'Username is required', null, null); 

  // Test successful login for JoelleWilkinson
  await testLogin('JoelleWilkinson', 'LiZ98qvL8Lw', null, 'Welcome, JoelleWilkinson!', '/recruiter');

  // Test successful login for testuserselenium with applicant page
  await testLogin('testuserselenium', 'password123', null, 'Hello, testuserselenium!', '/applicant');

  // Test "Sign Up" button
  await testSignUp();

  // Test "Forgot Username or Password?" button
  await testRestore();
})();
