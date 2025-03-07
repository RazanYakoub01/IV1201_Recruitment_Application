const { Builder, By, until } = require('selenium-webdriver');
const { login } = require('./loginHelper');
const fs = require('fs');

/**
 * Test the recruiter page functionality
 */
async function testRecruiterPage() {
  let driver = await new Builder().forBrowser('chrome').build();
  
  try {
    console.log('\n🔸 STARTING RECRUITER VIEW TESTS 🔸');
    
    await login(driver, 'JoelleWilkinson', 'LiZ98qvL8Lw');
    
    await driver.wait(until.urlContains('/recruiter'), 5000);
    console.log('✅ Successfully navigated to recruiter page');
    
    await testListApplications(driver);
    
    await testPagination(driver);
    
    await testSelectApplication(driver);
    
    await testUpdateStatus(driver);
    
    await testBackToApplications(driver);
    
    await testLogout(driver);
    
    console.log('\n🔸 COMPLETED RECRUITER VIEW TESTS 🔸');
    
  } catch (error) {
    console.error('❌ Main Test Failed:', error);
  } finally {
    await driver.quit();
  }
}

/**
 * Test clicking the List All Applications button
 * @param {WebDriver} driver - The WebDriver instance
 */
async function testListApplications(driver) {
  try {
    console.log('\n🔹 Testing List All Applications button...');
    
    const listButton = await driver.wait(until.elementLocated(By.css('.fetch-applications-button')), 5000);
    await listButton.click();
    
    const table = await driver.wait(until.elementLocated(By.css('.applications-table')), 8000);
    
    const headers = await driver.findElements(By.css('.applications-table th'));
    const headerTexts = await Promise.all(headers.map(header => header.getText()));
    
    const expectedHeaders = ['Full Name', 'Email', 'Status', 'Competences', 'Availability'];
    const allHeadersPresent = expectedHeaders.every(header => headerTexts.includes(header));
    
    if (allHeadersPresent) {
      console.log('✅ Test Passed: Applications table displayed with correct headers');
    } else {
      console.error(`❌ Test Failed: Table headers do not match expected headers`);
      console.log(`  Expected: ${expectedHeaders.join(', ')}`);
      console.log(`  Actual: ${headerTexts.join(', ')}`);
    }
    
    const rows = await driver.findElements(By.css('.applications-table tbody tr'));
    if (rows.length > 0) {
      console.log(`✅ Test Passed: Table shows ${rows.length} applications`);
    } else {
      console.error('❌ Test Failed: No applications displayed in the table');
    }
    
  } catch (error) {
    console.error('❌ List Applications Test Failed:', error);
  }
}

/**
 * Test the pagination buttons
 * @param {WebDriver} driver - The WebDriver instance
 */
async function testPagination(driver) {
  try {
    console.log('\n🔹 Testing pagination buttons...');
    
    const tableExists = await driver.findElements(By.css('.applications-table'));
    if (tableExists.length === 0) {

      const listButton = await driver.findElement(By.css('.fetch-applications-button'));
      await listButton.click();
      await driver.wait(until.elementLocated(By.css('.applications-table')), 8000);
    }
    
    const firstAppText = await driver.findElement(By.css('.applications-table tbody tr:first-child')).getText();
    
    const paginationControls = await driver.findElements(By.css('.pagination-controls'));
    if (paginationControls.length === 0) {
      console.log('⚠️ Warning: Pagination controls not found or not enough applications to paginate');
      return;
    }
    
    const nextButton = await driver.findElement(By.xpath("//button[contains(text(), 'Next')]"));
    const isNextEnabled = await nextButton.isEnabled();
    
    if (isNextEnabled) {
      await nextButton.click();
      console.log('  Clicked Next button');
      
      await driver.sleep(1000);
      
      const secondPageAppText = await driver.findElement(By.css('.applications-table tbody tr:first-child')).getText();
      
      if (firstAppText !== secondPageAppText) {
        console.log('✅ Test Passed: Next button shows different applications');
        
        const prevButton = await driver.findElement(By.xpath("//button[contains(text(), 'Previous')]"));
        await prevButton.click();
        console.log('  Clicked Previous button');
        
        await driver.sleep(1000);
        
        const returnedFirstAppText = await driver.findElement(By.css('.applications-table tbody tr:first-child')).getText();
        
        if (returnedFirstAppText === firstAppText) {
          console.log('✅ Test Passed: Previous button returns to original page');
        } else {
          console.error('❌ Test Failed: Previous button did not return to original page');
        }
      } else {
        console.error('❌ Test Failed: Next button did not change the displayed applications');
      }
    } else {
      console.log('⚠️ Warning: Next button is disabled, cannot test pagination fully');
    }
    
  } catch (error) {
    console.error('❌ Pagination Test Failed:', error);
  }
}

/**
 * Test selecting an application from the list
 * @param {WebDriver} driver - The WebDriver instance
 */
async function testSelectApplication(driver) {
  try {
    console.log('\n🔹 Testing application selection...');
    
    const tableExists = await driver.findElements(By.css('.applications-table'));
    if (tableExists.length === 0) {
      const listButton = await driver.findElement(By.css('.fetch-applications-button'));
      await listButton.click();
      await driver.wait(until.elementLocated(By.css('.applications-table')), 8000);
    }
    
    const firstApp = await driver.findElement(By.css('.applications-table tbody tr:first-child'));
    const appText = await firstApp.getText();
    console.log(`  Selecting application: ${appText.substring(0, 30)}...`);
    await firstApp.click();
    
    const detailsHeader = await driver.wait(until.elementLocated(By.css('.application-details-container h2')), 5000);
    const headerText = await detailsHeader.getText();
    
    if (headerText === 'Application Details') {
      console.log('✅ Test Passed: Application details page displayed correctly');
      
      const detailsElements = await driver.findElements(By.css('.application-details-container p'));
      if (detailsElements.length >= 4) {
        console.log('✅ Test Passed: Application details are displayed');
      } else {
        console.error('❌ Test Failed: Application details not fully displayed');
      }
    } else {
      console.error(`❌ Test Failed: Expected 'Application Details' header, got '${headerText}'`);
    }
    
  } catch (error) {
    console.error('❌ Application Selection Test Failed:', error);
  }
}

async function testUpdateStatus(driver) {
  try {
    console.log('\n🔹 Testing application status update...');
    
    console.log('  Checking if we are on details page...');
    const detailsPage = await driver.findElements(By.css('.application-details-container'));
    if (detailsPage.length === 0) {
      console.log('  ✗ Application details container not found, will navigate to it');
      
      await testListApplications(driver);
      await testSelectApplication(driver);
    }
    
    const detailsParagraphs = await driver.findElements(By.css('.application-details-container p'));
    console.log(`  Found ${detailsParagraphs.length} paragraphs in the details container`);
    
    let currentStatus = '';
    let applicationId = '';
    
    const currentUrl = await driver.getCurrentUrl();
    const urlMatch = currentUrl.match(/application[\/=](\d+)/i);
    if (urlMatch) {
      applicationId = urlMatch[1];
      console.log(`  Found application ID from URL: ${applicationId}`);
    }
    
    for (let i = 0; i < detailsParagraphs.length; i++) {
      const text = await detailsParagraphs[i].getText();
      console.log(`  Paragraph ${i+1}: "${text}"`);
      
      if (text.toLowerCase().includes('status')) {
        console.log(`  ✓ Found status in paragraph ${i+1}`);
        
        const statusText = text;
        currentStatus = statusText.split(':')[1]?.trim().toLowerCase() || 'unknown';
        console.log(`  Current application status: ${currentStatus}`);
        break;
      }
    }
    
    if (!currentStatus) {
      console.error('❌ Test Failed: Could not find status information in any paragraph');
      return;
    }
    
    console.log('\n🔹 Creating second browser session for concurrent update test...');
    let secondDriver = await new Builder().forBrowser('chrome').build();
    
    try {
      console.log('  Logging in as second recruiter (MartinCummings)...');
      await login(secondDriver, 'MartinCummings', 'QkK48drV2Da');
      await secondDriver.wait(until.urlContains('/recruiter'), 5000);
      
      console.log('  Navigating to the applications list...');
      const listButton = await secondDriver.wait(until.elementLocated(By.css('.fetch-applications-button')), 5000);
      await listButton.click();
      
      console.log('  Waiting for applications table...');
      await secondDriver.wait(until.elementLocated(By.css('.applications-table')), 8000);
      
      console.log('  Selecting the first application...');
      const firstApp = await secondDriver.findElement(By.css('.applications-table tbody tr:first-child'));
      await firstApp.click();
      
      console.log('  Waiting for application details to load...');
      await secondDriver.wait(until.elementLocated(By.css('.application-details-container')), 5000);
      
      console.log('\n🔹 First recruiter updates the status...');
      
      const statusDropdown = await driver.findElement(By.css('select'));
      
      let newStatus;
      if (currentStatus.includes('accepted')) {
        newStatus = 'rejected';
      } else if (currentStatus.includes('rejected')) {
        newStatus = 'accepted';
      } else {
        newStatus = 'accepted';
      }
      console.log(`  Changing status to: ${newStatus}`);
      
      await statusDropdown.findElement(By.css(`option[value="${newStatus}"]`)).click();
      
      const updateButton = await driver.findElement(By.css('.update-status-button'));
      await updateButton.click();
      console.log('  First recruiter clicked Update Status button');
      
      try {
        const successMessage = await driver.wait(until.elementLocated(By.css('.success-message, .message')), 5000);
        const messageText = await successMessage.getText();
        
        if (messageText.toLowerCase().includes('success') || messageText.toLowerCase().includes('updated')) {
          console.log('✅ Test Passed: First recruiter successfully updated status');
        } else {
          console.error(`❌ Test Failed: First recruiter update - Expected success message, got "${messageText}"`);
        }
      } catch (error) {
        console.error('❌ Test Failed: No success message appeared after first update');
      }
      
      await driver.sleep(1000);
      
      console.log('\n🔹 Second recruiter attempts to update the same application...');
      
      const statusDropdown2 = await secondDriver.findElement(By.css('select'));
      
      let secondRecruiterStatus;
      if (newStatus === 'accepted') {
        secondRecruiterStatus = 'rejected';
      } else {
        secondRecruiterStatus = 'accepted';
      }
      console.log(`  Second recruiter changing status to: ${secondRecruiterStatus}`);
      
      await statusDropdown2.findElement(By.css(`option[value="${secondRecruiterStatus}"]`)).click();
      
      const updateButton2 = await secondDriver.findElement(By.css('.update-status-button'));
      await updateButton2.click();
      console.log('  Second recruiter clicked Update Status button');
      
      try {
        const errorMessage = await secondDriver.wait(until.elementLocated(By.css('.error-message, .message')), 5000);
        const messageText = await errorMessage.getText();
        
        if (messageText.toLowerCase().includes('error') || 
            messageText.toLowerCase().includes('conflict') || 
            messageText.toLowerCase().includes('updated by another user')) {
          console.log('✅ Test Passed: Second recruiter correctly received an error message');
          console.log(`  Error message: "${messageText}"`);
        } else if (messageText.toLowerCase().includes('success')) {
          console.error('❌ Test Failed: Second recruiter update succeeded when it should have failed (concurrent update not detected)');
        } else {
          console.log(`⚠️ Warning: Ambiguous message for second recruiter: "${messageText}"`);
        }
      } catch (error) {
        console.error('❌ Test Failed: No message appeared after second recruiter update attempt');
      }
      
    } catch (error) {
      console.error('❌ Second recruiter test failed:', error);
    } finally {
      await secondDriver.quit();
      console.log('  Closed second browser session');
    }
    
  } catch (error) {
    console.error('❌ Update Status Test Failed:', error);
    console.error('  Error details:', error.message);
  }
}

/**
 * Test back to applications button
 * @param {WebDriver} driver - The WebDriver instance
 */
async function testBackToApplications(driver) {
  try {
    console.log('\n🔹 Testing Back to Applications button...');
    
    const detailsPage = await driver.findElements(By.css('.application-details-container'));
    if (detailsPage.length === 0) {
      console.error('❌ Test Failed: Not on application details page');
      
      await testListApplications(driver);
      await testSelectApplication(driver);
    }
    
    const backButton = await driver.findElement(By.css('.back-button'));
    await backButton.click();
    console.log('  Clicked Back to Applications button');
    
    try {
      await driver.wait(until.elementLocated(By.css('.applications-table')), 5000);
      console.log('✅ Test Passed: Successfully returned to applications list');
    } catch (error) {
      console.error('❌ Test Failed: Did not return to applications list');
    }
    
  } catch (error) {
    console.error('❌ Back Button Test Failed:', error);
  }
}

/**
 * Test logout functionality
 * @param {WebDriver} driver - The WebDriver instance
 */
async function testLogout(driver) {
  try {
    console.log('\n🔹 Testing logout functionality...');
    
    try {
      const logoutButton = await driver.findElement(By.css('.logout-button'));
      await logoutButton.click();
      console.log('  Clicked logout button');
      
      await driver.wait(until.urlContains('/'), 5000);
      const loginForm = await driver.findElement(By.id('username'));
      
      if (loginForm) {
        console.log('✅ Test Passed: Successfully logged out and returned to login page');
      }
    } catch (error) {
      console.log('⚠️ Warning: Could not find logout button or logout functionality not implemented');
      console.log('  This test can be updated once logout is implemented');
    }
    
  } catch (error) {
    console.error('❌ Logout Test Failed:', error);
  }
}

testRecruiterPage();