const { Builder, By, until } = require('selenium-webdriver');
const { login } = require('./loginHelper');
const { expect } = require('@jest/globals');


jest.setTimeout(30000);

/**
 * Test the recruiter page functionality
 */
describe('Recruiter Page Tests', () => {
  let driver;

  beforeAll(async () => {
    driver = await new Builder().forBrowser('chrome').build();
    await login(driver, 'JoelleWilkinson', 'LiZ98qvL8Lw');
    await driver.wait(until.urlContains('/recruiter'), 5000);
  });

  afterAll(async () => {
    await driver.quit();
  });

  test('List All Applications button', async () => {
    const listButton = await driver.wait(until.elementLocated(By.css('.fetch-applications-button')), 5000);
    await listButton.click();

    const table = await driver.wait(until.elementLocated(By.css('.applications-table')), 8000);

    const headers = await driver.findElements(By.css('.applications-table th'));
    const headerTexts = await Promise.all(headers.map(header => header.getText()));

    const expectedHeaders = ['Full Name', 'Email', 'Status', 'Competences', 'Availability'];
    const allHeadersPresent = expectedHeaders.every(header => headerTexts.includes(header));

    expect(allHeadersPresent).toBe(true);

    const rows = await driver.findElements(By.css('.applications-table tbody tr'));
    expect(rows.length).toBeGreaterThan(0);
  });

  test('Pagination buttons functionality', async () => {
    const paginationControls = await driver.findElements(By.css('.pagination-controls'));
    if (paginationControls.length === 0) {
      return expect(paginationControls.length).toBeGreaterThan(0);
    }
  
    const firstAppText = await driver.findElement(By.css('.applications-table tbody tr:first-child')).getText();
    const nextButton = await driver.findElement(By.id("next"));
    const isNextEnabled = await nextButton.isEnabled();
    
    if (isNextEnabled) {
      await driver.sleep(3000); 
      await nextButton.click();
      await driver.sleep(3000);
      const secondPageAppText = await driver.findElement(By.css('.applications-table tbody tr:first-child')).getText();
      expect(firstAppText).not.toBe(secondPageAppText);
    } else {
      expect(isNextEnabled).toBe(true);
    }
  });
  
  test('Select an application', async () => {
    const firstApp = await driver.findElement(By.css('.applications-table tbody tr:first-child'));
    await firstApp.click();

    const detailsHeader = await driver.wait(until.elementLocated(By.css('.application-details-container h2')), 5000);
    const headerText = await detailsHeader.getText();
    expect(headerText).toBe('Application Details');

    const detailsElements = await driver.findElements(By.css('.application-details-container p'));
    expect(detailsElements.length).toBeGreaterThanOrEqual(4);
  });

  test('Update application status - concurrent update scenario', async () => {
    await driver.get('https://iv1201-recruitment-application-frontend.onrender.com/recruiter'); 
    
    const firstListButton = await driver.wait(until.elementLocated(By.css('.fetch-applications-button')), 5000);
    await firstListButton.click();
    await driver.wait(until.elementLocated(By.css('.applications-table')), 8000);
    
    const firstRecruiterApp = await driver.findElement(By.css('.applications-table tbody tr:first-child'));
    await firstRecruiterApp.click();
    await driver.wait(until.elementLocated(By.css('.application-details-container')), 5000);
    
    const currentUrl = await driver.getCurrentUrl();
    const urlMatch = currentUrl.match(/application[\/=](\d+)/i);
    let applicationId = '';
    if (urlMatch) {
      applicationId = urlMatch[1];
      console.log(`First recruiter viewing application ID: ${applicationId}`);
    }
    
    let secondDriver = await new Builder().forBrowser('chrome').build();
    try {
      await login(secondDriver, 'MartinCummings', 'QkK48drV2Da');
      
      try {
        await secondDriver.wait(until.alertIsPresent(), 3000);
        const alert = await secondDriver.switchTo().alert();
        await alert.accept();
      } catch (error) {
        console.log('No alert present for second recruiter, continuing...');
      }
      await secondDriver.wait(until.urlContains('/recruiter'), 5000);
      
      const listButton = await secondDriver.wait(until.elementLocated(By.css('.fetch-applications-button')), 5000);
      await listButton.click();
      await secondDriver.wait(until.elementLocated(By.css('.applications-table')), 8000);
      
      const firstApp = await secondDriver.findElement(By.css('.applications-table tbody tr:first-child'));
      await firstApp.click();
      await secondDriver.wait(until.elementLocated(By.css('.application-details-container')), 5000);
      
      const secondRecruiterUrl = await secondDriver.getCurrentUrl();
      console.log(`Second recruiter URL: ${secondRecruiterUrl}`);
      
      const detailsParagraphs = await driver.findElements(By.css('.application-details-container p'));
      let firstRecruiterStatus = '';
      
      for (let i = 0; i < detailsParagraphs.length; i++) {
        const text = await detailsParagraphs[i].getText();
        if (text.toLowerCase().includes('status')) {
          firstRecruiterStatus = text.split(':')[1]?.trim().toLowerCase() || 'unknown';
          console.log(`First recruiter sees status: ${firstRecruiterStatus}`);
          break;
        }
      }
      expect(firstRecruiterStatus).not.toBe('unknown');
      
      const secondDetailsParas = await secondDriver.findElements(By.css('.application-details-container p'));
      let secondRecruiterInitialStatus = '';
      
      for (let i = 0; i < secondDetailsParas.length; i++) {
        const text = await secondDetailsParas[i].getText();
        if (text.toLowerCase().includes('status')) {
          secondRecruiterInitialStatus = text.split(':')[1]?.trim().toLowerCase() || 'unknown';
          console.log(`Second recruiter sees status: ${secondRecruiterInitialStatus}`);
          break;
        }
      }
      expect(secondRecruiterInitialStatus).not.toBe('unknown');
      
      const statusDropdown = await driver.findElement(By.css('select'));
      const newStatus = firstRecruiterStatus === 'accepted' ? 'rejected' : 'accepted';
      console.log(`First recruiter changing status to: ${newStatus}`);
      
      await statusDropdown.findElement(By.css(`option[value="${newStatus}"]`)).click();
      const updateButton = await driver.findElement(By.css('.update-status-button'));
      await updateButton.click();
      
      const successMessage = await driver.wait(until.elementLocated(By.css('.success-message, .message')), 5000);
      const messageText = await successMessage.getText();
      console.log(`First recruiter received message: ${messageText}`);
      expect(messageText.toLowerCase()).toContain('success');
      
      const statusDropdown2 = await secondDriver.findElement(By.css('select'));
      const secondRecruiterNewStatus = secondRecruiterInitialStatus === 'accepted' ? 'rejected' : 'accepted';
      console.log(`Second recruiter changing status to: ${secondRecruiterNewStatus}`);
      
      await statusDropdown2.findElement(By.css(`option[value="${secondRecruiterNewStatus}"]`)).click();
      const updateButton2 = await secondDriver.findElement(By.css('.update-status-button'));
      await updateButton2.click();
      
      const errorMessage = await secondDriver.wait(until.elementLocated(By.css('.error-message, .message')), 5000);
      const errorText = await errorMessage.getText();
      console.log(`Second recruiter received message: ${errorText}`);
      expect(errorText.toLowerCase()).toContain('abort');
    } finally {
      await secondDriver.quit();
    }
  });

  test('Back to applications button', async () => {
    const detailsPage = await driver.findElements(By.css('.application-details-container'));
    if (detailsPage.length === 0) {
      await driver.findElement(By.css('.fetch-applications-button')).click();
      await driver.wait(until.elementLocated(By.css('.applications-table')), 8000);
      await driver.findElement(By.css('.applications-table tbody tr:first-child')).click();
    }

    const backButton = await driver.findElement(By.css('.back-button'));
    await backButton.click();
    await driver.wait(until.elementLocated(By.css('.applications-table')), 5000);
    const table = await driver.findElements(By.css('.applications-table'));
    expect(table.length).toBeGreaterThan(0);
  });

  test('Logout functionality', async () => {
    const logoutButton = await driver.findElement(By.css('.logout-button'));
    await logoutButton.click();

    await driver.wait(until.urlContains('/'), 5000);
    const loginForm = await driver.findElement(By.id('username'));
    expect(loginForm).toBeTruthy();
  });
});