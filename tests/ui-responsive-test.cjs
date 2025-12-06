const { chromium } = require('@playwright/test');

const BASE_URL = 'http://localhost:5173';
const TIMEOUT = 30000;

async function runUIResponsiveTest() {
  console.log('\n🧪 UI Responsive Design Test with Zoom\n');
  
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    // Set viewport to standard size
    await page.setViewportSize({ width: 1280, height: 720 });
    
    console.log('📱 Test Environment:');
    console.log(`   • Browser: Chromium (Headless)`);
    console.log(`   • Viewport: 1280x720`);
    console.log(`   • URL: ${BASE_URL}`);
    console.log(`   • Timeout: ${TIMEOUT}ms\n`);
    
    // Navigate to the app
    console.log('🔗 Navigating to application...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: TIMEOUT });
    console.log('✅ Application loaded successfully\n');
    
    // Wait for investment cards to load
    console.log('⏳ Waiting for investment cards to load...');
    await page.waitForSelector('[class*="flex-shrink-0"]', { timeout: TIMEOUT });
    console.log('✅ Investment cards found\n');
    
    // Test 1: 100% Zoom (Baseline)
    console.log('🔍 Test 1: 100% Zoom (Baseline)');
    await page.evaluate(() => {
      document.documentElement.style.zoom = '1';
    });
    await page.waitForTimeout(500);
    
    const baselineMetrics = await getLayoutMetrics(page);
    console.log(`   ✓ Container width: ${baselineMetrics.containerWidth}px`);
    console.log(`   ✓ Card count: ${baselineMetrics.cardCount}`);
    console.log(`   ✓ Card width: ${baselineMetrics.cardWidth}px`);
    console.log(`   ✓ Total cards width: ${baselineMetrics.totalCardsWidth}px`);
    console.log(`   ✓ Horizontal scroll needed: ${baselineMetrics.hasHorizontalScroll}`);
    console.log(`   ✓ Right spacing issue: ${baselineMetrics.hasRightSpacing ? '❌ YES' : '✅ NO'}\n`);
    
    // Test 2: 50% Zoom Out
    console.log('🔍 Test 2: 50% Zoom Out');
    await page.evaluate(() => {
      document.documentElement.style.zoom = '0.5';
    });
    await page.waitForTimeout(500);
    
    const zoomOut50Metrics = await getLayoutMetrics(page);
    console.log(`   ✓ Container width: ${zoomOut50Metrics.containerWidth}px`);
    console.log(`   ✓ Card count: ${zoomOut50Metrics.cardCount}`);
    console.log(`   ✓ Card width: ${zoomOut50Metrics.cardWidth}px`);
    console.log(`   ✓ Total cards width: ${zoomOut50Metrics.totalCardsWidth}px`);
    console.log(`   ✓ Horizontal scroll needed: ${zoomOut50Metrics.hasHorizontalScroll}`);
    console.log(`   ✓ Right spacing issue: ${zoomOut50Metrics.hasRightSpacing ? '❌ YES' : '✅ NO'}\n`);
    
    // Test 3: 75% Zoom
    console.log('🔍 Test 3: 75% Zoom');
    await page.evaluate(() => {
      document.documentElement.style.zoom = '0.75';
    });
    await page.waitForTimeout(500);
    
    const zoom75Metrics = await getLayoutMetrics(page);
    console.log(`   ✓ Container width: ${zoom75Metrics.containerWidth}px`);
    console.log(`   ✓ Right spacing issue: ${zoom75Metrics.hasRightSpacing ? '❌ YES' : '✅ NO'}\n`);
    
    // Test 4: 150% Zoom In
    console.log('🔍 Test 4: 150% Zoom In');
    await page.evaluate(() => {
      document.documentElement.style.zoom = '1.5';
    });
    await page.waitForTimeout(500);
    
    const zoomIn150Metrics = await getLayoutMetrics(page);
    console.log(`   ✓ Container width: ${zoomIn150Metrics.containerWidth}px`);
    console.log(`   ✓ Horizontal scroll needed: ${zoomIn150Metrics.hasHorizontalScroll}`);
    console.log(`   ✓ Right spacing issue: ${zoomIn150Metrics.hasRightSpacing ? '❌ YES' : '✅ NO'}\n`);
    
    // Test 5: 200% Zoom In
    console.log('🔍 Test 5: 200% Zoom In');
    await page.evaluate(() => {
      document.documentElement.style.zoom = '2';
    });
    await page.waitForTimeout(500);
    
    const zoomIn200Metrics = await getLayoutMetrics(page);
    console.log(`   ✓ Container width: ${zoomIn200Metrics.containerWidth}px`);
    console.log(`   ✓ Horizontal scroll needed: ${zoomIn200Metrics.hasHorizontalScroll}`);
    console.log(`   ✓ Right spacing issue: ${zoomIn200Metrics.hasRightSpacing ? '❌ YES' : '✅ NO'}\n`);
    
    // Test 6: Verify header section responsiveness
    console.log('🔍 Test 6: Header Section Responsiveness (100% zoom)');
    await page.evaluate(() => {
      document.documentElement.style.zoom = '1';
    });
    await page.waitForTimeout(500);
    
    const headerMetrics = await page.evaluate(() => {
      const header = document.querySelector('[class*="from-slate-900"]');
      if (!header) return { found: false };
      
      const rect = header.getBoundingClientRect();
      const style = window.getComputedStyle(header);
      
      return {
        found: true,
        width: rect.width,
        left: rect.left,
        right: rect.right,
        hasExcessiveRightSpacing: rect.right > window.innerWidth + 5
      };
    });
    
    if (headerMetrics.found) {
      console.log(`   ✓ Header width: ${headerMetrics.width}px`);
      console.log(`   ✓ Header right edge: ${headerMetrics.right}px`);
      console.log(`   ✓ Window width: ${baselineMetrics.windowWidth}px`);
      console.log(`   ✓ Excessive right spacing: ${headerMetrics.hasExcessiveRightSpacing ? '❌ YES' : '✅ NO'}\n`);
    }
    
    // Test 7: Verify chart section responsiveness
    console.log('🔍 Test 7: Chart Section Responsiveness (100% zoom)');
    const chartMetrics = await page.evaluate(() => {
      const chart = document.querySelector('[class*="bg-slate-900"][class*="border-slate-700"]');
      if (!chart) return { found: false };
      
      const rect = chart.getBoundingClientRect();
      return {
        found: true,
        width: rect.width,
        left: rect.left,
        right: rect.right,
        hasExcessiveRightSpacing: rect.right > window.innerWidth + 5
      };
    });
    
    if (chartMetrics.found) {
      console.log(`   ✓ Chart width: ${chartMetrics.width}px`);
      console.log(`   ✓ Chart right edge: ${chartMetrics.right}px`);
      console.log(`   ✓ Excessive right spacing: ${chartMetrics.hasExcessiveRightSpacing ? '❌ YES' : '✅ NO'}\n`);
    }
    
    // Verification Summary
    console.log('━'.repeat(60));
    console.log('📊 RESPONSIVE DESIGN VERIFICATION SUMMARY\n');
    
    const allTestsPassed = 
      !baselineMetrics.hasRightSpacing &&
      !zoomOut50Metrics.hasRightSpacing &&
      !zoom75Metrics.hasRightSpacing &&
      !zoomIn150Metrics.hasRightSpacing &&
      !zoomIn200Metrics.hasRightSpacing;
    
    console.log('Zoom Levels Tested:');
    console.log(`   50% Zoom:   ${zoomOut50Metrics.hasRightSpacing ? '❌ FAILED' : '✅ PASSED'}`);
    console.log(`   75% Zoom:   ${zoom75Metrics.hasRightSpacing ? '❌ FAILED' : '✅ PASSED'}`);
    console.log(`   100% Zoom:  ${baselineMetrics.hasRightSpacing ? '❌ FAILED' : '✅ PASSED'}`);
    console.log(`   150% Zoom:  ${zoomIn150Metrics.hasRightSpacing ? '❌ FAILED' : '✅ PASSED'}`);
    console.log(`   200% Zoom:  ${zoomIn200Metrics.hasRightSpacing ? '❌ FAILED' : '✅ PASSED'}\n`);
    
    console.log('Layout Sections:');
    console.log(`   Header:     ${headerMetrics.found && !headerMetrics.hasExcessiveRightSpacing ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`   Cards:      ${!baselineMetrics.hasRightSpacing ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`   Chart:      ${chartMetrics.found && !chartMetrics.hasExcessiveRightSpacing ? '✅ PASSED' : '❌ FAILED'}\n`);
    
    if (allTestsPassed) {
      console.log('✅ ALL TESTS PASSED - Responsive design working correctly!\n');
    } else {
      console.log('❌ SOME TESTS FAILED - Responsive design issues detected\n');
    }
    
    console.log('━'.repeat(60));
    
    await browser.close();
    process.exit(allTestsPassed ? 0 : 1);
    
  } catch (error) {
    console.error('\n❌ Test Error:', error.message);
    if (browser) await browser.close();
    process.exit(1);
  }
}

async function getLayoutMetrics(page) {
  return await page.evaluate(() => {
    const container = document.querySelector('[class*="flex"][class*="gap-4"][class*="overflow-x-auto"]');
    const cards = document.querySelectorAll('[class*="flex-shrink-0"][class*="w-72"]');
    
    if (!container || cards.length === 0) {
      return {
        containerWidth: 0,
        cardCount: 0,
        cardWidth: 0,
        totalCardsWidth: 0,
        hasHorizontalScroll: false,
        hasRightSpacing: false,
        windowWidth: window.innerWidth
      };
    }
    
    const containerRect = container.getBoundingClientRect();
    const firstCard = cards[0].getBoundingClientRect();
    const lastCard = cards[cards.length - 1].getBoundingClientRect();
    
    // Calculate if there's excessive right spacing
    const hasExcessiveRightSpacing = lastCard.right < window.innerWidth - 30 && 
                                     containerRect.right > window.innerWidth + 10;
    
    return {
      containerWidth: containerRect.width,
      cardCount: cards.length,
      cardWidth: firstCard.width,
      totalCardsWidth: lastCard.right - firstCard.left,
      hasHorizontalScroll: container.scrollWidth > container.clientWidth,
      hasRightSpacing: hasExcessiveRightSpacing,
      windowWidth: window.innerWidth
    };
  });
}

runUIResponsiveTest().catch(console.error);
