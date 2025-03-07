const { exec } = require('child_process');

/**
 * List of test files to run sequentially.
 * Each test file should be a JavaScript file that can be run with Node.js.
 * The files will be executed in the order they appear in this array.
 * 
 * @type {string[]}
 */
const testFiles = [
  './tests/login.test.js',  
  './tests/signup.test.js', 
  './tests/applicant.test.js',  
  './tests/recruiter.test.js', 
];

/**
 * Runs all test files sequentially by invoking each one through Node.js.
 * It executes the test files in the order they are listed in the `testFiles` array.
 * If a test fails, it logs the error and moves on to the next test.
 * If all tests pass, it will log a completion message once all tests have been executed.
 */
function runTests() {
  let testIndex = 0;

  /**
   * Executes the next test file in the `testFiles` array.
   * This function is called recursively after each test file finishes.
   * 
   * If a test completes successfully, it moves on to the next one.
   * If there is an error, it logs the error and continues with the next test.
   */
  function runNextTest() {
    if (testIndex < testFiles.length) {
      const currentTestFile = testFiles[testIndex];
      
      console.log(`🔹 Running test file: ${currentTestFile}`);
      
      exec(`node ${currentTestFile}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`❌ Error running ${currentTestFile}:`, error);
          return;
        }
        
        console.log(stdout);
        
        if (stderr) {
          console.error(stderr);
        }

        testIndex++;
        runNextTest();
      });
    } else {
      console.log('🎉 All System tests completed!');
    }
  }

  runNextTest();
}

runTests();
