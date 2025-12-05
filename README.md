# Investment Fund Management System

A React-based investment fund management application with admin controls, user profiles, and real-time data tracking. Built with Vite, React 18, Tailwind CSS, SQLite, and Express.js.

## Features

✅ **Dashboard View**
- Fund value display in Ringgit (RM)
- Asset allocation pie chart
- Recent activity tracking
- Performance metrics

✅ **Financial Tab (NEW)**
- Organized menu structure with Investment and Savings submenus
- Dropdown navigation for better UI organization
- Quick access to financial features

✅ **Investment Submenu**
- Dashboard
- Portfolio view
- Performance tracking
- All Investments overview
- Governance
- Documents

✅ **Equities Management**
- View all companies with market values
- Dynamic value calculation from monthly data
- Country and sector information
- Click to view detailed asset information
- Historic investment tracking (2025 data)
- Values track from inside monthly database records

✅ **Fixed Income Management (Enhanced)**
- View fixed income bonds with ratings and maturity dates
- Value tracking from monthly database records (not static base values)
- Bond type, rating, and country information
- Monthly value entry and tracking
- Dynamic card value updates based on most recent monthly data

✅ **Alternative Investments (Enhanced)**
- Asset type categorization (Crypto, Real Estate, etc.)
- Platform information tracking
- Unit price and quantity tracking
- Values track from inside database (current_value field)
- Dynamic portfolio percentage calculations

✅ **Investment Card Improvements**
- All investment cards now track inside values from monthly/database data
- Equities: Calculates from monthly company values (base currency × 3.7 conversion)
- Fixed Income: Calculates from monthly bond values (base currency × 3.7 conversion)
- Alternative Investments: Tracks current_value directly (already in RM)
- Cash & Cash Equivalents: Tracks from savings records (already in RM)
- Dynamic percentage bars reflect actual portfolio allocation
- Real-time updates when data is modified

✅ **Savings Management (NEW)**
- Add/Edit/Delete savings records
- Cash In and Cash Out transaction types
- Monthly savings chart (Jan-Dec)
- Yearly savings chart (2025 onwards)
- Savings goals tracking
- Emergency fund coverage calculator
- Motivational status messages
- PDF export functionality

✅ **Cash & Cash Equivalents (NEW - Enhanced)**
- Full CRUD operations (Create, Read, Update, Delete) for cash records
- Instrument Type field (e.g., Cash, Money Market, Savings Account)
- Platform field (e.g., bank name, exchange name)
- Current Balance tracking in RM
- Dynamic value calculation from database records
- Real-time portfolio percentage updates
- Inline edit/delete functionality with save/cancel options

✅ **Admin Panel**
- Add/Edit/Delete companies
- Edit monthly asset values (Jan-Dec)
- Add/Edit/Delete savings records
- Add/Edit/Delete savings goals
- Decimal value support (e.g., 1,505.59)
- Real-time data persistence to database

✅ **Charts & Visualizations**
- Monthly savings chart with cash in/out/cumulative totals
- Yearly savings chart with aggregated data
- Asset allocation pie chart
- Fund performance line chart
- Responsive Recharts integration

✅ **All Investments Overview**
- View all investment segments (Equities, Fixed Income, Real Estate, Renewable Energy)
- Dynamic total calculations
- Investment allocation percentages
- Ringgit currency display

✅ **User Management**
- User profiles with role-based access
- Admin and user roles
- Profile management

✅ **Database**
- SQLite for persistent data storage
- RESTful API with Express.js
- CORS enabled for frontend communication
- Auto-initialization with seed data
- Savings records and goals tables

✅ **Sidebar Navigation**
- Organized menu with nested dropdowns
- Mobile-friendly overlay menu
- Fixed sidebar on desktop with content pushed right

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Recharts
- **Backend**: Node.js, Express.js, better-sqlite3
- **Database**: SQLite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **PDF Export**: jsPDF, html2canvas

## Project Structure

```
src/
├── components/
│   ├── NurInvestmentFund.jsx    # Main app component
│   ├── AdminPanel.jsx            # Admin management interface
│   ├── UserProfilePanel.jsx      # User profile management
│   └── LoginPage.jsx             # Login interface
├── server/
│   ├── index.cjs                 # Express API server
│   ├── db.cjs                    # SQLite database setup
│   └── nur_fund.db               # Database (auto-created)
├── utils/
│   └── api.js                    # API client functions
├── App.jsx                        # App component
├── main.jsx                       # React entry point
└── index.css                      # Global styles
```

## Installation

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/nur-investment-fund.git
cd nur-investment-fund
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the servers**

Open two terminal windows:

Terminal 1 - Start API Server (port 5000):
```bash
npm run server
```

Terminal 2 - Start Frontend Dev Server (port 5173):
```bash
npm run dev
```

Or start both simultaneously:
```bash
npm start
```

## Usage

### Access the Application

- **Frontend**: http://localhost:5173
- **API Server**: http://localhost:5000/api

### Available Routes

**Companies Management:**
- `GET /api/equities-companies` - List all companies
- `POST /api/equities-companies` - Add new company
- `PUT /api/equities-companies/:id` - Update company
- `DELETE /api/equities-companies/:id` - Delete company

**Monthly Data:**
- `GET /api/asset-monthly-data` - Get all monthly data
- `PUT /api/asset-monthly-data/:assetName` - Update monthly values

**Performance Data:**
- `GET /api/performance-data` - Get performance metrics

**Savings Records:**
- `GET /api/savings-records` - List all savings records
- `POST /api/savings-records` - Add new record (Cash In/Out)
- `DELETE /api/savings-records/:id` - Delete record

**Savings Goals:**
- `GET /api/savings-goals` - List all savings goals
- `POST /api/savings-goals` - Add new goal
- `PUT /api/savings-goals/:id` - Update goal
- `DELETE /api/savings-goals/:id` - Delete goal

**User Profiles:**
- `GET /api/user-profiles` - List all profiles
- `POST /api/user-profiles` - Add profile
- `PUT /api/user-profiles/:id` - Update profile
- `DELETE /api/user-profiles/:id` - Delete profile

### Admin Features

1. **Go to Admin Panel** → Click "Admin" in sidebar
2. **Add Company**: Fill in name, value, sector, ownership, country
3. **Edit Company**: Click "Edit" on any company
4. **Edit Monthly Values**: Click "Edit Monthly" and enter values for each month
   - Values are entered in Ringgit (RM)
   - Supports decimal values (e.g., 1,505.59)
5. **Delete Company**: Click "Delete" to remove

### Default Login

- **Role**: Admin
- **Name**: Family Member
- **Email**: family@example.com

## Database

The SQLite database is automatically created on first run with these tables:

- `equities_companies` - Company information
- `asset_monthly_data` - Monthly asset values
- `performance_data` - Performance metrics
- `user_profiles` - User information

## Currency Conversion

- Base values are stored in the database
- Display value = Base value × 3.7 (RM conversion)
- All market values displayed are in Ringgit (RM)

## Scripts

```bash
npm run dev        # Start Vite dev server
npm run server     # Start API server
npm start          # Start both servers concurrently
npm run build      # Build for production
npm run preview    # Preview production build
```

## Data Flow

1. **Frontend** (React) → **API** (Express) → **Database** (SQLite)
2. When you edit values in Admin Panel:
   - Data sent to Express API
   - API updates SQLite database
   - Frontend fetches updated data
   - Charts and displays update in real-time

## Performance Features

- Real-time calculation of total market values
- Dynamic monthly value tracking
- Historical data visualization (2025 only)
- Efficient database queries with better-sqlite3
- CORS-enabled API for cross-origin requests

## Troubleshooting

### API Server won't start
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Kill process using port 5000
taskkill /PID <PID> /F
```

### Frontend shows blank
- Ensure API server is running on port 5000
- Check browser console for errors
- Verify .env variables if needed

### Database errors
```bash
# Delete and recreate database
rm server/nur_fund.db
npm run server
```

## Changelog

### Version 1.2.0 - December 4, 2025

## Changelog

### Version 1.2.0 - Current Release (December 5, 2025)

**New Features:**
- ✨ **Cash Records Management** - Full CRUD operations for cash equivalents with Instrument Type and Platform fields
- ✨ **Investment Card Value Tracking** - All investment cards now display values from inside (monthly/database data, not static base values)
- ✨ **Dynamic Portfolio Percentages** - Real-time percentage bar updates based on actual investment values
- ✨ **Enhanced Cash Table** - New table layout showing Instrument Type, Platform, and Current Balance with edit/delete actions

**Improvements:**
- 🔧 Fixed Income card now calculates value from monthly bond data (using base currency × 3.7 conversion)
- 🔧 Equities card calculates from most recent monthly company values
- 🔧 Alternative Investments displays values directly from current_value field
- 🔧 Cash & Cash Equivalents card shows total from savings records
- 🔧 Database schema enhanced with instrument_type and platform fields for cash records
- 🔧 API endpoints updated to support edit/update operations for cash records
- 🔧 Improved UI consistency across all investment detail views

**Database Changes:**
- Added `instrument_type` column to savings_records table (default: "Cash")
- Added `platform` column to savings_records table

**API Endpoints Added:**
- `PUT /api/savings-records/:id` - Update cash record with new fields
- Enhanced `POST /api/savings-records` - Now accepts instrument_type and platform

### Version 1.1.0 - Previous Release

**New Features:**
- ✨ **Financial Tab Navigation** - New organized menu structure with Investment and Savings submenus
- ✨ **Investment Submenu** - Groups Dashboard, Portfolio, Performance, All Investments, Governance, and Documents
- ✨ **Yearly Savings Chart** - New visualization showing yearly cash in/out/cumulative totals from 2025 onwards
- ✨ **PDF Export** - Download savings reports as PDF (includes all charts, data, and metrics)
- ✨ **Sidebar Improvements** - Desktop sidebar now uses static positioning to push content (no overlay)

**Improvements:**
- 🔧 Organized navigation structure for cleaner UI
- 🔧 Better menu hierarchy with dropdown submenus
- 🔧 Improved sidebar display on desktop (content properly positioned)
- 🔧 Enhanced data visualization with yearly aggregations

**Dependencies Added:**
- jsPDF (v2.x) - PDF generation
- html2canvas - DOM to canvas conversion for PDF export

### Version 1.0.0 - Earlier Release

**Features:**
- Comprehensive Savings Management System
  - Add/Edit/Delete savings records with Cash In/Out types
  - Savings goals tracking with target amounts and dates
  - Monthly savings chart with cash in/out/cumulative totals
  - Emergency fund coverage calculator (RM 2,561/month basis)
  - Motivational status messages (6 tiers: 💪 to 🎉)
  - Emergency fund weeks display
- Complete Admin Panel for all data management

- Dashboard with fund performance and allocation views
- User profile management with role-based access
- Database persistence with SQLite
- RESTful API with Express.js

### Version 1.0.0 - Initial Release

**Core Features:**
- Investment tracking with equities, fixed income, real estate, and renewable energy
- Company management with market value calculations
- Asset allocation visualization
- Performance metrics and charts
- User management system
- Admin controls for data management

## Future Enhancements

- [ ] Multiple currency support
- [ ] Year-over-year comparison
- [ ] Advanced filtering and search
- [ ] Export to CSV/PDF
- [ ] Authentication with JWT
- [ ] Real-time data sync
- [ ] Mobile responsive improvements

## License

This project is private/proprietary.

## Support

For issues or questions, contact the development team.
