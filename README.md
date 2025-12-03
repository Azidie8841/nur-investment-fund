# Nur Investment Fund Management System

A React-based investment fund management application with admin controls, user profiles, and real-time data tracking. Built with Vite, React 18, Tailwind CSS, SQLite, and Express.js.

## Features

✅ **Dashboard View**
- Fund value display in Ringgit (RM)
- Asset allocation pie chart
- Recent activity tracking
- Performance metrics

✅ **Equities Management**
- View all companies with market values
- Dynamic value calculation from monthly data
- Country and sector information
- Click to view detailed asset information
- Historic investment tracking (2025 data)

✅ **Admin Panel**
- Add/Edit/Delete companies
- Edit monthly asset values (Jan-Dec)
- Decimal value support (e.g., 1,505.59)
- Real-time data persistence to database

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

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Recharts
- **Backend**: Node.js, Express.js, better-sqlite3
- **Database**: SQLite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts

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
