# Alternative Investment Monthly Investments - CRUD Implementation

**Version:** v1.2.15  
**Date:** December 18, 2025  
**Status:** ✅ Complete

## Overview

Full database table and CRUD (Create, Read, Update, Delete) functionality for Alternative Investment Monthly Investments (2025) tracking.

## Database Table

### Table: `alternative_investment_monthly_investments`

```sql
CREATE TABLE IF NOT EXISTS alternative_investment_monthly_investments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  investment_name TEXT NOT NULL,
  month TEXT NOT NULL,
  amount_added REAL DEFAULT 0,
  quantity REAL DEFAULT 0,
  total_invested REAL DEFAULT 0,
  value REAL DEFAULT 0,
  profit REAL GENERATED ALWAYS AS (value - total_invested) STORED,
  return_percentage REAL GENERATED ALWAYS AS (CASE WHEN total_invested > 0 THEN (profit / total_invested * 100) ELSE 0 END) STORED,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(investment_name) REFERENCES alternative_investments(name),
  UNIQUE(investment_name, month)
)
```

### Columns

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK | Unique identifier |
| `investment_name` | TEXT | Name of alternative investment (FK to alternative_investments.name) |
| `month` | TEXT | Month name (Jan, Feb, Mar, etc.) |
| `amount_added` | REAL | Amount added that month |
| `quantity` | REAL | Quantity of units added |
| `total_invested` | REAL | Cumulative total invested |
| `value` | REAL | Current market value |
| `profit` | REAL | Calculated: value - total_invested (GENERATED) |
| `return_percentage` | REAL | Calculated: (profit / total_invested * 100) (GENERATED) |
| `created_at` | DATETIME | Record creation timestamp |
| `updated_at` | DATETIME | Last update timestamp |

### Constraints

- **PRIMARY KEY:** id (auto-increment)
- **FOREIGN KEY:** investment_name → alternative_investments.name
- **UNIQUE:** (investment_name, month) - one entry per month per investment

---

## Backend API Endpoints

### 1. **GET** - Fetch All Monthly Investments for an Alternative Investment

**Endpoint:** `GET /api/alternative-investment-monthly-investments/:investmentName`

**Parameters:**
- `investmentName` (URL param): Name of the alternative investment

**Response:**
```json
[
  {
    "id": 1,
    "investment_name": "Bitcoin",
    "month": "January",
    "amount_added": 5000,
    "quantity": 0.15,
    "total_invested": 50000,
    "value": 55000,
    "profit": 5000,
    "return_percentage": 10.0,
    "created_at": "2025-12-18T10:30:00",
    "updated_at": "2025-12-18T10:30:00"
  }
]
```

---

### 2. **POST** - Create New Monthly Investment Entry

**Endpoint:** `POST /api/alternative-investment-monthly-investments`

**Request Body:**
```json
{
  "investment_name": "Bitcoin",
  "month": "January",
  "amount_added": 5000,
  "quantity": 0.15,
  "total_invested": 50000,
  "value": 55000
}
```

**Response:**
```json
{
  "id": 1,
  "investment_name": "Bitcoin",
  "month": "January",
  "amount_added": 5000,
  "quantity": 0.15,
  "total_invested": 50000,
  "value": 55000
}
```

**Validation:**
- `investment_name` required
- `month` required
- Cannot have duplicate (investment_name, month) combination

---

### 3. **PUT** - Update Monthly Investment Entry

**Endpoint:** `PUT /api/alternative-investment-monthly-investments/:id`

**Parameters:**
- `id` (URL param): Record ID

**Request Body:**
```json
{
  "amount_added": 6000,
  "quantity": 0.18,
  "total_invested": 52000,
  "value": 58000
}
```

**Response:**
```json
{
  "id": 1,
  "investment_name": "Bitcoin",
  "month": "January",
  "amount_added": 6000,
  "quantity": 0.18,
  "total_invested": 52000,
  "value": 58000,
  "profit": 6000,
  "return_percentage": 11.54,
  "created_at": "2025-12-18T10:30:00",
  "updated_at": "2025-12-18T11:00:00"
}
```

**Note:** Profit and return_percentage are auto-calculated

---

### 4. **DELETE** - Delete Monthly Investment Entry

**Endpoint:** `DELETE /api/alternative-investment-monthly-investments/:id`

**Parameters:**
- `id` (URL param): Record ID

**Response:**
```json
{
  "success": true,
  "message": "Monthly investment deleted successfully"
}
```

---

## Frontend API Functions

Located in: `utils/api.js`

### Function: `fetchAlternativeInvestmentMonthlyInvestments(investmentName)`
Get all monthly investments for an alternative investment

```javascript
const data = await fetchAlternativeInvestmentMonthlyInvestments('Bitcoin');
```

### Function: `createAlternativeInvestmentMonthlyInvestment(investmentName, month, amountAdded, quantity, totalInvested, value)`
Create a new monthly investment entry

```javascript
const result = await createAlternativeInvestmentMonthlyInvestment(
  'Bitcoin',
  'January',
  5000,
  0.15,
  50000,
  55000
);
```

### Function: `updateAlternativeInvestmentMonthlyInvestment(id, amountAdded, quantity, totalInvested, value)`
Update an existing monthly investment entry

```javascript
const updated = await updateAlternativeInvestmentMonthlyInvestment(
  1,
  6000,
  0.18,
  52000,
  58000
);
```

### Function: `deleteAlternativeInvestmentMonthlyInvestment(id)`
Delete a monthly investment entry

```javascript
await deleteAlternativeInvestmentMonthlyInvestment(1);
```

---

## Database Layer Functions

Located in: `server/db.cjs`

### Function: `getAlternativeInvestmentMonthlyInvestments(investmentName)`
Retrieve all monthly investments for an investment (ordered by month)

### Function: `createAlternativeInvestmentMonthlyInvestment(investmentName, month, amountAdded, quantity, totalInvested, value)`
Insert new monthly investment record

### Function: `updateAlternativeInvestmentMonthlyInvestment(id, amountAdded, quantity, totalInvested, value)`
Update monthly investment record (auto-recalculates profit & return%)

### Function: `deleteAlternativeInvestmentMonthlyInvestment(id)`
Delete monthly investment record

### Function: `getAlternativeInvestmentMonthlyInvestmentById(id)`
Retrieve single record by ID

---

## UI Integration Points

The following components need to be updated to use these CRUD functions:

### In `NurInvestmentFund.jsx` - `AlternativeInvestmentDetailView()` component

**Current Table Structure:**
- Month
- Add (amount_added)
- Quantity
- Total Invested (total_invested)
- Value (value)
- Profit (calculated)
- Return (return_percentage, calculated)
- Actions (Edit/Delete)

**Required UI Updates:**
1. Add button opens modal to call `createAlternativeInvestmentMonthlyInvestment()`
2. Edit button populates modal and calls `updateAlternativeInvestmentMonthlyInvestment()`
3. Delete button calls `deleteAlternativeInvestmentMonthlyInvestment()`
4. On component mount, call `fetchAlternativeInvestmentMonthlyInvestments()` for each investment

---

## Usage Examples

### Add a new monthly investment
```javascript
import { createAlternativeInvestmentMonthlyInvestment } from './utils/api.js';

// When user clicks "Add" button in modal
const newEntry = await createAlternativeInvestmentMonthlyInvestment(
  'Bitcoin',      // investment_name
  'January',      // month
  5000,           // amount_added
  0.15,           // quantity
  50000,          // total_invested
  55000           // value
);
```

### Update existing entry
```javascript
import { updateAlternativeInvestmentMonthlyInvestment } from './utils/api.js';

// When user clicks "Save" after editing
const updated = await updateAlternativeInvestmentMonthlyInvestment(
  1,              // id
  6000,           // amount_added
  0.18,           // quantity
  52000,          // total_invested
  58000           // value
);
```

### Delete entry
```javascript
import { deleteAlternativeInvestmentMonthlyInvestment } from './utils/api.js';

// When user clicks "Delete"
await deleteAlternativeInvestmentMonthlyInvestment(1);
```

---

## Data Flow

```
UI Component
    ↓
React State (useState for form)
    ↓
API Function (utils/api.js)
    ↓
Express Endpoint (server/index.cjs)
    ↓
Database Function (server/db.cjs)
    ↓
SQLite Table
```

---

## Calculated Fields

### Profit
```
profit = value - total_invested
```
Automatically calculated by database (GENERATED column)

### Return Percentage
```
return_percentage = (profit / total_invested) * 100
```
Automatically calculated by database (GENERATED column)

---

## Compatibility

- **Version:** v1.2.15
- **Database:** SQLite (better-sqlite3)
- **Backend:** Express.js 5.2.1
- **Frontend:** React 18.2.0 + Vite 5.4.21
- **Compatible with:** v1.2.14+ code

---

## Next Steps for UI Implementation

1. ✅ Database table created
2. ✅ API endpoints created
3. ✅ Frontend functions created
4. ⏳ **TODO:** Update `AlternativeInvestmentDetailView` component in `NurInvestmentFund.jsx`
   - Load data on mount
   - Add modal for new entries
   - Edit functionality
   - Delete functionality
5. ⏳ **TODO:** Test CRUD operations end-to-end
6. ⏳ **TODO:** Create v1.2.16 with UI updates

---

## Backup Created

Before implementing UI changes, a backup was created at:
- `server/backups/nur_fund_backup_2025-12-18T00-07-58-616Z.db`
- Compatible with: v1.2.14
