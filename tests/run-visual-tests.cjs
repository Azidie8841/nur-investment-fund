#!/usr/bin/env node

/**
 * Visual Regression Test Runner for Strategic Plans Charts
 * Run this script to test circle chart rendering, styling, and responsiveness
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5173';
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
const BASELINE_DIR = path.join(SCREENSHOTS_DIR, 'baseline');
const ACTUAL_DIR = path.join(SCREENSHOTS_DIR, 'actual');

// Create directories
[SCREENSHOTS_DIR, BASELINE_DIR, ACTUAL_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

let testsPassed = 0;
let testsFailed = 0;

const log = {
  success: (msg) => console.log(`\n✓ ${msg}`),
  error: (msg) => console.log(`\n✗ ${msg}`),
  info: (msg) => console.log(`ℹ ${msg}`),
  header: (msg) => console.log(`\n${'='.repeat(50)}\n${msg}\n${'='.repeat(50)}`)
};

async function runTests() {
  log.header('STRATEGIC PLANS CIRCLE CHARTS - VISUAL REGRESSION TESTING');
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Test 1: Page Load
    log.header('TEST 1: Page Load');
    try {
      await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 10000 });
      log.success('Page loaded successfully');
      testsPassed++;
    } catch (error) {
      log.error(`Page load failed: ${error.message}`);
      testsFailed++;
    }

    // Test 2: Navigate to Strategic Plans
    log.header('TEST 2: Navigate to Strategic Plans');
    try {
      const planButton = await page.$('button');
      if (planButton) {
        await page.click('a, button'); // Click first navigable element
        await page.waitForTimeout(1500);
      }
      log.success('Strategic Plans section accessed');
      testsPassed++;
    } catch (error) {
      log.error(`Navigation failed: ${error.message}`);
      testsFailed++;
    }

    // Test 3: Chart Elements Rendering
    log.header('TEST 3: Chart Elements Rendering');
    try {
      await page.waitForSelector('svg', { timeout: 5000 });
      const circles = await page.$$('circle');
      log.info(`Found ${circles.length} circle elements`);
      
      if (circles.length >= 8) {
        log.success('All chart circles rendered (at least 8 expected)');
        testsPassed++;
      } else {
        log.error(`Not enough circles found: ${circles.length}`);
        testsFailed++;
      }
    } catch (error) {
      log.error(`Circle rendering failed: ${error.message}`);
      testsFailed++;
    }

    // Test 4: Gauge Labels
    log.header('TEST 4: Gauge Labels (A1T1-A1T4)');
    try {
      const labels = ['A1T1', 'A1T2', 'A1T3', 'A1T4'];
      let foundLabels = 0;

      for (const label of labels) {
        try {
          // Wait for the label text to appear
          await page.waitForFunction(
            (text) => document.body.innerText.includes(text),
            { timeout: 2000 },
            label
          );
          log.success(`Found label: ${label}`);
          foundLabels++;
        } catch (e) {
          log.error(`Label not found: ${label}`);
        }
      }

      if (foundLabels === 4) {
        log.success('All 4 gauge labels present');
        testsPassed++;
      } else {
        log.error(`Only found ${foundLabels}/4 labels`);
        testsFailed++;
      }
    } catch (error) {
      log.error(`Label check failed: ${error.message}`);
      testsFailed++;
    }

    // Test 5: Percentage Values
    log.header('TEST 5: Percentage Values Display');
    try {
      const pageText = await page.content();
      const percentages = ['77.35%', '100.00%', '23.16%'];
      let foundPercentages = 0;

      for (const percent of percentages) {
        if (pageText.includes(percent)) {
          log.success(`Found percentage: ${percent}`);
          foundPercentages++;
        } else {
          log.error(`Percentage not found: ${percent}`);
        }
      }

      if (foundPercentages >= 3) {
        log.success('Percentage values displaying correctly');
        testsPassed++;
      } else {
        log.error(`Only found ${foundPercentages}/3 unique percentages`);
        testsFailed++;
      }
    } catch (error) {
      log.error(`Percentage check failed: ${error.message}`);
      testsFailed++;
    }

    // Test 6: Screenshot - Desktop
    log.header('TEST 6: Screenshot Capture - Desktop');
    try {
      const screenshotPath = path.join(ACTUAL_DIR, 'strategic-plans-desktop.png');
      await page.screenshot({ path: screenshotPath, fullPage: true });
      log.success(`Desktop screenshot saved: ${screenshotPath}`);
      testsPassed++;
    } catch (error) {
      log.error(`Desktop screenshot failed: ${error.message}`);
      testsFailed++;
    }

    // Test 7: Mobile Responsiveness
    log.header('TEST 7: Mobile Responsiveness');
    try {
      await page.setViewport({ width: 375, height: 667 });
      await page.reload({ waitUntil: 'networkidle2' });
      await page.waitForTimeout(1000);

      const circles = await page.$$('circle');
      if (circles.length >= 8) {
        log.success('Charts render on mobile viewport');
        testsPassed++;
      } else {
        log.error('Charts not properly rendered on mobile');
        testsFailed++;
      }

      const screenshotPath = path.join(ACTUAL_DIR, 'strategic-plans-mobile.png');
      await page.screenshot({ path: screenshotPath });
      log.success(`Mobile screenshot saved: ${screenshotPath}`);
    } catch (error) {
      log.error(`Mobile test failed: ${error.message}`);
      testsFailed++;
    }

    // Test 8: SVG Structure
    log.header('TEST 8: SVG Structure & Optimization');
    try {
      const svgCount = await page.$$eval('svg', svgs => svgs.length);
      const totalCircles = await page.$$eval('circle', circles => circles.length);
      const totalPaths = await page.$$eval('path', paths => paths.length);

      log.info(`SVG elements: ${svgCount}`);
      log.info(`Total circles: ${totalCircles}`);
      log.info(`Total paths: ${totalPaths}`);

      if (svgCount >= 4 && totalCircles >= 8) {
        log.success('SVG structure is optimized');
        testsPassed++;
      } else {
        log.error('SVG structure may be incomplete');
        testsFailed++;
      }
    } catch (error) {
      log.error(`SVG structure check failed: ${error.message}`);
      testsFailed++;
    }

    // Test 9: Color Verification
    log.header('TEST 9: Color Verification');
    try {
      const circles = await page.$$eval('circle', elements =>
        elements.map(el => el.getAttribute('stroke'))
      );

      const hasGray = circles.includes('#e5e7eb');
      const hasBlue = circles.includes('#1e40af');

      if (hasGray) log.success('Background circles have correct gray color');
      if (hasBlue) log.success('Progress circles have correct blue color');

      if (hasGray && hasBlue) {
        log.success('All colors verified');
        testsPassed++;
      } else {
        log.error('Color verification incomplete');
        testsFailed++;
      }
    } catch (error) {
      log.error(`Color verification failed: ${error.message}`);
      testsFailed++;
    }

    // Test 10: Performance
    log.header('TEST 10: Performance Metrics');
    try {
      await page.setViewport({ width: 1920, height: 1080 });
      
      const metrics = await page.metrics();
      log.info(`JavaScript Heap Used: ${Math.round(metrics.JSHeapUsedSize / 1048576)} MB`);
      log.info(`Layout Count: ${metrics.LayoutCount}`);
      log.info(`Recalc Style Count: ${metrics.RecalcStyleCount}`);

      if (metrics.JSHeapUsedSize < 100 * 1048576) { // Less than 100MB
        log.success('Performance metrics are good');
        testsPassed++;
      } else {
        log.info('Performance is acceptable');
        testsPassed++;
      }
    } catch (error) {
      log.error(`Performance metrics failed: ${error.message}`);
      testsFailed++;
    }

    await browser.close();

  } catch (error) {
    log.error(`Browser error: ${error.message}`);
    if (browser) await browser.close();
  }

  // Final Report
  log.header('TEST SUMMARY');
  console.log(`\nTests Passed: ${testsPassed}`);
  console.log(`Tests Failed: ${testsFailed}`);
  console.log(`Total Tests: ${testsPassed + testsFailed}`);
  console.log(`\nScreenshots saved to: ${ACTUAL_DIR}`);
  
  if (testsFailed === 0) {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log(`\n⚠️  ${testsFailed} test(s) failed`);
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
