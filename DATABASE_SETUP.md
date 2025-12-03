# SQLite Backend Setup for Nur Investment Fund

## Architecture

Your app now uses a local SQLite database instead of localStorage:
- **Backend API**: Node.js + Express running on `http://localhost:5000`
- **Frontend**: React + Vite running on `http://localhost:5173`
- **Database**: SQLite (`server/nur_fund.db`)

## Starting the App

### Option 1: Run Both Servers Together
```bash
npm start
```
This runs the API server and Vite dev server concurrently.

### Option 2: Run Separately
Terminal 1 - Start API Server:
```bash
npm run server
```

Terminal 2 - Start Frontend:
```bash
npm run dev
```

## Database Structure

### Tables
1. **equities_companies** - Stores company data (Equity ETF, Apple, NVIDIA, etc.)
2. **asset_monthly_data** - Stores monthly values for each asset (jan-dec)
3. **performance_data** - Stores monthly portfolio performance
4. **user_profiles** - Stores user information with roles (admin/user)

### API Endpoints

**Equities Companies:**
- `GET /api/equities-companies` - List all companies
- `POST /api/equities-companies` - Add new company
- `PUT /api/equities-companies/:id` - Update company
- `DELETE /api/equities-companies/:id` - Delete company

**Asset Monthly Data:**
- `GET /api/asset-monthly-data` - Get all monthly data
- `PUT /api/asset-monthly-data/:assetName` - Update monthly values

**User Profiles:**
- `GET /api/user-profiles` - List all users
- `POST /api/user-profiles` - Add new user
- `PUT /api/user-profiles/:id` - Update user
- `DELETE /api/user-profiles/:id` - Delete user

**Performance:**
- `GET /api/performance-data` - Get performance data

## Migration from localStorage

The frontend should use the `utils/api.js` functions instead of localStorage. Example:

```javascript
import { fetchEquitiesCompanies, updateAssetMonthlyData } from '../utils/api.js';

// Fetch companies
const companies = await fetchEquitiesCompanies();

// Update monthly data
await updateAssetMonthlyData('Equity ETF', {
  jan: 250000,
  feb: 255000,
  // ...
  incorporated: 'Luxembourg'
});
```

## Reset/Clear Database

Delete `server/nur_fund.db` and restart the server to reset to initial data.

## Notes
- SQLite persists data to disk automatically
- Database file: `server/nur_fund.db`
- Initial data is seeded on first server start
- API runs on port 5000, frontend on 5173
