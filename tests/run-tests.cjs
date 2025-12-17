#!/usr/bin/env node

/**
 * E2E Test Runner for Backup Features
 * Run this with: node tests/run-tests.js
 */

const fs = require('fs');
const path = require('path');

// Simple test framework
let testCount = 0;
let passCount = 0;
let failCount = 0;
const failedTests = [];

// Jest-like global functions
global.describe = (suite, callback) => {
  console.log(`\n📋 ${suite}`);
  callback();
};

global.test = async (name, callback) => {
  testCount++;
  try {
    await callback();
    passCount++;
    console.log(`  ✅ ${name}`);
  } catch (error) {
    failCount++;
    console.log(`  ❌ ${name}`);
    console.log(`     Error: ${error.message}`);
    failedTests.push({ suite: name, error: error.message });
  }
};

global.expect = (value) => {
  const expectObj = {
    toBe: (expected) => {
      if (value !== expected) {
        throw new Error(`Expected ${value} to be ${expected}`);
      }
    },
    toEqual: (expected) => {
      if (JSON.stringify(value) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(value)} to equal ${JSON.stringify(expected)}`);
      }
    },
    toBeGreaterThan: (expected) => {
      if (value <= expected) {
        throw new Error(`Expected ${value} to be greater than ${expected}`);
      }
    },
    toBeLessThanOrEqual: (expected) => {
      if (value > expected) {
        throw new Error(`Expected ${value} to be less than or equal to ${expected}`);
      }
    },
    toBeGreaterThanOrEqual: (expected) => {
      if (value < expected) {
        throw new Error(`Expected ${value} to be greater than or equal to ${expected}`);
      }
    },
    toBeDefined: () => {
      if (value === undefined) {
        throw new Error('Expected value to be defined');
      }
    },
    toMatch: (regex) => {
      if (!regex.test(value)) {
        throw new Error(`Expected "${value}" to match pattern ${regex}`);
      }
    },
    toContain: (substring) => {
      if (!value.includes(substring)) {
        throw new Error(`Expected "${value}" to contain "${substring}"`);
      }
    },
    toHaveProperty: (prop) => {
      if (!(prop in value)) {
        throw new Error(`Expected object to have property "${prop}"`);
      }
    },
    not: {}
  };

  // Add .not negation support
  expectObj.not.toBe = (expected) => {
    if (value === expected) {
      throw new Error(`Expected ${value} NOT to be ${expected}`);
    }
  };
  expectObj.not.toEqual = (expected) => {
    if (JSON.stringify(value) === JSON.stringify(expected)) {
      throw new Error(`Expected ${JSON.stringify(value)} NOT to equal ${JSON.stringify(expected)}`);
    }
  };
  expectObj.not.toContain = (substring) => {
    if (value.includes(substring)) {
      throw new Error(`Expected "${value}" NOT to contain "${substring}"`);
    }
  };
  expectObj.not.toBeDefined = () => {
    if (value !== undefined) {
      throw new Error('Expected value NOT to be defined');
    }
  };

  return expectObj;
};

// Run tests
async function runTests() {
  console.log('🚀 Starting E2E Tests for Backup Features\n');
  console.log('Checking if servers are running...');
  
  try {
    // Check if servers are running
    const apiCheck = await fetch('http://localhost:5000/api/health').catch(() => null);
    if (!apiCheck) {
      console.error('❌ API Server not running on port 5000');
      console.log('Please start the API server: cd server && node index.cjs');
      process.exit(1);
    }
    
    const appCheck = await fetch('http://localhost:5173').catch(() => null);
    if (!appCheck) {
      console.error('⚠️  Frontend not running on port 5173 (optional for API tests)');
    }
    
    console.log('✅ Servers are running\n');
    
    // Load and run test file
    require('./backup.e2e.test.cjs');
    
  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
  
  // Print summary
  printSummary();
}

function printSummary() {
  console.log('\n\n' + '='.repeat(50));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total Tests:  ${testCount}`);
  console.log(`✅ Passed:    ${passCount}`);
  console.log(`❌ Failed:    ${failCount}`);
  console.log(`Success Rate: ${((passCount / testCount) * 100).toFixed(1)}%`);
  
  if (failedTests.length > 0) {
    console.log('\nFailed Tests:');
    failedTests.forEach(test => {
      console.log(`  - ${test.suite}`);
      console.log(`    ${test.error}`);
    });
  }
  
  console.log('='.repeat(50) + '\n');
  
  if (failCount > 0) {
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error running tests:', error);
  process.exit(1);
});
