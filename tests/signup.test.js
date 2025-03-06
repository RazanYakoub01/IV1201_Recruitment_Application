const { Builder, By, until } = require('selenium-webdriver');

/**
 * Function to test the sign-up functionality of the web application.
 */
async function testSignUp() {
  let driver = await new Builder().forBrowser('chrome').build();
  
  try {
    console.log(`\n🔹 Running Sign-Up Tests`);
    await driver.get('http://localhost:8080/signup');

    /**
     * Fills the sign-up form dynamically with given user details.
     * @param {Object} userData - Object containing user details.
     * @param {string} [userData.firstName] - First name of the user.
     * @param {string} [userData.lastName] - Last name of the user.
     * @param {string} [userData.email] - Email of the user.
     * @param {string} [userData.personNumber] - Personal number of the user.
     * @param {string} [userData.username] - Username of the user.
     * @param {string} [userData.password] - Password of the user.
     */
    async function fillSignUpForm({ firstName, lastName, email, personNumber, username, password }) {
      if (firstName !== undefined) await driver.findElement(By.name('firstName')).sendKeys(firstName);
      if (lastName !== undefined) await driver.findElement(By.name('lastName')).sendKeys(lastName);
      if (email !== undefined) await driver.findElement(By.name('email')).sendKeys(email);
      if (personNumber !== undefined) await driver.findElement(By.name('personNumber')).sendKeys(personNumber);
      if (username !== undefined) await driver.findElement(By.name('username')).sendKeys(username);
      if (password !== undefined) await driver.findElement(By.name('password')).sendKeys(password);
      
      let signUpButton = await driver.findElement(By.css('.submit-button'));
      await signUpButton.click();

      await driver.wait(until.elementLocated(By.css('.success-message, .error-message')), 5000);
    }

    /**
     * Checks if the expected error message appears on the page.
     * @param {string} expectedError - The expected error message text.
     * @returns {Promise<boolean>} - Returns true if the error message is found, otherwise false.
     */
    async function checkForErrorMessage(expectedError) {
      let errorElements = await driver.findElements(By.css('.error-message'));
      for (let element of errorElements) {
        let errorText = await element.getText();
        if (errorText.includes(expectedError)) {
          console.log(`✅ Test Passed: Error message '${expectedError}' displayed correctly.`);
          return true;
        }
      }
      console.error(`❌ Test Failed: Expected error message '${expectedError}' not found.`);
      return false;
    }

    /**
     * TEST CASES
     */

    // ✅ Test Case 1: Successful Signup
    console.log("\n🔹 Testing Successful Signup...");
    await fillSignUpForm({
      firstName: 'John',
      lastName: 'Doe',
      email: `johndoe${Date.now()}@example.com`,
      personNumber: '199001011234',
      username: `john_doe${Date.now()}`, 
      password: 'Password123!'
    });
    let successMessage = await driver.findElements(By.css('.success-message'));
    if (successMessage.length > 0) {
      console.log('✅ Test Passed: Account created successfully!');
    } else {
      console.error('❌ Test Failed: No success message after signup.');
    }
    await driver.navigate().refresh();

    // ❌ Test Case 2: Duplicate Username
    console.log("\n🔹 Testing Duplicate Username...");
    await fillSignUpForm({
      firstName: 'John',
      lastName: 'Doe',
      email: `johndoe${Date.now()}@example.com`,
      personNumber: '199001011234',
      username: 'john_doe', // Reuse username
      password: 'Password123!'
    });
    await checkForErrorMessage('This username is already taken');
    await driver.navigate().refresh();

    // ❌ Test Case 3: Missing First Name
    console.log("\n🔹 Testing Missing First Name...");
    await fillSignUpForm({
      lastName: 'Doe',
      email: `johndoe${Date.now()}@example.com`,
      personNumber: '199001011234',
      username: `john_doe${Date.now()}`,
      password: 'Password123!'
    });
    await checkForErrorMessage('First name is required');
    await driver.navigate().refresh();

    // ❌ Test Case 4: Missing Last Name
    console.log("\n🔹 Testing Missing Last Name...");
    await fillSignUpForm({
      firstName: 'John',
      email: `johndoe${Date.now()}@example.com`,
      personNumber: '199001011234',
      username: `john_doe${Date.now()}`,
      password: 'Password123!'
    });
    await checkForErrorMessage('Last name is required');
    await driver.navigate().refresh();

    // ❌ Test Case 5: Missing Email
    console.log("\n🔹 Testing Missing Email...");
    await fillSignUpForm({
      firstName: 'John',
      lastName: 'Doe',
      personNumber: '199001011234',
      username: `john_doe${Date.now()}`,
      password: 'Password123!'
    });
    await checkForErrorMessage('Invalid email format'); 
    await driver.navigate().refresh();

    // ❌ Test Case 6: Missing Username
    console.log("\n🔹 Testing Missing Username...");
    await fillSignUpForm({
      firstName: 'John',
      lastName: 'Doe',
      email: `johndoe${Date.now()}@example.com`,
      personNumber: '199001011234',
      password: 'Password123!'
    });
    await checkForErrorMessage('Username must be at least 3 characters');
    await driver.navigate().refresh();
   
    // ❌ Test Case 7: Missing Password
    console.log("\n🔹 Testing Missing Password...");
    await fillSignUpForm({
      firstName: 'John',
      lastName: 'Doe',
      email: `johndoe${Date.now()}@example.com`,
      personNumber: '199001011234',
      username: `john_doe${Date.now()}`
    });
    await checkForErrorMessage('Password must be at least 8 characters'); 
    await driver.navigate().refresh();

    // ❌ Test Case 8: Missing All Fields
    console.log("\n🔹 Testing Missing All Fields...");
    await fillSignUpForm({});
    await checkForErrorMessage('First name is required');
    await checkForErrorMessage('Last name is required');
    await checkForErrorMessage('Invalid email format');
    await checkForErrorMessage('Personal number must be exactly 12 digits');
    await checkForErrorMessage('Username must be at least 3 characters');
    await checkForErrorMessage('Password must be at least 8 characters');
    await driver.navigate().refresh();

    // ❌ Test Case 9: Invalid Personal Number
    console.log("\n🔹 Testing Invalid Personal Number...");
    await fillSignUpForm({
      firstName: 'John',
      lastName: 'Doe',
      email: `johndoe${Date.now()}@example.com`,
      personNumber: 'abcd1234efgh', 
      username: `john_doe${Date.now()}`,
      password: 'Password123!'
    });
    await checkForErrorMessage('Personal number must be exactly 12 digits long and contain only numbers.');
    await driver.navigate().refresh();

    // ❌ Test Case 10: Invalid Email Format
    console.log("\n🔹 Testing Invalid Email Format...");
    await fillSignUpForm({
      firstName: 'John',
      lastName: 'Doe',
      email: 'invalid_email_format',
      personNumber: '199001011234',
      username: `john_doe${Date.now()}`,
      password: 'Password123!'
    });
    await checkForErrorMessage('Invalid email format');
    await driver.navigate().refresh();

    // ❌ Test Case 11: Short Password
    console.log("\n🔹 Testing Short Password...");
    await fillSignUpForm({
      firstName: 'John',
      lastName: 'Doe',
      email: `johndoe${Date.now()}@example.com`,
      personNumber: '199001011234',
      username: `john_doe${Date.now()}`,
      password: 'pass'
    });
    await checkForErrorMessage('Password must be at least 8 characters');
    await driver.navigate().refresh();

    // ✅ Test Case 12: Testing Going Back to Login
    console.log("\n🔹 Testing Going Back to Login...");
    let goBackButton = await driver.findElement(By.name('goBackToSignIn'));
    await goBackButton.click();
    await driver.wait(until.elementLocated(By.css('.login-title')), 5000);
    let currentUrl = await driver.getCurrentUrl();
    let loginTitle = await driver.findElement(By.css('.login-title'));
    let titleText = await loginTitle.getText();

    if (currentUrl === 'http://localhost:8080/' && titleText === 'Sign in to your account') {
      console.log('✅ Test Passed: Successfully navigated to the login page and Login title is displayed correctly.');
    } else {
      console.error(`❌ Test Failed: Incorrect URL after clicking the "Go back to sign in" button. Expected "/" but got ${currentUrl}. And Incorrect login title. Expected 'Sign in to your account' but got ${titleText}`);
    }
    await driver.navigate().refresh();


    console.log("\n🎉 All tests completed!");

  } catch (error) {
    console.error('❌ Test Failed:', error);
  } finally {
    await driver.quit();
  }
}

testSignUp();
