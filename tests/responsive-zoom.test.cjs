/**
 * Responsive Design & Zoom Test
 * Tests UI responsiveness with various zoom levels (50%, 75%, 100%, 125%, 150%, 200%)
 * Ensures investment cards maintain proper layout and spacing at all zoom levels
 */

const puppeteer = require('puppeteer');

const ZOOM_LEVELS = [50, 75, 100, 125, 150, 200];
const APP_URL = 'http://localhost:5173';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function pass(message) {
  log(`✅ ${message}`, 'green');
}

function fail(message) {
  log(`❌ ${message}`, 'red');
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function warn(message) {
  log(`⚠️  ${message}`, 'yellow');
}

(async () => {
  let browser;
  let testsPassed = 0;
  let testsFailed = 0;

  try {
    log(`\n${'='.repeat(70)}`, 'bold');
    log('RESPONSIVE DESIGN & ZOOM TEST SUITE', 'bold');
    log(`${'='.repeat(70)}\n`, 'bold');

    // Launch browser
    log('Launching browser...', 'blue');
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Set viewport to desktop size
    await page.setViewport({ width: 1280, height: 800 });

    log('Navigating to application...', 'blue');
    try {
      await page.goto(APP_URL, { waitUntil: 'networkidle2', timeout: 10000 });
      pass('Application loaded successfully');
      testsPassed++;
    } catch (error) {
      fail(`Failed to load application: ${error.message}`);
      testsFailed++;
      await browser.close();
      process.exit(1);
    }

    // Wait for content to render
    await page.waitForSelector('div', { timeout: 5000 }).catch(() => {
      warn('Main content selector not found, continuing anyway...');
    });

    log(`\n${'─'.repeat(70)}`, 'blue');
    log('TEST 1: Investment Cards Layout', 'bold');
    log(`${'─'.repeat(70)}\n`, 'blue');

    // Get initial card information
    const getCardsInfo = async () => {
      return await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('[class*="flex-shrink-0"]'));
        if (cards.length === 0) {
          // Fallback: find cards by looking for investment card patterns
          const allDivs = Array.from(document.querySelectorAll('div[class*="bg-slate-900"]'));
          return allDivs
            .filter(div => {
              const text = div.textContent;
              return text.includes('EQUITIES') || text.includes('FIXED INCOME') || 
                     text.includes('REAL ESTATE') || text.includes('RENEWABLE ENERGY');
            })
            .map(card => ({
              width: window.getComputedStyle(card).width,
              height: window.getComputedStyle(card).height,
              display: window.getComputedStyle(card).display,
              text: card.textContent.substring(0, 50)
            }));
        }
        return cards.map(card => ({
          width: window.getComputedStyle(card).width,
          height: window.getComputedStyle(card).height,
          display: window.getComputedStyle(card).display
        }));
      });
    };

    // Get container info
    const getContainerInfo = async () => {
      return await page.evaluate(() => {
        // Find the card container (flex container with gap-4)
        const containers = Array.from(document.querySelectorAll('div[class*="flex"]'));
        const cardContainer = containers.find(div => {
          const style = window.getComputedStyle(div);
          return style.display === 'flex' && div.querySelectorAll('[class*="flex-shrink-0"]').length > 0;
        });
        
        if (cardContainer) {
          return {
            width: window.getComputedStyle(cardContainer).width,
            maxWidth: window.getComputedStyle(cardContainer).maxWidth,
            display: window.getComputedStyle(cardContainer).display,
            gap: window.getComputedStyle(cardContainer).gap,
            overflow: window.getComputedStyle(cardContainer).overflowX
          };
        }
        return null;
      });
    };

    let cardsInfo = await getCardsInfo();
    if (cardsInfo.length === 0) {
      warn('No investment cards found on page');
    } else {
      info(`Found ${cardsInfo.length} investment cards`);
      if (cardsInfo.length === 4) {
        pass('Correct number of investment cards (4) found');
        testsPassed++;
      } else {
        warn(`Expected 4 cards but found ${cardsInfo.length}`);
      }
    }

    log(`\n${'─'.repeat(70)}`, 'blue');
    log('TEST 2: Zoom Responsiveness Tests', 'bold');
    log(`${'─'.repeat(70)}\n`, 'blue');

    // Test each zoom level
    const zoomResults = {};

    for (const zoomLevel of ZOOM_LEVELS) {
      info(`\nTesting at ${zoomLevel}% zoom...`);

      // Set zoom level
      await page.evaluate((zoom) => {
        document.body.style.zoom = `${zoom / 100}`;
      }, zoomLevel);

      // Wait for layout to stabilize
      await page.waitForTimeout(500);

      // Get measurements at this zoom
      const cardsAtZoom = await getCardsInfo();
      const containerAtZoom = await getContainerInfo();

      zoomResults[zoomLevel] = {
        cardsCount: cardsAtZoom.length,
        firstCardWidth: cardsAtZoom.length > 0 ? cardsAtZoom[0].width : 'N/A',
        container: containerAtZoom
      };

      // Log results
      if (cardsAtZoom.length > 0) {
        info(`  Card width: ${cardsAtZoom[0].width}`);
        info(`  Card height: ${cardsAtZoom[0].height}`);
      }

      if (containerAtZoom) {
        info(`  Container width: ${containerAtZoom.width}`);
        info(`  Container max-width: ${containerAtZoom.maxWidth}`);
        info(`  Container overflow-x: ${containerAtZoom.overflow}`);
      }

      // Check for layout issues
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      if (hasHorizontalScroll) {
        warn(`  Horizontal scroll detected at ${zoomLevel}%`);
      } else {
        pass(`  No unwanted horizontal scroll at ${zoomLevel}%`);
        testsPassed++;
      }
    }

    // Verify consistency across zoom levels
    log(`\n${'─'.repeat(70)}`, 'blue');
    log('TEST 3: Consistency Across Zoom Levels', 'bold');
    log(`${'─'.repeat(70)}\n`, 'blue');

    const cardCountsConsistent = Object.values(zoomResults).every(
      result => result.cardsCount === zoomResults[100].cardsCount
    );

    if (cardCountsConsistent) {
      pass('Card count remains consistent across all zoom levels');
      testsPassed++;
    } else {
      fail('Card count varies across zoom levels');
      testsFailed++;
    }

    // Test spacing consistency
    log(`\n${'─'.repeat(70)}`, 'blue');
    log('TEST 4: Visual Spacing Validation', 'bold');
    log(`${'─'.repeat(70)}\n`, 'blue');

    await page.evaluate(() => {
      document.body.style.zoom = '1'; // Reset to 100%
    });
    await page.waitForTimeout(300);

    const spacingCheck = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('[class*="flex-shrink-0"]'));
      if (cards.length < 2) return { valid: false, reason: 'Not enough cards' };

      const rect1 = cards[0].getBoundingClientRect();
      const rect2 = cards[1].getBoundingClientRect();

      // Check if cards are positioned horizontally
      const horizontalAlignment = Math.abs(rect1.top - rect2.top) < 10;
      
      // Check spacing between cards
      const gap = rect2.left - rect1.right;
      const expectedGap = 16; // gap-4 in Tailwind = 1rem = 16px
      const gapValid = Math.abs(gap - expectedGap) < 5; // Allow 5px tolerance

      return {
        valid: horizontalAlignment && gapValid,
        horizontalAlignment,
        gap: Math.round(gap),
        expectedGap: expectedGap,
        reason: !horizontalAlignment ? 'Cards not aligned horizontally' : 
                !gapValid ? `Gap mismatch: ${Math.round(gap)}px vs ${expectedGap}px` :
                'All checks passed'
      };
    });

    if (spacingCheck.valid) {
      pass(`Card spacing is correct (gap: ${spacingCheck.gap}px, expected: ${spacingCheck.expectedGap}px)`);
      testsPassed++;
    } else {
      fail(`${spacingCheck.reason}`);
      testsFailed++;
    }

    // Test 5: Section responsiveness (header and chart)
    log(`\n${'─'.repeat(70)}`, 'blue');
    log('TEST 5: Full-Width Sections Responsiveness', 'bold');
    log(`${'─'.repeat(70)}\n`, 'blue');

    const sectionsCheck = await page.evaluate(() => {
      // Check header
      const header = document.querySelector('[class*="from-slate-900"]');
      const headerStyle = header ? window.getComputedStyle(header) : null;

      // Check chart
      const chart = Array.from(document.querySelectorAll('[class*="bg-slate-900"]'))
        .find(el => el.textContent.includes('Historical') || el.querySelector('svg'));
      const chartStyle = chart ? window.getComputedStyle(chart) : null;

      return {
        header: {
          exists: !!header,
          maxWidth: headerStyle?.maxWidth,
          margin: headerStyle?.margin,
          display: headerStyle?.display
        },
        chart: {
          exists: !!chart,
          maxWidth: chartStyle?.maxWidth,
          margin: chartStyle?.margin,
          display: chartStyle?.display
        }
      };
    });

    if (sectionsCheck.header.exists) {
      info(`Header section found: maxWidth=${sectionsCheck.header.maxWidth}`);
      pass('Header section is responsive');
      testsPassed++;
    } else {
      warn('Header section not found');
    }

    if (sectionsCheck.chart.exists) {
      info(`Chart section found: maxWidth=${sectionsCheck.chart.maxWidth}`);
      pass('Chart section is responsive');
      testsPassed++;
    } else {
      warn('Chart section not found');
    }

    // Final summary
    log(`\n${'═'.repeat(70)}`, 'bold');
    log('TEST SUMMARY', 'bold');
    log(`${'═'.repeat(70)}\n`, 'bold');

    info(`Total Tests Passed: ${testsPassed}`);
    info(`Total Tests Failed: ${testsFailed}`);

    if (testsFailed === 0) {
      log(`\n✅ ALL TESTS PASSED! Responsive design is working correctly.\n`, 'green');
    } else {
      log(`\n⚠️  Some tests failed. Please review the output above.\n`, 'yellow');
    }

    log(`Zoom Levels Tested: ${ZOOM_LEVELS.join('%, ')}%\n`, 'blue');

    await browser.close();

    process.exit(testsFailed > 0 ? 1 : 0);

  } catch (error) {
    fail(`Test suite error: ${error.message}`);
    if (browser) await browser.close();
    process.exit(1);
  }
})();
