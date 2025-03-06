const { Builder, By, until } = require('selenium-webdriver');
const { login } = require('./loginHelper'); // Import login helper

async function testRecruiterPage() {
  let driver = await new Builder().forBrowser('chrome').build();
  try {
    console.log('🔹 Running test for recruiter page...');
    
    // Use the login helper to log in before testing the recruiter page
    await login(driver, 'JoelleWilkinson', 'LiZ98qvL8Lw');

    // Wait for the recruiter page to load after login
    await driver.wait(until.urlContains('/recruiter'), 5000);
    console.log('✅ Successfully navigated to recruiter page.');

  } catch (error) {
    console.error('❌ Test Failed:', error);
  } finally {
    await driver.quit();
  }
}

// Run the recruiter page test
testRecruiterPage();
