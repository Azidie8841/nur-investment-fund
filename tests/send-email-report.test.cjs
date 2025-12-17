/**
 * Tests for Send Email Report Button
 * Tests the email report generation endpoint and button functionality
 */

const http = require('http');

const API_BASE = 'http://localhost:5000/api';
const APP_URL = 'http://localhost:5173';

// Helper function for API calls using http module
async function apiCall(endpoint, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api${endpoint}`,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          if (res.statusCode >= 400) {
            reject(new Error(`API Error: ${res.statusCode} ${res.statusMessage}`));
          } else {
            resolve(JSON.parse(data));
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${e.message}`));
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// Simple assertion helper
function assert(condition, message) {
  if (!condition) {
    throw new Error(`❌ Assertion failed: ${message}`);
  }
  console.log(`✅ ${message}`);
}

// Test functions
async function testEmailReportEndpoint() {
  console.log('\n📧 Testing Email Report Endpoint...\n');
  
  const result = await apiCall('/reports/savings-email', 'POST', {});
  
  assert(result !== undefined, 'Response is defined');
  assert(result.success === true, 'Response success is true');
  assert(result.message !== undefined, 'Response message is defined');
  assert(typeof result.recordCount === 'number', 'Record count is a number');
  assert(result.recordCount >= 0, 'Record count is >= 0');
  assert(typeof result.totalSavings === 'number', 'Total savings is a number');
  assert(result.totalSavings >= 0, 'Total savings is >= 0');
  assert(result.message.includes('successfully'), 'Success message contains "successfully"');
  
  console.log(`   Records: ${result.recordCount}`);
  console.log(`   Total Savings: RM ${result.totalSavings}`);
  console.log(`   Message: ${result.message}`);
}

async function testMultipleRequests() {
  console.log('\n🔄 Testing Multiple Concurrent Requests...\n');
  
  const startTime = Date.now();
  const results = await Promise.all([
    apiCall('/reports/savings-email', 'POST', {}),
    apiCall('/reports/savings-email', 'POST', {}),
    apiCall('/reports/savings-email', 'POST', {})
  ]);
  const endTime = Date.now();
  const totalTime = endTime - startTime;
  
  results.forEach((result, index) => {
    assert(result.success === true, `Request ${index + 1} successful`);
  });
  
  console.log(`   3 concurrent requests completed in ${totalTime}ms`);
}

async function testPerformance() {
  console.log('\n⚡ Testing Performance...\n');
  
  const startTime = Date.now();
  const result = await apiCall('/reports/savings-email', 'POST', {});
  const endTime = Date.now();
  const responseTime = endTime - startTime;
  
  assert(result.success === true, 'Report generated successfully');
  assert(responseTime < 5000, `Response time ${responseTime}ms is less than 5000ms`);
  
  console.log(`   Response time: ${responseTime}ms`);
}

async function testErrorHandling() {
  console.log('\n⚠️  Testing Error Handling...\n');
  
  try {
    await apiCall('/reports/invalid-endpoint', 'POST', {});
    console.log('   ❌ Should have failed for invalid endpoint');
  } catch (error) {
    assert(error.message.includes('404') || error.message.includes('Error'), 'Invalid endpoint properly rejected');
    console.log('   Error handling works correctly');
  }
}

async function testButtonSimulation() {
  console.log('\n🖱️  Testing Button Click Simulation...\n');
  
  // Simulate what happens when user clicks the button
  const result = await apiCall('/reports/savings-email', 'POST', {});
  
  assert(result.success === true, 'Button click triggers successful request');
  assert(result.message !== undefined, 'User receives feedback message');
  assert(result.recordCount !== undefined, 'Record count available for display');
  
  console.log('   Button simulation successful');
  console.log(`   User would see: "${result.message}"`);
}

// Simple test runner
async function runTests() {
  console.log('\n' + '='.repeat(70));
  console.log('SEND EMAIL REPORT BUTTON - TEST SUITE');
  console.log('='.repeat(70));

  try {
    await testEmailReportEndpoint();
    await testMultipleRequests();
    await testPerformance();
    await testErrorHandling();
    await testButtonSimulation();

    console.log('\n' + '='.repeat(70));
    console.log('✅ ALL TESTS PASSED!');
    console.log('='.repeat(70) + '\n');
    return true;
  } catch (error) {
    console.error('\n' + '='.repeat(70));
    console.error('❌ TEST FAILED:');
    if (error instanceof Error) {
      console.error('Error:', error.message);
      console.error('Stack:', error.stack);
    } else {
      console.error('Error:', JSON.stringify(error));
    }
    console.error('='.repeat(70) + '\n');
    return false;
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests()
    .then(success => {
      if (!success) process.exit(1);
    })
    .catch(error => {
      console.error('Fatal error:', error.message || error);
      console.error(error.stack);
      process.exit(1);
    });
}

module.exports = { apiCall, runTests };

