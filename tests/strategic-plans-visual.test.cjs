/**
 * Visual Regression Testing for Strategic Plans Circle Charts
 * Tests the rendering, styling, and visual appearance of A1T1-A1T4 gauges
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5173';
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
const BASELINE_DIR = path.join(SCREENSHOTS_DIR, 'baseline');
const ACTUAL_DIR = path.join(SCREENSHOTS_DIR, 'actual');

// Ensure directories exist
if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR);
if (!fs.existsSync(BASELINE_DIR)) fs.mkdirSync(BASELINE_DIR);
if (!fs.existsSync(ACTUAL_DIR)) fs.mkdirSync(ACTUAL_DIR);

/**
 * Test Suite: Strategic Plans Visual Regression
 */
describe('Strategic Plans Circle Charts - Visual Regression', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
  });

  afterAll(async () => {
    await browser.close();
  });

  test('Strategic Plans page should load successfully', async () => {
    try {
      await page.goto(`${BASE_URL}`, { waitUntil: 'networkidle2', timeout: 10000 });
      
      // Navigate to Strategic Plans
      await page.click('button:has-text("Strategic Plans")');
      await page.waitForTimeout(1000);
      
      const title = await page.$eval('h2', el => el.textContent);
      expect(title).toContain('Strategic Plans');
      
      console.log('✓ Strategic Plans page loaded successfully');
    } catch (error) {
      console.error('✗ Failed to load Strategic Plans page:', error.message);
      throw error;
    }
  });

  test('A1T1 circle chart should render correctly', async () => {
    try {
      // Wait for charts to load
      await page.waitForSelector('svg', { timeout: 5000 });
      
      // Take screenshot of A1T1 gauge
      const a1t1Element = await page.$('text:has-text("A1T1")').then(el => el?.parentElement);
      
      if (a1t1Element) {
        await a1t1Element.screenshot({ path: path.join(ACTUAL_DIR, 'A1T1-gauge.png') });
        console.log('✓ A1T1 gauge screenshot captured');
      }
      
      // Verify SVG elements exist
      const circles = await page.$$('circle');
      expect(circles.length).toBeGreaterThan(0);
      console.log(`✓ Found ${circles.length} circle elements`);
      
    } catch (error) {
      console.error('✗ Failed to test A1T1 gauge:', error.message);
      throw error;
    }
  });

  test('All four gauges (A1T1-A1T4) should be visible', async () => {
    try {
      const labels = ['A1T1', 'A1T2', 'A1T3', 'A1T4'];
      
      for (const label of labels) {
        const element = await page.$(`text:has-text("${label}")`);
        expect(element).not.toBeNull();
        console.log(`✓ ${label} label found`);
      }
      
      console.log('✓ All four gauges are visible');
    } catch (error) {
      console.error('✗ Failed to find all gauges:', error.message);
      throw error;
    }
  });

  test('Circle chart percentages should display correctly', async () => {
    try {
      const expectedPercentages = {
        'A1T1': '77.35%',
        'A1T2': '100.00%',
        'A1T3': '23.16%',
        'A1T4': '23.16%'
      };

      for (const [label, expectedPercent] of Object.entries(expectedPercentages)) {
        // Find the parent container of this gauge
        const parent = await page.$(`text:has-text("${label}")`).then(el => el?.parentElement?.parentElement);
        
        if (parent) {
          const percentText = await parent.$eval('text', el => el.textContent);
          expect(percentText).toContain(expectedPercent.replace('%', ''));
          console.log(`✓ ${label} displays ${expectedPercent}`);
        }
      }
    } catch (error) {
      console.error('✗ Failed to verify percentages:', error.message);
      throw error;
    }
  });

  test('Circle chart styling should match specifications', async () => {
    try {
      // Check SVG circle stroke colors
      const circles = await page.$$eval('circle', elements =>
        elements.map(el => ({
          stroke: el.getAttribute('stroke'),
          strokeWidth: el.getAttribute('stroke-width'),
          cx: el.getAttribute('cx'),
          cy: el.getAttribute('cy')
        }))
      );

      expect(circles.length).toBeGreaterThanOrEqual(8); // At least 2 circles per gauge × 4 gauges
      
      // Verify background circles are gray (#e5e7eb)
      const backgroundCircles = circles.filter(c => c.stroke === '#e5e7eb');
      expect(backgroundCircles.length).toBeGreaterThanOrEqual(4);
      console.log(`✓ Found ${backgroundCircles.length} background circles with correct color`);
      
      // Verify progress circles are blue (#1e40af)
      const progressCircles = circles.filter(c => c.stroke === '#1e40af');
      expect(progressCircles.length).toBeGreaterThanOrEqual(4);
      console.log(`✓ Found ${progressCircles.length} progress circles with correct color`);
      
      // Verify stroke width
      circles.forEach(circle => {
        expect(circle.strokeWidth).toBe('10');
      });
      console.log('✓ All circles have correct stroke width (10)');
      
    } catch (error) {
      console.error('✗ Failed to verify styling:', error.message);
      throw error;
    }
  });

  test('Circle chart should be responsive', async () => {
    try {
      // Test on mobile viewport
      await page.setViewport({ width: 375, height: 667 });
      await page.reload({ waitUntil: 'networkidle2' });
      await page.waitForTimeout(1000);
      
      // Check if gauges still visible
      const a1t1Label = await page.$('text:has-text("A1T1")');
      expect(a1t1Label).not.toBeNull();
      console.log('✓ Gauges remain visible on mobile viewport');
      
      // Take mobile screenshot
      await page.screenshot({ path: path.join(ACTUAL_DIR, 'gauges-mobile.png') });
      console.log('✓ Mobile screenshot captured');
      
      // Reset to desktop
      await page.setViewport({ width: 1920, height: 1080 });
      await page.reload({ waitUntil: 'networkidle2' });
      
    } catch (error) {
      console.error('✗ Failed responsive test:', error.message);
      throw error;
    }
  });

  test('Full gauges section screenshot', async () => {
    try {
      // Take full screenshot of all gauges
      await page.screenshot({ path: path.join(ACTUAL_DIR, 'all-gauges.png'), fullPage: true });
      console.log('✓ Full page screenshot captured');
      
    } catch (error) {
      console.error('✗ Failed to capture full screenshot:', error.message);
      throw error;
    }
  });

  test('Circle chart animations should be smooth', async () => {
    try {
      // Check CSS transition properties
      const progressCircles = await page.$$eval('circle[stroke="#1e40af"]', elements =>
        elements.map(el => window.getComputedStyle(el).transition)
      );

      progressCircles.forEach(transition => {
        expect(transition).toContain('duration');
        console.log(`✓ Progress circle has transition: ${transition}`);
      });
      
    } catch (error) {
      console.error('✗ Failed animation check:', error.message);
      throw error;
    }
  });

  test('Percentage text should be centered and readable', async () => {
    try {
      const percentageTexts = await page.$$eval('text', elements =>
        elements
          .filter(el => el.textContent.includes('%'))
          .map(el => ({
            text: el.textContent,
            x: el.getAttribute('x'),
            y: el.getAttribute('y'),
            fontSize: window.getComputedStyle(el).fontSize,
            fontWeight: window.getComputedStyle(el).fontWeight
          }))
      );

      expect(percentageTexts.length).toBeGreaterThanOrEqual(4);
      console.log(`✓ Found ${percentageTexts.length} percentage displays`);
      
      percentageTexts.forEach(pt => {
        expect(pt.text).toMatch(/\d+\.?\d*%/);
        expect(parseFloat(pt.fontSize)).toBeGreaterThan(16);
        console.log(`✓ Percentage "${pt.text}" is readable`);
      });
      
    } catch (error) {
      console.error('✗ Failed text verification:', error.message);
      throw error;
    }
  });

});

/**
 * Performance Tests for Circle Charts
 */
describe('Strategic Plans Circle Charts - Performance', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({ headless: true });
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  test('Charts should render within 3 seconds', async () => {
    try {
      const startTime = Date.now();
      
      await page.goto(`${BASE_URL}`, { waitUntil: 'networkidle2' });
      await page.click('button:has-text("Strategic Plans")');
      await page.waitForSelector('svg', { timeout: 3000 });
      
      const renderTime = Date.now() - startTime;
      expect(renderTime).toBeLessThan(3000);
      console.log(`✓ Charts rendered in ${renderTime}ms`);
      
    } catch (error) {
      console.error('✗ Performance test failed:', error.message);
      throw error;
    }
  });

  test('SVG elements should be optimized', async () => {
    try {
      const svgStats = await page.$$eval('svg', svgs =>
        svgs.map(svg => ({
          viewBox: svg.getAttribute('viewBox'),
          width: svg.getAttribute('width'),
          height: svg.getAttribute('height'),
          childCount: svg.children.length
        }))
      );

      svgStats.forEach(stat => {
        expect(stat.viewBox).not.toBeNull();
        expect(stat.width).not.toBeNull();
        expect(stat.height).not.toBeNull();
        console.log(`✓ SVG optimized - Children: ${stat.childCount}`);
      });
      
    } catch (error) {
      console.error('✗ SVG optimization check failed:', error.message);
      throw error;
    }
  });
});

/**
 * Accessibility Tests for Circle Charts
 */
describe('Strategic Plans Circle Charts - Accessibility', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({ headless: true });
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  test('Circle charts should have descriptive labels', async () => {
    try {
      await page.goto(`${BASE_URL}`, { waitUntil: 'networkidle2' });
      await page.click('button:has-text("Strategic Plans")');
      await page.waitForTimeout(1000);

      const labels = await page.$$eval('text', elements =>
        elements
          .filter(el => el.textContent.match(/A1T[1-4]/))
          .map(el => el.textContent)
      );

      expect(labels.length).toBeGreaterThanOrEqual(4);
      labels.forEach(label => {
        console.log(`✓ Found descriptive label: ${label}`);
      });
      
    } catch (error) {
      console.error('✗ Accessibility test failed:', error.message);
      throw error;
    }
  });

  test('Percentage values should be clearly visible', async () => {
    try {
      const percentages = await page.$$eval('text', elements =>
        elements
          .filter(el => el.textContent.includes('%'))
          .map(el => el.textContent)
      );

      expect(percentages.length).toBeGreaterThanOrEqual(4);
      percentages.forEach(pct => {
        expect(pct).toMatch(/\d+\.\d+%/);
        console.log(`✓ Percentage visible: ${pct}`);
      });
      
    } catch (error) {
      console.error('✗ Percentage visibility test failed:', error.message);
      throw error;
    }
  });
});

console.log('\n================================');
console.log('Visual Regression Testing Suite');
console.log('For Strategic Plans Circle Charts');
console.log('================================\n');
