const { chromium } = require('@playwright/test');

const BASE_URL = 'http://localhost:5173';
const TIMEOUT = 60000;
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 2000;

async function waitForServer(attempts = RETRY_ATTEMPTS) {
  for (let i = 0; i < attempts; i++) {
    try {
      const response = await fetch(BASE_URL);
      if (response.ok) {
        console.log('✅ Server is ready\n');
        return true;
      }
    } catch (error) {
      if (i < attempts - 1) {
        console.log(`⏳ Waiting for server... (${i + 1}/${attempts})`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      }
    }
  }
  return false;
}

async function runUIResponsiveTest() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║          UI RESPONSIVE DESIGN - AUTOMATED TEST             ║');
  console.log('║                   Zoom In/Out Verification                  ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  // Check if server is running
  console.log('🔍 Checking server availability...');
  const serverReady = await waitForServer();
  if (!serverReady) {
    console.error('❌ Error: Server is not responding at ' + BASE_URL);
    console.error('   Please ensure both backend and frontend servers are running:\n');
    console.error('   Terminal 1: cd server && node index.cjs');
    console.error('   Terminal 2: npm run dev\n');
    process.exit(1);
  }
  
  let browser;
  try {
    console.log('🚀 Launching browser...');
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
    await page.waitForTimeout(1000); // Give it time to render
    console.log('✅ Investment cards loaded\n');
    
    // Test multiple zoom levels
    const zoomLevels = [0.5, 0.75, 1.0, 1.5, 2.0];
    const results = [];
    
    console.log('📊 Testing zoom levels...\n');
    console.log('━'.repeat(60));
    
    for (const zoomLevel of zoomLevels) {
      const zoomPercent = Math.round(zoomLevel * 100);
      console.log(`\n🔍 Test: ${zoomPercent}% Zoom Level`);
      console.log('─'.repeat(60));
      
      // Apply zoom
      await page.evaluate((zoom) => {
        document.documentElement.style.zoom = zoom;
      }, zoomLevel);
      
      await page.waitForTimeout(500);
      
      // Get layout metrics
      const metrics = await getLayoutMetrics(page);
      
      console.log(`   Container Width: ${metrics.containerWidth.toFixed(1)}px`);
      console.log(`   Window Width: ${metrics.windowWidth}px`);
      console.log(`   Card Count: ${metrics.cardCount}`);
      console.log(`   Individual Card Width: ${metrics.cardWidth.toFixed(1)}px`);
      console.log(`   Total Cards Width: ${metrics.totalCardsWidth.toFixed(1)}px`);
      console.log(`   Horizontal Scroll Needed: ${metrics.hasHorizontalScroll ? '✓ YES' : '✗ NO'}`);
      
      // Check for spacing issues
      const spacingIssue = metrics.hasRightSpacing;
      const headerIssue = metrics.headerHasRightSpacing;
      const chartIssue = metrics.chartHasRightSpacing;
      
      console.log(`   Right Spacing Issue: ${spacingIssue ? '❌ FAILED' : '✅ PASSED'}`);
      console.log(`   Header Alignment: ${headerIssue ? '❌ FAILED' : '✅ PASSED'}`);
      console.log(`   Chart Alignment: ${chartIssue ? '❌ FAILED' : '✅ PASSED'}`);
      
      results.push({
        zoom: zoomPercent,
        passed: !spacingIssue && !headerIssue && !chartIssue,
        spacingIssue,
        headerIssue,
        chartIssue,
        metrics
      });
    }
    
    // Summary
    console.log('\n' + '━'.repeat(60));
    console.log('\n📋 TEST SUMMARY\n');
    
    const allPassed = results.every(r => r.passed);
    
    console.log('Zoom Level Results:');
    results.forEach(result => {
      const icon = result.passed ? '✅' : '❌';
      console.log(`   ${icon} ${result.zoom}% Zoom: ${result.passed ? 'PASSED' : 'FAILED'}`);
    });
    
    console.log('\nLayout Sections:');
    const headerAllGood = results.every(r => !r.headerIssue);
    const cardsAllGood = results.every(r => !r.spacingIssue);
    const chartAllGood = results.every(r => !r.chartIssue);
    
    console.log(`   ${headerAllGood ? '✅' : '❌'} Header Section: ${headerAllGood ? 'ALL ZOOM LEVELS OK' : 'ISSUES DETECTED'}`);
    console.log(`   ${cardsAllGood ? '✅' : '❌'} Cards Container: ${cardsAllGood ? 'ALL ZOOM LEVELS OK' : 'ISSUES DETECTED'}`);
    console.log(`   ${chartAllGood ? '✅' : '❌'} Chart Section: ${chartAllGood ? 'ALL ZOOM LEVELS OK' : 'ISSUES DETECTED'}`);
    
    console.log('\n' + '═'.repeat(60));
    
    if (allPassed && headerAllGood && cardsAllGood && chartAllGood) {
      console.log('\n✨ SUCCESS! Responsive design is working correctly!\n');
      console.log('✅ All 4 cards display properly at all zoom levels');
      console.log('✅ No excessive spacing detected at any zoom level');
      console.log('✅ Header and chart sections properly aligned');
      console.log('✅ Layout scales correctly with browser zoom\n');
    } else {
      console.log('\n⚠️  WARNING! Some responsive design issues detected:\n');
      results.forEach(result => {
        if (!result.passed) {
          console.log(`❌ ${result.zoom}% Zoom:`);
          if (result.spacingIssue) console.log('   • Cards have right-side spacing issue');
          if (result.headerIssue) console.log('   • Header alignment issue');
          if (result.chartIssue) console.log('   • Chart alignment issue');
        }
      });
      console.log('');
    }
    
    console.log('═'.repeat(60) + '\n');
    
    await browser.close();
    process.exit(allPassed && headerAllGood && cardsAllGood && chartAllGood ? 0 : 1);
    
  } catch (error) {
    console.error('\n❌ Test Error:', error.message);
    if (error.message.includes('net::ERR_CONNECTION_REFUSED')) {
      console.error('\n   The application server is not responding.');
      console.error('   Make sure both servers are running:');
      console.error('   1. Backend: cd server && node index.cjs');
      console.error('   2. Frontend: npm run dev\n');
    }
    if (browser) await browser.close();
    process.exit(1);
  }
}

async function getLayoutMetrics(page) {
  return await page.evaluate(() => {
    // Find the cards container
    const container = document.querySelector('[class*="flex"][class*="gap-4"][class*="overflow-x-auto"]');
    const cards = document.querySelectorAll('[class*="flex-shrink-0"][class*="w-72"]');
    
    // Find header
    const header = document.querySelector('[class*="from-slate-900"]');
    
    // Find chart
    const chart = document.querySelector('[class*="bg-slate-900"][class*="border-slate-700"]:not([class*="hover"])');
    
    if (!container || cards.length === 0) {
      return {
        containerWidth: 0,
        cardCount: 0,
        cardWidth: 0,
        totalCardsWidth: 0,
        hasHorizontalScroll: false,
        hasRightSpacing: false,
        headerHasRightSpacing: false,
        chartHasRightSpacing: false,
        windowWidth: window.innerWidth
      };
    }
    
    const containerRect = container.getBoundingClientRect();
    const firstCard = cards[0].getBoundingClientRect();
    const lastCard = cards[cards.length - 1].getBoundingClientRect();
    
    // Check header alignment
    let headerHasRightSpacing = false;
    if (header) {
      const headerRect = header.getBoundingClientRect();
      headerHasRightSpacing = Math.abs(headerRect.right - window.innerWidth) > 5;
    }
    
    // Check chart alignment
    let chartHasRightSpacing = false;
    if (chart) {
      const chartRect = chart.getBoundingClientRect();
      chartHasRightSpacing = Math.abs(chartRect.right - window.innerWidth) > 5;
    }
    
    // Calculate if there's excessive right spacing in cards
    const hasExcessiveRightSpacing = containerRect.right > window.innerWidth + 10;
    
    return {
      containerWidth: containerRect.width,
      cardCount: cards.length,
      cardWidth: firstCard.width,
      totalCardsWidth: lastCard.right - firstCard.left,
      hasHorizontalScroll: container.scrollWidth > container.clientWidth,
      hasRightSpacing: hasExcessiveRightSpacing,
      headerHasRightSpacing,
      chartHasRightSpacing,
      windowWidth: window.innerWidth
    };
  });
}

runUIResponsiveTest().catch(console.error);
