const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Navigate to the app
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  
  console.log('Testing zoom responsiveness for investment cards...\n');
  
  // Test 1: Get card width at 100% zoom
  const width100 = await page.evaluate(() => {
    const card = document.querySelector('[class*="flex-shrink-0"]');
    if (!card) return null;
    return window.getComputedStyle(card).width;
  });
  
  console.log(`✓ Card width at 100% zoom: ${width100}`);
  
  // Test 2: Zoom to 150%
  await page.evaluate(() => {
    document.body.style.zoom = '1.5';
  });
  
  const width150 = await page.evaluate(() => {
    const card = document.querySelector('[class*="flex-shrink-0"]');
    if (!card) return null;
    return window.getComputedStyle(card).width;
  });
  
  console.log(`✓ Card width at 150% zoom: ${width150}`);
  
  // Test 3: Zoom back to 100%
  await page.evaluate(() => {
    document.body.style.zoom = '1';
  });
  
  const widthBack = await page.evaluate(() => {
    const card = document.querySelector('[class*="flex-shrink-0"]');
    if (!card) return null;
    return window.getComputedStyle(card).width;
  });
  
  console.log(`✓ Card width back at 100% zoom: ${widthBack}`);
  
  // Test 4: Check container responsiveness
  const containerWidth100 = await page.evaluate(() => {
    const container = document.querySelector('div[style*="100vw"]');
    if (!container) return null;
    return {
      style: container.getAttribute('style'),
      computed: window.getComputedStyle(container).width
    };
  });
  
  console.log(`✓ Container uses 100vw: ${containerWidth100.style.includes('100vw') ? 'YES' : 'NO'}`);
  console.log(`✓ Container computed width: ${containerWidth100.computed}`);
  
  // Test 5: Verify min-w-72 class exists
  const hasMinWidth = await page.evaluate(() => {
    const card = document.querySelector('[class*="min-w-72"]');
    return card ? true : false;
  });
  
  console.log(`✓ Cards have min-w-72 class: ${hasMinWidth ? 'YES' : 'NO'}`);
  
  console.log('\n✅ All zoom tests completed!');
  
  await browser.close();
})();
