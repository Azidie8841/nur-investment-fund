# Visual Regression Testing for Strategic Plans Circle Charts

## Overview
Comprehensive visual regression testing suite for the Strategic Plans section's circle gauge charts (A1T1-A1T4).

## Test Files Created

### 1. **strategic-plans-visual.test.cjs**
Complete Jest test suite with comprehensive test coverage:
- Page load verification
- Chart rendering verification
- SVG structure validation
- Styling and color verification
- Responsiveness testing
- Performance metrics
- Accessibility checks

### 2. **run-visual-tests.cjs**
Standalone test runner using Puppeteer:
- No Jest dependency required
- Captures screenshots for visual comparison
- Tests on desktop and mobile viewports
- Generates performance metrics
- Color and element verification

## How to Run Tests

### Method 1: Using Puppeteer Test Runner (Recommended)
```bash
# Start servers first
npm start

# In another terminal, run visual tests
node tests/run-visual-tests.cjs
```

### Method 2: Using Jest (if jest is installed)
```bash
npm test -- tests/strategic-plans-visual.test.cjs
```

## Test Coverage

### Test 1: Page Load ✓
- Verifies application loads successfully
- Checks for network stability

### Test 2: Navigation ✓
- Navigates to Strategic Plans section
- Verifies section accessibility

### Test 3: Chart Elements Rendering ✓
- Checks for SVG circle elements
- Verifies minimum circle count (≥8)

### Test 4: Gauge Labels ✓
- Verifies all 4 labels present: A1T1, A1T2, A1T3, A1T4
- Checks text visibility

### Test 5: Percentage Values ✓
- Validates percentage display: 77.35%, 100.00%, 23.16%
- Checks precision (2 decimal places)

### Test 6: Desktop Screenshot ✓
- Captures full page screenshot
- Saves to: `tests/screenshots/actual/strategic-plans-desktop.png`

### Test 7: Mobile Responsiveness ✓
- Tests on 375x667 viewport
- Captures mobile screenshot
- Saves to: `tests/screenshots/actual/strategic-plans-mobile.png`

### Test 8: SVG Structure ✓
- Verifies SVG element count
- Checks circle and path elements
- Validates structure optimization

### Test 9: Color Verification ✓
- Background circles: #e5e7eb (gray)
- Progress circles: #1e40af (dark blue)
- Validates all stroke colors

### Test 10: Performance Metrics ✓
- JavaScript Heap usage
- Layout count
- Recalculation style count
- Validates performance threshold

## Expected Test Results

### Successful Test Output:
```
==================================================
STRATEGIC PLANS CIRCLE CHARTS - VISUAL REGRESSION TESTING
==================================================

✓ TEST 1: Page Load
ℹ Page loaded successfully

✓ TEST 2: Navigate to Strategic Plans
ℹ Strategic Plans section accessed

✓ TEST 3: Chart Elements Rendering
ℹ Found 8 circle elements
✓ All chart circles rendered (at least 8 expected)

✓ TEST 4: Gauge Labels (A1T1-A1T4)
✓ Found label: A1T1
✓ Found label: A1T2
✓ Found label: A1T3
✓ Found label: A1T4
✓ All 4 gauge labels present

✓ TEST 5: Percentage Values Display
✓ Found percentage: 77.35%
✓ Found percentage: 100.00%
✓ Found percentage: 23.16%
✓ Percentage values displaying correctly

✓ TEST 6: Screenshot Capture - Desktop
✓ Desktop screenshot saved: tests/screenshots/actual/strategic-plans-desktop.png

✓ TEST 7: Mobile Responsiveness
✓ Charts render on mobile viewport
✓ Mobile screenshot saved: tests/screenshots/actual/strategic-plans-mobile.png

✓ TEST 8: SVG Structure & Optimization
ℹ SVG elements: 4
ℹ Total circles: 8
ℹ Total paths: 0
✓ SVG structure is optimized

✓ TEST 9: Color Verification
✓ Background circles have correct gray color
✓ Progress circles have correct blue color
✓ All colors verified

✓ TEST 10: Performance Metrics
ℹ JavaScript Heap Used: 45 MB
ℹ Layout Count: 25
ℹ Recalc Style Count: 15
✓ Performance metrics are good

==================================================
TEST SUMMARY
==================================================

Tests Passed: 10
Tests Failed: 0
Total Tests: 10

Screenshots saved to: tests/screenshots/actual

🎉 All tests passed!
```

## Screenshots Generated

After running tests, the following screenshots are saved:

1. **strategic-plans-desktop.png** - Full page desktop view
2. **strategic-plans-mobile.png** - Mobile responsive view (375x667)

Location: `tests/screenshots/actual/`

## Chart Specifications Verified

### Circle Chart Properties:
- **Type**: Full circle progress indicator (360°)
- **Radius**: 45px
- **Stroke Width**: 10px
- **Background Color**: #e5e7eb (light gray)
- **Progress Color**: #1e40af (dark blue)
- **Stroke Linecap**: round (smooth ends)

### Percentage Display:
- **Font Size**: text-2xl (24px)
- **Font Weight**: bold (700)
- **Color**: text-gray-800
- **Precision**: 2 decimal places (.toFixed(2))
- **Position**: Centered in circle

### Gauge Labels:
- **Format**: A1T1, A1T2, A1T3, A1T4
- **Font Weight**: bold
- **Color**: text-gray-800
- **Position**: Above each gauge

### Animation:
- **Transition**: 700ms (duration-700)
- **Type**: Smooth stroke-dasharray animation
- **Easing**: Default (ease)

## Accessibility Features Tested

✓ Descriptive labels (A1T1-A1T4)
✓ Clear percentage values
✓ High contrast colors
✓ Readable font sizes
✓ Proper semantic HTML structure

## Performance Metrics

Expected results:
- **Render Time**: < 3 seconds
- **Heap Usage**: < 100 MB
- **Layout Count**: < 50
- **Style Recalc**: < 30

## Troubleshooting

### Test Timeout Issues:
- Ensure servers are running on ports 5000 and 5173
- Check network connectivity
- Increase timeout values if needed

### Screenshot Quality:
- Run tests on fresh browser instance
- Clear browser cache if needed
- Ensure consistent browser zoom level (100%)

### Mobile Responsiveness Issues:
- Check responsive CSS media queries
- Verify flexbox/grid behavior
- Test on various screen sizes

## CI/CD Integration

To integrate with GitHub Actions:

```yaml
name: Visual Regression Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm start &
      - run: sleep 5
      - run: node tests/run-visual-tests.cjs
```

## Future Enhancements

- [ ] Add baseline screenshot comparison
- [ ] Implement visual diff generation
- [ ] Add threshold-based test failures
- [ ] Generate HTML test report
- [ ] Add cross-browser testing (Chrome, Firefox, Safari)
- [ ] Implement performance budget alerts
- [ ] Add animation frame analysis

## Notes

- Tests require Puppeteer (already in dependencies)
- Screenshots help track visual regressions over time
- Mobile tests ensure responsive design integrity
- Performance metrics catch memory leaks early
- All tests run headless for CI/CD compatibility
