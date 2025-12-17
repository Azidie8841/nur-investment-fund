# Alternative Investments Detail Page Implementation

## Overview
Successfully implemented a comprehensive Alternative Investments detail page that mirrors the Equities detail page structure, featuring Bitcoin and Gold allocation strategy cards with full fund tracking capabilities.

## Database Structure (Verified)

### 1. **alternative_investments** Table
```sql
CREATE TABLE alternative_investments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  asset_type TEXT NOT NULL,          -- e.g., 'crypto', 'gold', 'Bitcoin', 'Gold'
  platform TEXT,                     -- e.g., 'Kraken', 'Gemini', 'Coinbase'
  quantity REAL,                     -- Units held
  unit_price REAL,                   -- Price per unit
  current_value REAL NOT NULL,       -- Total market value
  cost REAL,                         -- Total cost paid
  allocation REAL DEFAULT 0,         -- Allocation percentage
  notes TEXT,                        -- Additional notes
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### 2. **alternative_investment_monthly_data** Table
```sql
CREATE TABLE alternative_investment_monthly_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  investment_name TEXT NOT NULL,
  jan REAL, feb REAL, mar REAL, apr REAL, may REAL, jun REAL,
  jul REAL, aug REAL, sep REAL, oct REAL, nov REAL, dec REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(investment_name) REFERENCES alternative_investments(name),
  UNIQUE(investment_name)
)
```

**Status:** ✅ Both tables exist and are properly configured

## UI Implementation

### Alternative Investment Detail View Features

#### 1. **Header Section**
- Back button to return to All Investments view
- Title: "Alternative Investments"
- Total market value display
- Asset count with description

#### 2. **Fund Allocation Strategy Cards** (2 Cards - Bitcoin & Gold)

**Bitcoin Card** (Orange Theme - 50% allocation)
- Icon: ₿ (Bitcoin symbol)
- Target allocation: 50%
- Should invest amount (calculated from fund target value)
- Current market value (sum of all Bitcoin holdings)
- Buy/Sell recommendation based on difference
- Progress bar showing allocation progress
- Progress percentage

**Gold Card** (Yellow Theme - 50% allocation)
- Icon: 🏆 (Trophy symbol)
- Target allocation: 50%
- Should invest amount (calculated from fund target value)
- Current market value (sum of all Gold holdings)
- Buy/Sell recommendation based on difference
- Progress bar showing allocation progress
- Progress percentage

**Allocation Logic:**
```
Bitcoin Target = (Fund Target Value) × (Alternative Allocation %) × 50%
Gold Target = (Fund Target Value) × (Alternative Allocation %) × 50%

If Market Value < Should Invest → 🟠 BUY recommendation
If Market Value > Should Invest (>10% diff) → 🔴 SELL recommendation
Otherwise → No action needed
```

#### 3. **Investments Table**
Displays all alternative investments with columns:
- **Asset Type**: Cryptocurrency, Gold, etc. (clickable to filter)
- **Asset Name**: Specific investment name (e.g., Bitcoin, Gold Bars)
- **Units Held**: Quantity of the asset
- **Unit Price**: Price per unit in RM
- **Market Value**: Total current value in RM
- **Cost**: Total cost paid in RM
- **Profit**: Market Value - Cost
- **Return %**: (Profit / Cost) × 100%

Color-coded profit/return:
- Green: Positive gains
- Red: Losses

#### 4. **Historic Investments Chart**
- Bar chart showing 2025 historical investment values
- Uses `alternative_investment_monthly_data` for monthly tracking
- Includes tooltip with formatted currency values

## UI Similarity with Equities Detail Page

| Feature | Equities | Alternative |
|---------|----------|-------------|
| Header | ✅ Same structure | ✅ Implemented |
| Allocation Cards | 4 cards (Index, Dividend, Mag 7, Growth) | 2 cards (Bitcoin, Gold) |
| Card Layout | Gradient backgrounds + progress bars | ✅ Same styling |
| Company/Asset Table | Full table with profit/return | ✅ Full alternative investments table |
| Historical Chart | Bar chart for 2025 | ✅ Same implementation |
| Back Button | ← Back to All Investments | ✅ Implemented |
| Search Bar | Yes | ✅ Included |

## Data Flow

### State Variables Used
```javascript
// Main state
const [alternativeInvestments, setAlternativeInvestments] = useState([]);
const [alternativeInvestmentMonthlyData, setAlternativeInvestmentMonthlyData] = useState({});
const [selectedAlternativeInvestment, setSelectedAlternativeInvestment] = useState(null);

// Fund settings
const [funds, setFunds] = useState([]);
const [allocationPercentages, setAllocationPercentages] = useState({
  equities: 60,
  fixedIncome: 30,
  alternatives: 8,    // Used for allocation calculations
  cash: 2
});
```

### API Calls
The page uses the following API functions (from utils/api.js):
- `fetchAlternativeInvestments()` - Get all alternative investments
- `fetchAlternativeInvestmentMonthlyData()` - Get monthly data
- `addAlternativeInvestment()` - Add new investment
- `updateAlternativeInvestment()` - Update existing investment
- `deleteAlternativeInvestment()` - Delete investment

## Allocation Calculation Example

**Scenario:**
- Fund Target Value: RM 5,000,000
- Alternative Allocation: 8%
- Total Alternative Allocation: RM 400,000

**Bitcoin Card:**
- Should Invest: 50% of RM 400,000 = RM 200,000
- Current Bitcoin Holdings: RM 180,000
- Recommendation: 🟠 BUY RM 20,000

**Gold Card:**
- Should Invest: 50% of RM 400,000 = RM 200,000
- Current Gold Holdings: RM 220,000
- Recommendation: 🔴 SELL RM 20,000 to rebalance

## File Modified
- **NurInvestmentFund.jsx** - AlternativeInvestmentListView component (lines 745-925)

## Component Integration
- Accessible via: Dashboard → All Investments → Alternative Investments
- Triggered when: `selectedInvestmentType === 'alternativeInvestment'` in main component
- Detail view for single investment: AlternativeInvestmentDetailView component

## Features
✅ Bitcoin allocation strategy with 50% target
✅ Gold allocation strategy with 50% target
✅ Buy/Sell recommendations based on allocation targets
✅ Progress bars for allocation tracking
✅ Comprehensive investments table
✅ Profit and return percentage calculations
✅ Historical value tracking with monthly data
✅ Consistent styling with Equities page
✅ Responsive design (grid layout adapts to screen size)
✅ Interactive table rows (click to view investment details)

## Database Ready
✅ alternative_investments table exists
✅ alternative_investment_monthly_data table exists
✅ Both tables have all necessary columns
✅ Foreign key relationships configured
✅ Ready for Bitcoin and Gold data

## Next Steps (Optional Enhancements)
1. Add API endpoints for allocation recommendations
2. Add edit functionality for individual investments
3. Add monthly allocation tracking
4. Add year-over-year comparison charts
5. Add portfolio rebalancing suggestions
6. Add price tracking for real-time updates
