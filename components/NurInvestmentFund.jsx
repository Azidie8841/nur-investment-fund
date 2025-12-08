import React, { useState, useEffect } from 'react';

import { LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Target, FileText, Users, Menu, X, Home, Briefcase, Shield, BookOpen, Calendar, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import AdminPanel from './AdminPanel';
import UserProfilePanel from './UserProfilePanel';
import LoginPage from './LoginPage';
import { fetchEquitiesCompanies, fetchAssetMonthlyData, fetchPerformanceData, fetchUserProfiles, updateEquitiesCompany, fetchSavingsRecords, fetchSavingsGoals, fetchFixedIncomeBonds, fetchFixedIncomeMonthlyData, fetchBondMonthlyDividends, fetchBondMonthlyValues, fetchAlternativeInvestments, fetchAlternativeInvestmentMonthlyData, addAlternativeInvestment, updateAlternativeInvestment, deleteAlternativeInvestment, updateAlternativeInvestmentMonthlyData, updateSavingsRecord, deleteSavingsRecord } from '../utils/api';

const NurInvestmentFund = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedInvestmentType, setSelectedInvestmentType] = useState(null);
  const [selectedBond, setSelectedBond] = useState(null);
  const [financialDropdownOpen, setFinancialDropdownOpen] = useState(false);
  const [investmentDropdownOpen, setInvestmentDropdownOpen] = useState(false);
  // Simulated current user (for demo, can be switched to login later)
  const [user, setUser] = useState({ id: 1, name: 'Family Member', email: 'family@example.com', role: 'admin' });

  // State for data from API
  const [equitiesCompanies, setEquitiesCompanies] = useState([]);
  const [fixedIncomeBonds, setFixedIncomeBonds] = useState([]);
  const [assetMonthlyData, setAssetMonthlyData] = useState({});
  const [fixedIncomeMonthlyData, setFixedIncomeMonthlyData] = useState({});
  const [bondMonthlyDividends, setBondMonthlyDividends] = useState({});
  const [bondMonthlyValues, setBondMonthlyValues] = useState({});
  const [profiles, setProfiles] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [savingsRecords, setSavingsRecords] = useState([]);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [alternativeInvestments, setAlternativeInvestments] = useState([]);
  const [alternativeInvestmentMonthlyData, setAlternativeInvestmentMonthlyData] = useState({});
  const [selectedAlternativeInvestment, setSelectedAlternativeInvestment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [funds, setFunds] = useState([]);

  // Strategic Plans state
  const [plans, setPlans] = useState([]);
  const [planProgress, setPlanProgress] = useState({});
  const [viewingThemeId, setViewingThemeId] = useState(null);
  const [editingTheme, setEditingTheme] = useState(null);
  const [themeDetails, setThemeDetails] = useState({});
  const [expandedTarget, setExpandedTarget] = useState(null);

  // Load data from API on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [companies, bonds, monthlyData, fixedMonthlyData, perfData, userProfiles, records, goals, altInvestments] = await Promise.all([
          fetchEquitiesCompanies(),
          fetchFixedIncomeBonds(),
          fetchAssetMonthlyData(),
          fetchFixedIncomeMonthlyData(),
          fetchPerformanceData(),
          fetchUserProfiles(),
          fetchSavingsRecords(),
          fetchSavingsGoals(),
          fetchAlternativeInvestments()
        ]);
        
        // Fetch dividends separately with error handling
        let dividends = {};
        try {
          dividends = await fetchBondMonthlyDividends();
        } catch (err) {
          console.warn('Could not load bond dividends:', err);
          dividends = {};
        }

        // Fetch monthly values separately with error handling
        let monthlyValues = {};
        try {
          monthlyValues = await fetchBondMonthlyValues();
        } catch (err) {
          console.warn('Could not load bond monthly values:', err);
          monthlyValues = {};
        }

        // Fetch alternative investment monthly data
        let altMonthlyData = {};
        try {
          for (const inv of altInvestments) {
            const monthlyData = await fetchAlternativeInvestmentMonthlyData(inv.name);
            altMonthlyData[inv.name] = monthlyData;
          }
        } catch (err) {
          console.warn('Could not load alternative investment monthly data:', err);
        }
        
        setEquitiesCompanies(companies);
        setFixedIncomeBonds(bonds);
        setAssetMonthlyData(monthlyData);
        setFixedIncomeMonthlyData(fixedMonthlyData);
        setBondMonthlyDividends(dividends);
        setBondMonthlyValues(monthlyValues);
        setPerformanceData(perfData.map(p => ({ month: p.month, value: p.value })));
        setProfiles(userProfiles);
        setSavingsRecords(records);
        setSavingsGoals(goals);
        setAlternativeInvestments(altInvestments);
        setAlternativeInvestmentMonthlyData(altMonthlyData);
        setError(null);
      } catch (err) {
        console.error('Error loading data from API:', err);
        setError('Failed to load data. Make sure the API server is running on port 5000.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Find current user object by id if logged in
  const currentUser = user ? profiles.find(p => p.id === user.id) : null;

  // Static data for charts and displays
  const initialAssetAllocation = [
    { name: 'Equities', value: 580000, color: '#3b82f6' },
    { name: 'Fixed Income', value: 435000, color: '#10b981' },
    { name: 'Cryptocurrencies', value: 290000, color: '#f59e0b' },
    { name: 'Gold', value: 87000, color: '#8b5cf6' },
    { name: 'Cash & Cash Equivalents', value: 58000, color: '#6b7280' }
  ];
  const [assetAllocation] = useState(initialAssetAllocation);

  const initialGlobalMarketData = [
    { year: '1990', equities: 50, fixed: 30, real: 10, renewable: 0 },
    { year: '1995', equities: 80, fixed: 50, real: 15, renewable: 0 },
    { year: '2000', equities: 120, fixed: 70, real: 25, renewable: 2 },
    { year: '2005', equities: 180, fixed: 100, real: 40, renewable: 5 },
    { year: '2010', equities: 250, fixed: 140, real: 60, renewable: 15 },
    { year: '2015', equities: 380, fixed: 200, real: 90, renewable: 35 },
    { year: '2020', equities: 520, fixed: 280, real: 130, renewable: 55 },
    { year: '2021', equities: 580, fixed: 310, real: 145, renewable: 65 },
    { year: '2022', equities: 620, fixed: 340, real: 160, renewable: 72 },
    { year: '2023', equities: 680, fixed: 380, real: 180, renewable: 80 },
    { year: '2024', equities: 700, fixed: 390, real: 185, renewable: 84 }
  ];

  const initialEquitiesData = [
    { year: '1998', value: 2.8 }, { year: '1999', value: 3.2 }, { year: '2000', value: 3.5 },
    { year: '2001', value: 3.1 }, { year: '2002', value: 2.9 }, { year: '2003', value: 3.8 },
    { year: '2004', value: 4.2 }, { year: '2005', value: 4.5 }, { year: '2006', value: 5.1 },
    { year: '2007', value: 5.8 }, { year: '2008', value: 4.2 }, { year: '2009', value: 5.5 },
    { year: '2010', value: 6.2 }, { year: '2011', value: 6.0 }, { year: '2012', value: 6.8 },
    { year: '2013', value: 7.5 }, { year: '2014', value: 8.1 }, { year: '2015', value: 8.8 },
    { year: '2016', value: 9.5 }, { year: '2017', value: 10.8 }, { year: '2018', value: 10.2 },
    { year: '2019', value: 11.9 }, { year: '2020', value: 12.5 }, { year: '2021', value: 13.2 },
    { year: '2022', value: 11.8 }, { year: '2023', value: 13.5 }, { year: '2024', value: 13.8 }
  ];

  const initialMarketSegments = [
    { name: 'Equities', value: 13841391791701, countries: 62, companies: 8314, color: '#1e40af' },
    { name: 'Fixed Income', value: 5311013977241, countries: 50, bonds: 1683, color: '#059669' }
  ];

  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedSavingsRecord, setSelectedSavingsRecord] = useState(null);

  // Calculate total fixed income bonds market value in RM
  const calculateTotalFixedIncomeValue = () => {
    return fixedIncomeBonds.reduce((total, bond) => {
      // Get the most recent monthly value for this bond
      const monthlyData = fixedIncomeMonthlyData[bond.name];
      const months = ['dec', 'nov', 'oct', 'sep', 'aug', 'jul', 'jun', 'may', 'apr', 'mar', 'feb', 'jan'];
      
      let recentValue = null;
      
      // Look for the most recent month with data
      if (monthlyData) {
        for (let month of months) {
          if (monthlyData[month] && monthlyData[month] > 0) {
            recentValue = monthlyData[month];
            break;
          }
        }
      }
      
      // Fallback to bond base value if no monthly data found
      if (recentValue === null || recentValue === undefined) {
        recentValue = bond.value;
      }
      
      return total + (recentValue * 3.7);
    }, 0);
  };

  const calculateTotalAlternativeInvestmentsValue = () => {
    return alternativeInvestments.reduce((total, inv) => {
      return total + (inv.current_value || 0);
    }, 0);
  };

  // Get unique countries from fixed income bonds
  const getFixedIncomeCountries = () => {
    const countries = new Set(fixedIncomeBonds.map(b => b.country).filter(c => c));
    return countries.size;
  };

  // Convert equitiesCompanies to holdings format for Portfolio view
  const holdings = equitiesCompanies.map(company => ({
    name: company.name,
    type: company.sector || 'Investment',
    value: company.value || 0,
    allocation: equitiesCompanies.length > 0 
      ? `${((company.value / (equitiesCompanies.reduce((sum, c) => sum + (c.value || 0), 0))) * 100).toFixed(1)}%`
      : '0%'
  }));

  const navigation = [
    { 
      id: 'financial', 
      name: 'Financial', 
      icon: DollarSign,
      isGroup: true,
      submenu: [
        { 
          id: 'investment',
          name: 'Investment',
          icon: Briefcase,
          isSubGroup: true,
          submenu: [
            { id: 'dashboard', name: 'Dashboard', icon: Home },
            { id: 'portfolio', name: 'Portfolio', icon: Briefcase },
            { id: 'performance', name: 'Performance', icon: TrendingUp },
            { id: 'allinvestments', name: 'All Investments', icon: TrendingUp },
            { id: 'governance', name: 'Governance', icon: Shield },
            { id: 'documents', name: 'Documents', icon: FileText }
          ]
        },
        { id: 'savings', name: 'Savings', icon: DollarSign },
        { id: 'reserve', name: 'Reserve', icon: Briefcase }
      ]
    },
    { id: 'plans', name: 'Strategic Plans', icon: Target },
    { id: 'admin', name: 'Admin', icon: Shield },
    { id: 'profiles', name: 'User Profiles', icon: Users, adminOnly: true },
    { id: 'myprofile', name: 'My Profile', icon: Users }
  ];

  const DashboardView = () => (
    <div className="space-y-6">
      <div className="text-center py-8">
        <p className="text-sm text-gray-600 mb-2">THE FUND VALUE</p>
        <p className="text-4xl font-bold text-blue-600">RM 5,367,500</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Fund Performance (2024)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Asset Allocation</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={assetAllocation}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                dataKey="value"
              >
                {assetAllocation.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium">Q4 Distribution Processed</p>
              <p className="text-sm text-gray-600">December 15, 2024</p>
            </div>
            <span className="text-green-600 font-medium">+$18,000</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium">Portfolio Rebalancing</p>
              <p className="text-sm text-gray-600">November 30, 2024</p>
            </div>
            <span className="text-blue-600 font-medium">Completed</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">Annual Report Published</p>
              <p className="text-sm text-gray-600">November 1, 2024</p>
            </div>
            <span className="text-purple-600 font-medium">View</span>
          </div>
        </div>
      </div>
    </div>
  );

  const PortfolioView = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Current Holdings</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Investment</th>
                <th className="text-left py-3 px-4">Type</th>
                <th className="text-right py-3 px-4">Value</th>
                <th className="text-right py-3 px-4">Allocation</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((holding, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{holding.name}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                      {holding.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">${holding.value.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-medium">{holding.allocation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const GovernanceView = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Investment Committee</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['Ahmad Nur (Chair)', 'Fatimah Nur (Treasurer)', 'Yusuf Nur (Advisor)'].map((member, idx) => (
            <div key={idx} className="border rounded-lg p-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <p className="font-semibold">{member}</p>
              <p className="text-sm text-gray-600 mt-1">Committee Member</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Investment Philosophy</h3>
        <p className="text-gray-700 mb-4">
          The Nur' Family Investment Fund is committed to long-term wealth preservation and growth across generations. Our investment approach is guided by prudence, diversification, and ethical considerations.
        </p>
        <h4 className="font-semibold mt-4 mb-2">Core Principles:</h4>
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>Long-term investment horizon (10+ years)</li>
          <li>Diversification across asset classes and geographies</li>
          <li>ESG-focused investment criteria</li>
          <li>Regular rebalancing and risk management</li>
          <li>Transparent reporting to all family members</li>
        </ul>
      </div>
    </div>
  );

  // Calculate total savings value
  const calculateTotalSavingsValue = () => {
    return savingsRecords.reduce((total, record) => total + (record.amount || 0), 0);
  };

  // Savings detail view for individual record (matching Equities detail structure)
  const SavingsRecordDetailView = ({ recordId }) => {
    const record = savingsRecords.find(r => r.id === recordId);
    if (!record) return <div>Record not found</div>;

    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const monthLabels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const recentValue = record.amount || 0;
    const yearComparisonData = [
      { label: '2024', value: (record.amount / 5.2) * 0.8 },
      { label: '2025', value: recentValue / 5.2 }
    ];

    return (
      <div className="space-y-6">
        <button 
          onClick={() => setSelectedSavingsRecord(null)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
        >
          <span>←</span> Back to Cash & Cash Equivalents
        </button>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Savings Record</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div><span className="font-semibold">Record ID:</span> {record.id}</div>
            <div><span className="font-semibold">Amount:</span> RM {(recentValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div><span className="font-semibold">Type:</span> {record.amount > 0 ? 'Cash In' : 'Cash Out'}</div>
            <div><span className="font-semibold">Date:</span> {new Date(record.record_date).toLocaleDateString()}</div>
            <div><span className="font-semibold">Notes:</span> {record.notes || 'N/A'}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Year Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={yearComparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip formatter={(value) => `RM ${(value * 5.2).toLocaleString('en-US', { maximumFractionDigits: 2 })}`} />
              <Bar dataKey="value" fill="#06b6d4" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Record Details</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-2 text-left font-semibold">Field</th>
                  <th className="px-2 py-2 text-left font-semibold bg-blue-100">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-2 py-2 border-t font-semibold">Amount (RM)</td>
                  <td className="px-2 py-2 border-t bg-blue-50 font-semibold">RM {(recentValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
                <tr>
                  <td className="px-2 py-2 border-t font-semibold">Transaction Type</td>
                  <td className="px-2 py-2 border-t bg-blue-50">{record.amount > 0 ? 'Cash In' : 'Cash Out'}</td>
                </tr>
                <tr>
                  <td className="px-2 py-2 border-t font-semibold">Date</td>
                  <td className="px-2 py-2 border-t bg-blue-50">{new Date(record.record_date).toLocaleDateString()}</td>
                </tr>
                <tr>
                  <td className="px-2 py-2 border-t font-semibold">Notes</td>
                  <td className="px-2 py-2 border-t bg-blue-50">{record.notes || '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Cash & Cash Equivalents detail view (table format like Equities)
  const CashEquivalentDetailView = () => {
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});
    const totalValue = calculateTotalSavingsValue();
    const cashInTotal = savingsRecords
      .filter(r => r.amount > 0)
      .reduce((sum, r) => sum + (r.amount || 0), 0);
    const cashOutTotal = savingsRecords
      .filter(r => r.amount < 0)
      .reduce((sum, r) => sum + Math.abs(r.amount || 0), 0);

    const handleEditCash = async (id) => {
      try {
        await updateSavingsRecord(id, {
          amount: parseFloat(editData.amount) || 0,
          instrument_type: editData.instrument_type || 'Cash',
          platform: editData.platform || null,
          notes: editData.notes || null
        });
        setEditingId(null);
        setEditData({});
        const records = await fetchSavingsRecords();
        setSavingsRecords(records);
        alert('Cash record updated successfully');
      } catch (error) {
        alert('Failed to update record: ' + error.message);
      }
    };

    const handleDeleteCash = async (id) => {
      if (confirm('Are you sure you want to delete this cash record?')) {
        try {
          await deleteSavingsRecord(id);
          const records = await fetchSavingsRecords();
          setSavingsRecords(records);
          alert('Cash record deleted successfully');
        } catch (error) {
          alert('Failed to delete record: ' + error.message);
        }
      }
    };
    
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <button 
            onClick={() => setSelectedInvestmentType(null)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
          >
            <span>←</span> Back to All Investments
          </button>
          
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Cash & Cash Equivalents</h2>
            <p className="text-gray-600 mt-2">RM {totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-sm text-gray-500">{savingsRecords.length} records • Net balance</p>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Cash Records ({savingsRecords.length})</h3>
              <input 
                type="text" 
                placeholder="Search for record"
                className="px-4 py-2 border rounded-lg w-64"
              />
            </div>
            
            {savingsRecords.length > 0 ? (
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold">Instrument Type</th>
                      <th className="text-left py-3 px-4 font-semibold">Platform</th>
                      <th className="text-right py-3 px-4 font-semibold">Current Balance (RM)</th>
                      <th className="text-center py-3 px-4 font-semibold bg-blue-50">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {savingsRecords.map((record, idx) => (
                      <tr 
                        key={idx} 
                        className="border-t hover:bg-gray-50"
                      >
                        {editingId === record.id ? (
                          <>
                            <td className="py-3 px-4">
                              <input 
                                type="text" 
                                value={editData.instrument_type || ''} 
                                onChange={(e) => setEditData({...editData, instrument_type: e.target.value})}
                                className="w-full border rounded px-2 py-1 text-sm"
                                placeholder="Instrument Type"
                              />
                            </td>
                            <td className="py-3 px-4">
                              <input 
                                type="text" 
                                value={editData.platform || ''} 
                                onChange={(e) => setEditData({...editData, platform: e.target.value})}
                                className="w-full border rounded px-2 py-1 text-sm"
                                placeholder="Platform"
                              />
                            </td>
                            <td className="py-3 px-4 text-right">
                              <input 
                                type="number" 
                                step="0.01"
                                value={editData.amount || ''} 
                                onChange={(e) => setEditData({...editData, amount: e.target.value})}
                                className="w-full border rounded px-2 py-1 text-sm text-right"
                                placeholder="Amount"
                              />
                            </td>
                            <td className="py-3 px-4 text-center bg-blue-50">
                              <button 
                                onClick={() => handleEditCash(record.id)}
                                className="text-green-600 hover:text-green-800 font-semibold mr-3"
                              >
                                Save
                              </button>
                              <button 
                                onClick={() => {setEditingId(null); setEditData({});}}
                                className="text-gray-600 hover:text-gray-800 font-semibold"
                              >
                                Cancel
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="py-3 px-4 text-sm font-medium">{record.instrument_type || 'Cash'}</td>
                            <td className="py-3 px-4 text-sm">{record.platform || '-'}</td>
                            <td className="py-3 px-4 text-right font-bold text-blue-600">RM {(record.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td className="py-3 px-4 text-center bg-blue-50">
                              <button 
                                onClick={() => {setEditingId(record.id); setEditData(record);}}
                                className="text-blue-600 hover:text-blue-800 font-semibold mr-3"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteCash(record.id)}
                                className="text-red-600 hover:text-red-800 font-semibold"
                              >
                                Delete
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 border rounded-lg bg-gray-50">
                <p>No savings records yet</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Historic Investments - Cash & Cash Equivalents (2025)</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={[{ year: '2025', value: calculateTotalSavingsValue() / 5.2 }]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => `RM ${(value * 5.2).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  labelFormatter={(label) => `Year: ${label}`}
                />
                <Bar dataKey="value" fill="#06b6d4" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  const AlternativeInvestmentListView = () => {
    const [newInvestment, setNewInvestment] = useState({
      asset_type: '',
      name: '',
      platform: '',
      quantity: '',
      unit_price: '',
      current_value: '',
      cost: ''
    });
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});
    const [selectedAssetType, setSelectedAssetType] = useState(null);

    const totalValue = alternativeInvestments.reduce((sum, inv) => sum + (inv.current_value || 0), 0);

    // Calculate value from quantity and unit price
    const calculateValue = (quantity, unitPrice) => {
      const q = parseFloat(quantity) || 0;
      const p = parseFloat(unitPrice) || 0;
      return q * p;
    };

    const handleAddInvestment = async () => {
      if (!newInvestment.asset_type || !newInvestment.name || !newInvestment.quantity || !newInvestment.unit_price) {
        alert('Please fill in all required fields');
        return;
      }

      try {
        const calculatedValue = calculateValue(newInvestment.quantity, newInvestment.unit_price);
        const investmentData = {
          asset_type: newInvestment.asset_type,
          name: newInvestment.name,
          platform: newInvestment.platform,
          quantity: parseFloat(newInvestment.quantity),
          unit_price: parseFloat(newInvestment.unit_price),
          current_value: parseFloat(newInvestment.current_value) || calculatedValue,
          cost: parseFloat(newInvestment.cost) || 0,
          country: 'Malaysia'
        };

        await addAlternativeInvestment(investmentData);
        setNewInvestment({
          asset_type: '',
          name: '',
          platform: '',
          quantity: '',
          unit_price: '',
          current_value: '',
          cost: ''
        });
        
        // Refresh data
        const altInvestments = await fetchAlternativeInvestments();
        setAlternativeInvestments(altInvestments);
      } catch (error) {
        alert('Failed to add investment: ' + error.message);
      }
    };

    const handleUpdateInvestment = async (id) => {
      try {
        const calculatedValue = editData.quantity && editData.unit_price 
          ? calculateValue(editData.quantity, editData.unit_price)
          : (editData.current_value || 0);
        
        const updateData = {
          name: editData.name,
          asset_type: editData.asset_type,
          platform: editData.platform || null,
          quantity: editData.quantity || null,
          unit_price: editData.unit_price || null,
          current_value: editData.current_value || calculatedValue,
          cost: editData.cost || null,
          notes: editData.notes || null
        };

        await updateAlternativeInvestment(id, updateData);
        setEditingId(null);
        setEditData({});
        
        // Refresh data
        const altInvestments = await fetchAlternativeInvestments();
        setAlternativeInvestments(altInvestments);
      } catch (error) {
        alert('Failed to update investment: ' + error.message);
      }
    };

    const handleDeleteInvestment = async (id) => {
      if (confirm('Are you sure you want to delete this investment?')) {
        try {
          await deleteAlternativeInvestment(id);
          
          // Refresh data
          const altInvestments = await fetchAlternativeInvestments();
          setAlternativeInvestments(altInvestments);
        } catch (error) {
          alert('Failed to delete investment: ' + error.message);
        }
      }
    };

    // Get asset type breakdown for chart
    const assetTypeData = alternativeInvestments.reduce((acc, inv) => {
      const existing = acc.find(item => item.name === inv.asset_type);
      if (existing) {
        existing.value += inv.current_value;
      } else {
        acc.push({ name: inv.asset_type, value: inv.current_value });
      }
      return acc;
    }, []);

    // If viewing specific asset type
    if (selectedAssetType) {
      const typeInvestments = alternativeInvestments.filter(inv => inv.asset_type === selectedAssetType);
      const typeTotal = typeInvestments.reduce((sum, inv) => sum + inv.current_value, 0);

      return (
        <div className="space-y-6">
          <button 
            onClick={() => setSelectedAssetType(null)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            <span>←</span> Back to All Alternative Investments
          </button>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 capitalize">{selectedAssetType}</h2>
            <p className="text-gray-600 mb-4">Total Value: RM {typeTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="px-4 py-2 text-left text-sm font-semibold">Asset</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold">Platform</th>
                    <th className="px-4 py-2 text-right text-sm font-semibold">Units Held</th>
                    <th className="px-4 py-2 text-right text-sm font-semibold">Unit Price</th>
                    <th className="px-4 py-2 text-right text-sm font-semibold">Value (RM)</th>
                    <th className="px-4 py-2 text-right text-sm font-semibold">Cost (RM)</th>
                  </tr>
                </thead>
                <tbody>
                  {typeInvestments.map((inv) => (
                    <tr key={inv.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm font-medium">{inv.name}</td>
                      <td className="px-4 py-2 text-sm">{inv.platform || '—'}</td>
                      <td className="px-4 py-2 text-right text-sm">{inv.quantity}</td>
                      <td className="px-4 py-2 text-right text-sm">RM {(inv.current_value / inv.quantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-4 py-2 text-right text-sm font-semibold">RM {inv.current_value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-4 py-2 text-right text-sm">RM {(inv.cost || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <button 
          onClick={() => setSelectedInvestmentType(null)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
        >
          <span>←</span> Back to All Investments
        </button>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Alternative Investments</h2>
          <p className="text-gray-600 mb-4">Total Value: RM {totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>

          {/* Add New Investment Form */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Add New Investment</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <input
                type="text"
                placeholder="Asset Type (e.g., Crypto)"
                value={newInvestment.asset_type}
                onChange={(e) => setNewInvestment({...newInvestment, asset_type: e.target.value})}
                className="border rounded px-3 py-2 text-sm"
              />
              <input
                type="text"
                placeholder="Asset Name"
                value={newInvestment.name}
                onChange={(e) => setNewInvestment({...newInvestment, name: e.target.value})}
                className="border rounded px-3 py-2 text-sm"
              />
              <input
                type="text"
                placeholder="Platform"
                value={newInvestment.platform}
                onChange={(e) => setNewInvestment({...newInvestment, platform: e.target.value})}
                className="border rounded px-3 py-2 text-sm"
              />
              <input
                type="number"
                placeholder="Units Held"
                step="0.01"
                value={newInvestment.quantity}
                onChange={(e) => setNewInvestment({...newInvestment, quantity: e.target.value})}
                className="border rounded px-3 py-2 text-sm"
              />
              <input
                type="number"
                placeholder="Unit Price (RM)"
                step="0.01"
                value={newInvestment.unit_price}
                onChange={(e) => setNewInvestment({...newInvestment, unit_price: e.target.value})}
                className="border rounded px-3 py-2 text-sm"
              />
              <input
                type="number"
                placeholder={`Total Value (Auto: ${calculateValue(newInvestment.quantity, newInvestment.unit_price).toFixed(2)})`}
                step="0.01"
                value={newInvestment.current_value}
                onChange={(e) => setNewInvestment({...newInvestment, current_value: e.target.value})}
                className="border rounded px-3 py-2 text-sm"
              />
              <input
                type="number"
                placeholder="Cost (RM)"
                step="0.01"
                value={newInvestment.cost}
                onChange={(e) => setNewInvestment({...newInvestment, cost: e.target.value})}
                className="border rounded px-3 py-2 text-sm"
              />
              <button
                onClick={handleAddInvestment}
                className="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>

          {/* Investments Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="px-4 py-2 text-left text-sm font-semibold">Asset Type</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Asset</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Platform</th>
                  <th className="px-4 py-2 text-right text-sm font-semibold">Units Held</th>
                  <th className="px-4 py-2 text-right text-sm font-semibold">Unit Price</th>
                  <th className="px-4 py-2 text-right text-sm font-semibold">Value (RM)</th>
                  <th className="px-4 py-2 text-right text-sm font-semibold">Cost (RM)</th>
                  <th className="px-4 py-2 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {alternativeInvestments.map((inv) => (
                  <tr key={inv.id} className="border-b hover:bg-gray-50">
                    {editingId === inv.id ? (
                      <>
                        <td className="px-4 py-2"><input type="text" value={editData.asset_type || inv.asset_type} onChange={(e) => setEditData({...editData, asset_type: e.target.value})} className="w-full border rounded px-2 py-1 text-sm" /></td>
                        <td className="px-4 py-2"><input type="text" value={editData.name || inv.name} onChange={(e) => setEditData({...editData, name: e.target.value})} className="w-full border rounded px-2 py-1 text-sm" /></td>
                        <td className="px-4 py-2"><input type="text" value={editData.platform || inv.platform || ''} onChange={(e) => setEditData({...editData, platform: e.target.value})} className="w-full border rounded px-2 py-1 text-sm" /></td>
                        <td className="px-4 py-2 text-right"><input type="number" step="0.01" value={editData.quantity || inv.quantity} onChange={(e) => setEditData({...editData, quantity: parseFloat(e.target.value)})} className="w-full border rounded px-2 py-1 text-sm" /></td>
                        <td className="px-4 py-2 text-right"><input type="number" step="0.01" value={editData.unit_price || ''} onChange={(e) => setEditData({...editData, unit_price: parseFloat(e.target.value)})} className="w-full border rounded px-2 py-1 text-sm" placeholder="Price" /></td>
                        <td className="px-4 py-2 text-right"><input type="number" step="0.01" value={editData.current_value || inv.current_value} onChange={(e) => setEditData({...editData, current_value: parseFloat(e.target.value)})} className="w-full border rounded px-2 py-1 text-sm" /></td>
                        <td className="px-4 py-2 text-right"><input type="number" step="0.01" value={editData.cost || 0} onChange={(e) => setEditData({...editData, cost: parseFloat(e.target.value)})} className="w-full border rounded px-2 py-1 text-sm" /></td>
                        <td className="px-4 py-2 text-center">
                          <button onClick={() => handleUpdateInvestment(inv.id)} className="text-green-600 hover:text-green-800 mr-2">✓</button>
                          <button onClick={() => setEditingId(null)} className="text-gray-600 hover:text-gray-800">✕</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-2 text-sm capitalize cursor-pointer hover:text-blue-600 hover:underline" onClick={() => setSelectedAssetType(inv.asset_type)}>{inv.asset_type}</td>
                        <td className="px-4 py-2 text-sm font-medium">{inv.name}</td>
                        <td className="px-4 py-2 text-sm">{inv.platform || '—'}</td>
                        <td className="px-4 py-2 text-right text-sm">{inv.quantity}</td>
                        <td className="px-4 py-2 text-right text-sm">RM {(inv.current_value / inv.quantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="px-4 py-2 text-right text-sm font-semibold">RM {inv.current_value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="px-4 py-2 text-right text-sm">RM {(inv.cost || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="px-4 py-2 text-center">
                          <button onClick={() => {setEditingId(inv.id); setEditData(inv);}} className="text-blue-600 hover:text-blue-800 mr-2">Edit</button>
                          <button onClick={() => handleDeleteInvestment(inv.id)} className="text-red-600 hover:text-red-800">Delete</button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {alternativeInvestments.length === 0 && (
            <div className="text-center py-12 text-gray-500 border rounded-lg bg-gray-50">
              <p>No alternative investments yet. Add one using the form above.</p>
            </div>
          )}

          {/* Asset Type Distribution Chart */}
          {assetTypeData.length > 0 && (
            <div className="mt-8 bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Asset Type Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={assetTypeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip formatter={(value) => `RM ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} contentStyle={{backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px'}} />
                  <Bar dataKey="value" fill="#3b82f6" name="Value (RM)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    );
  };

  const AssetDetailView = ({ assetName }) => {
    const asset = equitiesCompanies.find(a => a.name === assetName);
    const monthlyData = assetMonthlyData[assetName] || {};
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const monthLabels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    // Find the latest month with a value > 0
    let latestMonthValue = monthlyData.dec || asset.value;
    for (let i = months.length - 1; i >= 0; i--) {
      if (monthlyData[months[i]] && monthlyData[months[i]] > 0) {
        latestMonthValue = monthlyData[months[i]];
        break;
      }
    }
    
    const recentValue = latestMonthValue;
    const yearComparisonData = [
      { label: '2024', value: 1268.13 / 3.7 },
      { label: '2025', value: recentValue }
    ];

    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedAsset(null)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
        >
          <span>←</span> Back to Equities
        </button>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">{assetName}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div><span className="font-semibold">Asset Name:</span> {assetName}</div>
            <div><span className="font-semibold">Recent Value:</span> RM {(recentValue * 3.7).toLocaleString()}</div>
            <div><span className="font-semibold">Sector:</span> {asset.sector}</div>
            <div><span className="font-semibold">Country:</span> {asset.country}</div>
            <div className="md:col-span-2"><span className="font-semibold">Incorporated in:</span> {monthlyData.incorporated}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Year Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={yearComparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip formatter={(value) => `RM ${(value * 3.7).toLocaleString('en-US', { maximumFractionDigits: 2 })}`} />
              <Bar dataKey="value" fill="#1e40af" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Monthly Values (2025)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {monthLabels.map((m) => (
                    <th key={m} className="px-2 py-2 text-left font-semibold">{m}</th>
                  ))}
                  <th className="px-2 py-2 text-left font-semibold bg-blue-100">Recent 2025 Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  {months.map((m) => (
                    <td key={m} className="px-2 py-2 border-t">RM {((monthlyData[m] || 0) * 3.7).toLocaleString()}</td>
                  ))}
                  <td className="px-2 py-2 border-t bg-blue-50 font-semibold">RM {(recentValue * 3.7).toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Get most recent monthly value for a company
  const getRecentMonthlyValue = (companyName) => {
    const monthlyData = assetMonthlyData[companyName];
    if (!monthlyData) return 0;
    
    // Array of months in order (most recent first)
    const months = ['dec', 'nov', 'oct', 'sep', 'aug', 'jul', 'jun', 'may', 'apr', 'mar', 'feb', 'jan'];
    
    for (let month of months) {
      if (monthlyData[month] && monthlyData[month] > 0) {
        return monthlyData[month];
      }
    }
    return 0;
  };

  // Calculate total equities market value in RM
  const calculateTotalEquitiesValue = () => {
    return equitiesCompanies.reduce((total, company) => {
      const recentValue = getRecentMonthlyValue(company.name);
      const displayValue = recentValue > 0 ? recentValue * 3.7 : company.value * 3.7;
      return total + displayValue;
    }, 0);
  };

  // Calculate equities segment data for cards
  const getEquitiesSegmentData = () => {
    const totalRm = calculateTotalEquitiesValue();
    const totalValue = totalRm / 3.7; // Convert back to base currency for calculation
    return {
      name: 'Equities',
      value: totalValue,
      countries: 1, // Can be updated if you have country data
      companies: equitiesCompanies.length,
      color: '#1e40af'
    };
  };

  const AlternativeInvestmentDetailView = ({ investmentId }) => {
    const investment = alternativeInvestments.find(inv => inv.id === investmentId);
    const monthlyData = alternativeInvestmentMonthlyData[investment?.name] || {};
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const monthLabels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    if (!investment) return null;

    // Find the latest month with a value > 0
    let latestMonthValue = monthlyData.dec || investment.current_value;
    for (let i = months.length - 1; i >= 0; i--) {
      if (monthlyData[months[i]] && monthlyData[months[i]] > 0) {
        latestMonthValue = monthlyData[months[i]];
        break;
      }
    }
    
    const recentValue = latestMonthValue;
    const yearComparisonData = [
      { label: '2024', value: (investment.current_value / 5.2) * 0.8 },
      { label: '2025', value: recentValue / 5.2 }
    ];

    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedAlternativeInvestment(null)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
        >
          <span>←</span> Back to Alternative Investments
        </button>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">{investment.name}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div><span className="font-semibold">Asset Name:</span> {investment.name}</div>
            <div><span className="font-semibold">Recent Value:</span> RM {(recentValue * 5.2).toLocaleString()}</div>
            <div><span className="font-semibold">Type:</span> <span className="capitalize">{investment.asset_type}</span></div>
            <div><span className="font-semibold">Country:</span> {investment.country || 'N/A'}</div>
            <div><span className="font-semibold">Quantity:</span> {investment.quantity} {investment.unit || ''}</div>
            <div><span className="font-semibold">Notes:</span> {investment.notes || 'N/A'}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Year Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={yearComparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip formatter={(value) => `RM ${(value * 5.2).toLocaleString('en-US', { maximumFractionDigits: 2 })}`} />
              <Bar dataKey="value" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Monthly Values (2025)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {monthLabels.map((m) => (
                    <th key={m} className="px-2 py-2 text-left font-semibold">{m}</th>
                  ))}
                  <th className="px-2 py-2 text-left font-semibold bg-blue-100">Recent 2025 Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  {months.map((m) => (
                    <td key={m} className="px-2 py-2 border-t">RM {((monthlyData[m] || 0) * 5.2).toLocaleString()}</td>
                  ))}
                  <td className="px-2 py-2 border-t bg-blue-50 font-semibold">RM {(recentValue * 5.2).toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const EquitiesDetailView = () => {
    const totalValue = calculateTotalEquitiesValue();
    
    return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <button 
          onClick={() => setSelectedInvestmentType(null)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
        >
          <span>←</span> Back to All Investments
        </button>
        
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Equities</h2>
          <p className="text-gray-600 mt-2">RM {totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-sm text-gray-500">{equitiesCompanies.length} companies • Total market value</p>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Fund Allocation Strategy</h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Index Funds & ETF */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200 shadow-sm hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm">Index Funds & ETF</h4>
                  <p className="text-xs text-gray-600 mt-1">Diversified tracking funds</p>
                </div>
                <span className="text-2xl">📊</span>
              </div>
              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="text-3xl font-bold text-blue-600">70%</p>
                <p className="text-xs text-gray-600 mt-2">Target allocation</p>
                <p className="text-sm font-semibold text-blue-700 mt-2">Should invest: RM {((funds.find(f => f.type === 'Investment')?.target_value || calculateTotalEquitiesValue()) * 0.70).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <div className="mt-3">
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '70%'}}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dividend Stocks */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200 shadow-sm hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm">Dividend Stocks</h4>
                  <p className="text-xs text-gray-600 mt-1">Income-producing shares</p>
                </div>
                <span className="text-2xl">💰</span>
              </div>
              <div className="mt-4 pt-4 border-t border-green-200">
                <p className="text-3xl font-bold text-green-600">15%</p>
                <p className="text-xs text-gray-600 mt-2">Target allocation</p>
                <p className="text-sm font-semibold text-green-700 mt-2">Should invest: RM {((funds.find(f => f.type === 'Investment')?.target_value || calculateTotalEquitiesValue()) * 0.15).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <div className="mt-3">
                  <div className="w-full bg-green-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '15%'}}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Magnificent 7 Stocks */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200 shadow-sm hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm">7 Value Magnificent</h4>
                  <p className="text-xs text-gray-600 mt-1">Large-cap tech leaders</p>
                </div>
                <span className="text-2xl">🚀</span>
              </div>
              <div className="mt-4 pt-4 border-t border-purple-200">
                <p className="text-3xl font-bold text-purple-600">10%</p>
                <p className="text-xs text-gray-600 mt-2">Target allocation</p>
                <p className="text-sm font-semibold text-purple-700 mt-2">Should invest: RM {((funds.find(f => f.type === 'Investment')?.target_value || calculateTotalEquitiesValue()) * 0.10).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <div className="mt-3">
                  <div className="w-full bg-purple-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{width: '10%'}}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Growth Stocks */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200 shadow-sm hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm">Growth Stocks</h4>
                  <p className="text-xs text-gray-600 mt-1">Emerging high-growth</p>
                </div>
                <span className="text-2xl">📈</span>
              </div>
              <div className="mt-4 pt-4 border-t border-orange-200">
                <p className="text-3xl font-bold text-orange-600">5%</p>
                <p className="text-xs text-gray-600 mt-2">Target allocation</p>
                <p className="text-sm font-semibold text-orange-700 mt-2">Should invest: RM {((funds.find(f => f.type === 'Investment')?.target_value || calculateTotalEquitiesValue()) * 0.05).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <div className="mt-3">
                  <div className="w-full bg-orange-200 rounded-full h-2">
                    <div className="bg-orange-600 h-2 rounded-full" style={{width: '5%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Companies (8,314)</h3>
            <input 
              type="text" 
              placeholder="Search for company"
              className="px-4 py-2 border rounded-lg w-64"
            />
          </div>
          
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold">Asset</th>
                  <th className="text-right py-3 px-4 font-semibold">Market Value (RM)</th>
                  <th className="text-left py-3 px-4 font-semibold">Sector</th>
                  <th className="text-left py-3 px-4 font-semibold">Country</th>
                </tr>
              </thead>
              <tbody>
                {equitiesCompanies.map((company, idx) => {
                  const recentValue = getRecentMonthlyValue(company.name);
                  const displayValue = recentValue > 0 ? recentValue * 3.7 : company.value * 3.7;
                  return (
                    <tr key={idx} className="border-t hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedAsset(company.name)}>
                      <td className="py-3 px-4">
                        <a className="text-blue-600 hover:underline">{company.name}</a>
                      </td>
                      <td className="py-3 px-4 text-right">RM {displayValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="py-3 px-4">{company.sector}</td>
                      <td className="py-3 px-4">{company.country}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 text-center">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Show 30 more +
            </button>
          </div>
        </div>

          <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Historic Investments - Equities (2025)</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={[{ year: '2025', value: calculateTotalEquitiesValue() / 3.7 }]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip 
                formatter={(value) => {
                  const formatted = (value * 3.7).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                  return `RM ${formatted}`;
                }}
                labelFormatter={(label) => `Year: ${label}`}
              />
              <Bar dataKey="value" fill="#1e40af" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
    );
  };

  const FixedIncomeDetailView = () => {
    const totalValue = calculateTotalFixedIncomeValue();
    
    return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <button 
          onClick={() => setSelectedInvestmentType(null)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
        >
          <span>←</span> Back to All Investments
        </button>
        
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Fixed Income</h2>
          <p className="text-gray-600 mt-2">RM {totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-sm text-gray-500">{fixedIncomeBonds.length} bonds • Total market value</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Bonds ({fixedIncomeBonds.length})</h3>
            <input 
              type="text" 
              placeholder="Search for bond"
              className="px-4 py-2 border rounded-lg w-64"
            />
          </div>
          
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold">Bond Name</th>
                  <th className="text-right py-3 px-4 font-semibold">Market Value (RM)</th>
                  <th className="text-left py-3 px-4 font-semibold">Type</th>
                  <th className="text-left py-3 px-4 font-semibold">Rating</th>
                  <th className="text-left py-3 px-4 font-semibold">Country</th>
                </tr>
              </thead>
              <tbody>
                {fixedIncomeBonds.map((bond, idx) => {
                  const displayValue = bond.value * 3.7;
                  return (
                    <tr key={idx} className="border-t hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedBond(bond.name)}>
                      <td className="py-3 px-4">
                        <span className="text-blue-600 hover:underline">{bond.name}</span>
                      </td>
                      <td className="py-3 px-4 text-right">RM {displayValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="py-3 px-4">{bond.bond_type}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          bond.rating === 'AAA' ? 'bg-green-100 text-green-800' :
                          bond.rating === 'AA' ? 'bg-green-100 text-green-700' :
                          bond.rating === 'A' ? 'bg-blue-100 text-blue-800' :
                          bond.rating === 'BBB' ? 'bg-yellow-100 text-yellow-800' :
                          bond.rating === 'BB' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {bond.rating}
                        </span>
                      </td>
                      <td className="py-3 px-4">{bond.country}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {fixedIncomeBonds.length === 0 && (
            <div className="mt-4 text-center text-gray-500">
              No fixed income bonds added yet.
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Historic Investments - Fixed Income (2025)</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={[{ year: '2025', value: calculateTotalFixedIncomeValue() / 3.7 }]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip 
                formatter={(value) => {
                  const formatted = (value * 3.7).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                  return `RM ${formatted}`;
                }}
                labelFormatter={(label) => `Year: ${label}`}
              />
              <Bar dataKey="value" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
    );
  };

  const BondDetailView = ({ bondName }) => {
    const bond = fixedIncomeBonds.find(b => b.name === bondName);
    const monthlyData = fixedIncomeMonthlyData[bondName] || {};
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const monthLabels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    if (!bond) return null;

    // Find the latest month with a value > 0
    let latestMonthValue = monthlyData.dec || bond.value;
    for (let i = months.length - 1; i >= 0; i--) {
      if (monthlyData[months[i]] && monthlyData[months[i]] > 0) {
        latestMonthValue = monthlyData[months[i]];
        break;
      }
    }
    
    const recentValue = latestMonthValue;
    const yearComparisonData = [
      { label: '2024', value: (bond.value / 3.7) * 0.8 },
      { label: '2025', value: recentValue / 3.7 }
    ];

    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedBond(null)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
        >
          <span>←</span> Back to Fixed Income
        </button>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">{bond.name}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div><span className="font-semibold">Bond Name:</span> {bond.name}</div>
            <div><span className="font-semibold">Recent Value:</span> RM {(recentValue * 3.7).toLocaleString()}</div>
            <div><span className="font-semibold">Type:</span> {bond.bond_type}</div>
            <div><span className="font-semibold">Rating:</span> {bond.rating}</div>
            <div><span className="font-semibold">Country:</span> {bond.country}</div>
            <div><span className="font-semibold">Maturity:</span> {bond.maturity_date || 'N/A'}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Year Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={yearComparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip formatter={(value) => `RM ${(value * 3.7).toLocaleString('en-US', { maximumFractionDigits: 2 })}`} />
              <Bar dataKey="value" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Monthly Values (2025)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {monthLabels.map((m) => (
                    <th key={m} className="px-2 py-2 text-left font-semibold">{m}</th>
                  ))}
                  <th className="px-2 py-2 text-left font-semibold bg-blue-100">Recent 2025 Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  {months.map((m) => (
                    <td key={m} className="px-2 py-2 border-t">RM {((monthlyData[m] || 0) * 3.7).toLocaleString()}</td>
                  ))}
                  <td className="px-2 py-2 border-t bg-blue-50 font-semibold">RM {(recentValue * 3.7).toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const AllInvestmentsView = () => {
    const equitiesSegment = getEquitiesSegmentData();
    const totalEquities = equitiesSegment.value;
    const totalFixedIncome = calculateTotalFixedIncomeValue() / 3.7; // Convert back to base currency
    
    // Market segments - static data with Equities and Fixed Income calculated from actual data
    const marketSegments = [
      {
        name: 'Equities',
        value: totalEquities,
        countries: equitiesSegment.countries,
        companies: equitiesSegment.companies,
        color: '#1e40af'
      },
      {
        name: 'Fixed Income',
        value: totalFixedIncome,
        countries: getFixedIncomeCountries(),
        bonds: fixedIncomeBonds.length,
        color: '#059669'
      }
    ];
    
    const totalValue = marketSegments.reduce((sum, seg) => sum + seg.value, 0);
    const totalAssets = totalValue * 3.7 + calculateTotalSavingsValue() + alternativeInvestments.reduce((sum, inv) => sum + (inv.current_value || 0), 0);
    
    return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-lg shadow-lg text-white" style={{maxWidth: '100%', margin: '0 auto', padding: '2rem'}}>
        <div className="mb-4">
          <h2 className="text-3xl font-bold mb-2 tracking-wide">TOTAL MARKET VALUE</h2>
          <p className="text-4xl font-bold text-white">RM {totalAssets.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
        </div>
        <div className="flex gap-6 text-xs text-gray-300 mt-4">
          <div>
            <span className="font-semibold text-white">{equitiesSegment.countries}</span> countries
          </div>
          <div>
            <span className="font-semibold text-white">{equitiesSegment.companies + fixedIncomeBonds.length + alternativeInvestments.length}</span> investments
          </div>
          <div>
            <span className="font-semibold text-white">100%</span> of all investments
          </div>
        </div>
      </div>

      {/* Investment Cards - Single Horizontal Line */}
      <div className="flex gap-4 overflow-x-auto pb-4" style={{width: 'calc(4 * 288px + 3 * 16px)', maxWidth: '100%', marginX: 'auto'}}>
        {/* Equities Card */}
        <div 
          className="border border-slate-700 rounded-lg p-6 hover:shadow-xl transition-all cursor-pointer bg-slate-900 bg-opacity-50 flex flex-col relative flex-shrink-0 w-72"
          onClick={() => setSelectedInvestmentType('equities')}
        >
          <div className="flex justify-center mb-3">
            <div className="text-5xl">📈</div>
          </div>
          <h3 className="text-xs font-bold text-slate-300 tracking-wider text-center mb-2">EQUITIES</h3>
          <p className="text-base font-bold text-amber-400 text-center mb-2">
            RM {calculateTotalEquitiesValue().toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
          <div className="text-center text-xs text-slate-400 mb-3">
            <div className="flex justify-center items-center gap-2">
              <span>📊 {equitiesSegment.companies} companies</span>
              <span>🌐 {equitiesSegment.countries} countries</span>
            </div>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2 mb-1">
            <div className="bg-blue-500 h-2 rounded-full" style={{width: `${((totalEquities / totalValue) * 100)}%`}}></div>
          </div>
          <p className="text-xs text-slate-400 text-center font-semibold">{((totalEquities / totalValue) * 100).toFixed(1)}%</p>
          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-xl">→</span>
        </div>

        {/* Alternative Investments Card */}
        <div 
          className="border border-slate-700 rounded-lg p-6 hover:shadow-xl transition-all cursor-pointer bg-slate-900 bg-opacity-50 flex flex-col relative flex-shrink-0 w-72"
          onClick={() => setSelectedInvestmentType('alternative')}
        >
          <div className="flex justify-center mb-3">
            <div className="text-5xl">💼</div>
          </div>
          <h3 className="text-xs font-bold text-slate-300 tracking-wider text-center mb-2">ALTERNATIVE INVESTMENTS</h3>
          <p className="text-base font-bold text-amber-400 text-center mb-2">
            RM {calculateTotalAlternativeInvestmentsValue().toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
          <div className="text-center text-xs text-slate-400 mb-3">
            <div className="flex justify-center items-center gap-2">
              <span>📊 {alternativeInvestments.length} investments</span>
            </div>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2 mb-1">
            <div className="bg-red-500 h-2 rounded-full" style={{width: `${((calculateTotalAlternativeInvestmentsValue() / totalValue) * 100)}%`}}></div>
          </div>
          <p className="text-xs text-slate-400 text-center font-semibold">{((calculateTotalAlternativeInvestmentsValue() / totalValue) * 100).toFixed(1)}%</p>
          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-xl">→</span>
        </div>
        {/* Fixed Income Card */}
        <div 
          className="border border-slate-700 rounded-lg p-6 hover:shadow-xl transition-all cursor-pointer bg-slate-900 bg-opacity-50 flex flex-col relative flex-shrink-0 w-72"
          onClick={() => setSelectedInvestmentType('fixed-income')}
        >
          <div className="flex justify-center mb-3">
            <div className="text-5xl">📄</div>
          </div>
          <h3 className="text-xs font-bold text-slate-300 tracking-wider text-center mb-2">FIXED INCOME</h3>
          <p className="text-base font-bold text-amber-400 text-center mb-2">
            RM {calculateTotalFixedIncomeValue().toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
          <div className="text-center text-xs text-slate-400 mb-3">
            <div className="flex justify-center items-center gap-2">
              <span>📋 {fixedIncomeBonds.length} bonds</span>
              <span>🌐 {getFixedIncomeCountries()} countries</span>
            </div>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2 mb-1">
            <div className="bg-emerald-500 h-2 rounded-full" style={{width: `${((totalFixedIncome / totalValue) * 100)}%`}}></div>
          </div>
          <p className="text-xs text-slate-400 text-center font-semibold">{((totalFixedIncome / totalValue) * 100).toFixed(1)}%</p>
          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-xl">→</span>
        </div>

        {/* Cash & Cash Equivalents Card */}
        <div 
          className="border border-slate-700 rounded-lg p-6 hover:shadow-xl transition-all cursor-pointer bg-slate-900 bg-opacity-50 flex flex-col relative flex-shrink-0 w-72"
          onClick={() => setSelectedInvestmentType('cash')}
        >
          <div className="flex justify-center mb-3">
            <div className="text-5xl">💵</div>
          </div>
          <h3 className="text-xs font-bold text-slate-300 tracking-wider text-center mb-2">CASH & CASH EQUIVALENTS</h3>
          <p className="text-base font-bold text-amber-400 text-center mb-2">
            RM {calculateTotalSavingsValue().toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
          <div className="text-center text-xs text-slate-400 mb-3">
            <div className="flex justify-center items-center gap-2">
              <span>📊 {savingsRecords.length} records</span>
            </div>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2 mb-1">
            <div className="bg-cyan-500 h-2 rounded-full" style={{width: `${((calculateTotalSavingsValue() / (savingsGoals.reduce((sum, goal) => sum + (goal.target_amount || 0), 0) || 1)) * 100)}%`}}></div>
          </div>
          <p className="text-xs text-slate-400 text-center font-semibold">{((calculateTotalSavingsValue() / (savingsGoals.reduce((sum, goal) => sum + (goal.target_amount || 0), 0) || 1)) * 100).toFixed(1)}%</p>
          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-xl">→</span>
        </div>
      </div>

      {/* Historical Investments Chart */}
      <div className="bg-slate-900 rounded-lg border border-slate-700" style={{maxWidth: '100%', margin: '0 auto', padding: '1.5rem'}}>
        <h3 className="text-sm font-semibold mb-1 text-slate-300">Historical Investments</h3>
        <p className="text-xs text-slate-500 mb-4">Values are in billion RM as of Dec 5, 2025. The left y-axis shows the fund's total value. The right y-axis shows the value of the asset classes.</p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={initialGlobalMarketData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis dataKey="year" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#cbd5e1'}} />
            <Legend wrapperStyle={{color: '#94a3b8'}} />
            <Bar dataKey="equities" stackId="a" fill="#3b82f6" name="Equity Investments" radius={[4, 4, 0, 0]} />
            <Bar dataKey="fixed" stackId="a" fill="#10b981" name="Fixed-income Investments" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
    );
  };

  const DocumentsView = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Fund Documents</h3>
        <div className="space-y-3">
          {[
            { name: 'Annual Report 2024', date: 'Nov 1, 2024', type: 'PDF' },
            { name: 'Q3 2024 Statement', date: 'Oct 15, 2024', type: 'PDF' },
            { name: 'Investment Policy Statement', date: 'Jan 1, 2024', type: 'PDF' },
            { name: 'Tax Documents 2024', date: 'Dec 31, 2024', type: 'ZIP' },
            { name: 'Meeting Minutes - Nov 2024', date: 'Nov 20, 2024', type: 'PDF' }
          ].map((doc, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="font-medium">{doc.name}</p>
                  <p className="text-sm text-gray-600">{doc.date}</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-gray-100 rounded text-sm">{doc.type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const SavingsView = () => {
    const totalSavings = savingsRecords.reduce((sum, record) => sum + (record.amount || 0), 0);
    const totalGoal = savingsGoals.reduce((sum, goal) => sum + (goal.target_amount || 0), 0);
    const achievedPercent = totalGoal > 0 ? Math.round((totalSavings / totalGoal) * 100) : 0;

    const downloadPDF = async () => {
      try {
        const element = document.getElementById('savings-report');
        const canvas = await html2canvas(element, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= 297;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= 297;
        }

        pdf.save(`Savings_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      } catch (error) {
        alert('Error generating PDF: ' + error.message);
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Savings & Investment Goals</h2>
          <div className="flex gap-3">
            <button
              onClick={downloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              <Download size={18} />
              <span className="text-sm">Download PDF</span>
            </button>
            {user?.role === 'admin' && (
              <p className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded">Manage in Admin Tab</p>
            )}
          </div>
        </div>
        
        <div id="savings-report" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow p-6">
              <p className="text-sm text-gray-700 mb-1">Total Savings</p>
              <p className="text-3xl font-bold text-blue-600">RM {totalSavings.toLocaleString('en-MY', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
              <p className="text-xs text-gray-600 mt-2">{savingsRecords.length} records</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow p-6">
              <p className="text-sm text-gray-700 mb-1">Savings Goals</p>
              <p className="text-3xl font-bold text-green-600">RM {totalGoal.toLocaleString('en-MY', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
              <p className="text-xs text-gray-600 mt-2">{savingsGoals.length} goals</p>
            </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow p-6">
            <p className="text-sm text-gray-700 mb-1">Achievement Rate</p>
            <p className="text-3xl font-bold text-purple-600">{achievedPercent}%</p>
            <p className="text-xs text-gray-600 mt-2">of total goal achieved</p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow p-6">
            <p className="text-sm text-gray-700 mb-1">Emergency Fund Coverage</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-orange-600">{Math.floor(totalSavings / 2561)}</p>
              <p className="text-xs text-gray-600">months</p>
              <span className="text-gray-400">•</span>
              <p className="text-lg font-bold text-orange-500">{Math.floor((totalSavings % 2561) / (2561 / 4.33))}</p>
              <p className="text-xs text-gray-600">weeks</p>
            </div>
            <p className="text-xs text-gray-600 mt-2">at RM 2,561/month</p>
            <div className="mt-3 pt-3 border-t border-orange-200">
              {Math.floor(totalSavings / 2561) === 0 && (
                <p className="text-xs font-semibold text-purple-600">💪 Great start! Every RM counts. Keep going!</p>
              )}
              {Math.floor(totalSavings / 2561) === 1 && (
                <p className="text-xs font-semibold text-blue-600">🚀 One month covered! You're doing great. Keep it up!</p>
              )}
              {Math.floor(totalSavings / 2561) === 2 && (
                <p className="text-xs font-semibold text-cyan-600">⭐ Two months! Almost there. Push for 3 months!</p>
              )}
              {Math.floor(totalSavings / 2561) >= 3 && Math.floor(totalSavings / 2561) < 6 && (
                <p className="text-xs font-semibold text-green-600">✅ Solid emergency fund! Aim for 6 months next</p>
              )}
              {Math.floor(totalSavings / 2561) >= 6 && Math.floor(totalSavings / 2561) < 12 && (
                <p className="text-xs font-semibold text-emerald-600">🏆 Excellent! You're well protected now</p>
              )}
              {Math.floor(totalSavings / 2561) >= 12 && (
                <p className="text-xs font-semibold text-green-600">🎉 Amazing! 1+ year covered. You're a savings champion!</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Progress to Goal</h3>
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-gray-600">{achievedPercent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-blue-600 h-3 rounded-full transition-all" style={{ width: `${achievedPercent}%` }}></div>
            </div>
          </div>
          <p className="text-sm text-gray-600">RM {(totalGoal - totalSavings).toLocaleString('en-MY', {minimumFractionDigits: 2, maximumFractionDigits: 2})} remaining</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Monthly Savings Chart</h3>
          {savingsRecords.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={(() => {
                  // Create all 12 months with 0 value
                  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  const monthlyData = months.map((month, index) => ({
                    month,
                    cashIn: 0,
                    cashOut: 0,
                    total: 0
                  }));

                  // Add actual savings data
                  savingsRecords.forEach((record) => {
                    const date = new Date(record.record_date);
                    const monthIndex = date.getMonth();
                    if (record.amount >= 0) {
                      monthlyData[monthIndex].cashIn += record.amount;
                    } else {
                      monthlyData[monthIndex].cashOut += Math.abs(record.amount);
                    }
                  });

                  // Calculate cumulative totals (including December now if data exists)
                  let cumulativeTotal = 0;
                  monthlyData.forEach((month, index) => {
                    cumulativeTotal += (month.cashIn - month.cashOut);
                    month.total = cumulativeTotal;
                  });

                  return monthlyData;
                })()}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => `RM ${value.toLocaleString('en-MY', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
                  labelFormatter={(label) => `${label}`}
                />
                <Legend />
                <Bar 
                  dataKey="cashIn" 
                  fill="#22c55e" 
                  name="Cash In" 
                  radius={[8, 8, 0, 0]}
                />
                <Bar 
                  dataKey="cashOut" 
                  fill="#ef4444" 
                  name="Cash Out" 
                  radius={[8, 8, 0, 0]}
                />
                <Bar 
                  dataKey="total" 
                  fill="#3b82f6" 
                  name="Cumulative Total" 
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No savings data available
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Yearly Savings Chart</h3>
          {savingsRecords.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={(() => {
                  // Get all years from records, starting from 2025 onwards
                  const yearsSet = new Set();
                  savingsRecords.forEach((record) => {
                    const year = new Date(record.record_date).getFullYear();
                    if (year >= 2025) {
                      yearsSet.add(year);
                    }
                  });

                  // If no records from 2025 onwards, include 2025
                  if (yearsSet.size === 0) {
                    yearsSet.add(2025);
                  }

                  // Create year array in ascending order
                  const yearsArray = Array.from(yearsSet).sort();
                  
                  // Initialize yearly data
                  const yearlyData = yearsArray.map((year) => ({
                    year: year.toString(),
                    cashIn: 0,
                    cashOut: 0,
                    total: 0
                  }));

                  // Add actual savings data grouped by year
                  savingsRecords.forEach((record) => {
                    const year = new Date(record.record_date).getFullYear();
                    if (year >= 2025) {
                      const yearEntry = yearlyData.find((y) => y.year === year.toString());
                      if (yearEntry) {
                        if (record.amount >= 0) {
                          yearEntry.cashIn += record.amount;
                        } else {
                          yearEntry.cashOut += Math.abs(record.amount);
                        }
                      }
                    }
                  });

                  // Calculate cumulative totals across years
                  let cumulativeTotal = 0;
                  yearlyData.forEach((year) => {
                    cumulativeTotal += (year.cashIn - year.cashOut);
                    year.total = cumulativeTotal;
                  });

                  return yearlyData;
                })()}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => `RM ${value.toLocaleString('en-MY', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
                  labelFormatter={(label) => `${label}`}
                />
                <Legend />
                <Bar 
                  dataKey="cashIn" 
                  fill="#22c55e" 
                  name="Cash In" 
                  radius={[8, 8, 0, 0]}
                />
                <Bar 
                  dataKey="cashOut" 
                  fill="#ef4444" 
                  name="Cash Out" 
                  radius={[8, 8, 0, 0]}
                />
                <Bar 
                  dataKey="total" 
                  fill="#3b82f6" 
                  name="Cumulative Total" 
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No savings data available
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Savings Records</h3>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  fetch('http://localhost:5000/api/reports/savings-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({})
                  })
                  .then(async res => {
                    const text = await res.text();
                    console.log('Response status:', res.status);
                    console.log('Response text:', text);
                    
                    if (!text) {
                      throw new Error(`Empty response from server (status: ${res.status})`);
                    }
                    try {
                      return JSON.parse(text);
                    } catch (e) {
                      throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
                    }
                  })
                  .then(data => {
                    console.log('Parsed data:', data);
                    if (data.success) {
                      alert('Email report sent successfully!\n' + data.message);
                    } else {
                      alert('Failed to send email report: ' + (data.error || 'Unknown error'));
                    }
                  })
                  .catch(err => {
                    console.error('Fetch error:', err);
                    alert('Error sending email: ' + err.message);
                  });
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
              >
                📧 Email Report
              </button>
              <button
                onClick={() => {
                  fetch('http://localhost:5000/api/reports/savings-whatsapp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({})
                  })
                  .then(async res => {
                    const text = await res.text();
                    console.log('Response status:', res.status);
                    console.log('Response text:', text);
                    
                    if (!text) {
                      throw new Error(`Empty response from server (status: ${res.status})`);
                    }
                    try {
                      return JSON.parse(text);
                    } catch (e) {
                      throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
                    }
                  })
                  .then(data => {
                    console.log('Parsed data:', data);
                    if (data.success) {
                      alert('WhatsApp report sent successfully!\n' + data.message);
                    } else {
                      alert('Failed to send WhatsApp report: ' + (data.error || 'Unknown error'));
                    }
                  })
                  .catch(err => {
                    console.error('Fetch error:', err);
                    alert('Error sending WhatsApp report: ' + err.message);
                  });
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
              >
                💬 WhatsApp Report
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Type</th>
                  <th className="text-right py-3 px-4">Amount (RM)</th>
                  <th className="text-left py-3 px-4">Notes</th>
                </tr>
              </thead>
              <tbody>
                {savingsRecords.length > 0 ? (
                  savingsRecords.map((record) => (
                    <tr key={record.id} className="border-t hover:bg-gray-50">
                      <td className="py-3 px-4">{record.record_date}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${record.amount >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {record.amount >= 0 ? 'Cash In' : 'Cash Out'}
                        </span>
                      </td>
                      <td className={`py-3 px-4 text-right font-medium ${record.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>{record.amount.toLocaleString('en-MY', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                      <td className="py-3 px-4">{record.notes || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-4 px-4 text-center text-gray-500">No savings records yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Savings Goals</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savingsGoals.length > 0 ? (
              savingsGoals.map((goal) => (
                <div key={goal.id} className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="font-semibold">{goal.goal_name}</p>
                      <p className="text-sm text-gray-600">Target: RM {goal.target_amount.toLocaleString('en-MY', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                      <p className="text-sm text-gray-600">By: {goal.target_date || 'No date set'}</p>
                      {goal.description && <p className="text-sm text-gray-600 mt-1">{goal.description}</p>}
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${goal.status === 'Active' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                      {goal.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 py-4 text-center text-gray-500">No savings goals yet</div>
            )}
          </div>
        </div>
      </div>
      </div>
    );
  };

  const ReserveView = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">Total Reserve</p>
                <p className="text-3xl font-bold text-blue-600">RM 250,000</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Emergency and contingency fund</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">Monthly Allocation</p>
                <p className="text-3xl font-bold text-green-600">RM 5,000</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Regular contribution to reserve</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">Coverage Ratio</p>
                <p className="text-3xl font-bold text-purple-600">8.5 months</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Operating expenses coverage</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Reserve Allocation by Type</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Cash & Liquid Assets</p>
                  <p className="text-sm text-gray-600">Immediate access funds</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">RM 100,000</p>
                <p className="text-sm text-gray-600">40%</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Money Market Funds</p>
                  <p className="text-sm text-gray-600">Short-term fixed income</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">RM 100,000</p>
                <p className="text-sm text-gray-600">40%</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Bonds & Fixed Income</p>
                  <p className="text-sm text-gray-600">Medium-term stable returns</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">RM 50,000</p>
                <p className="text-sm text-gray-600">20%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Reserve Maintenance Schedule</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Date</th>
                  <th className="text-left py-3 px-4 font-medium">Type</th>
                  <th className="text-left py-3 px-4 font-medium">Description</th>
                  <th className="text-right py-3 px-4 font-medium">Amount</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">Dec 01, 2025</td>
                  <td className="py-3 px-4">Contribution</td>
                  <td className="py-3 px-4">Monthly allocation</td>
                  <td className="py-3 px-4 text-right font-medium">+RM 5,000</td>
                  <td className="py-3 px-4"><span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Completed</span></td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">Nov 01, 2025</td>
                  <td className="py-3 px-4">Contribution</td>
                  <td className="py-3 px-4">Monthly allocation</td>
                  <td className="py-3 px-4 text-right font-medium">+RM 5,000</td>
                  <td className="py-3 px-4"><span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Completed</span></td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">Oct 15, 2025</td>
                  <td className="py-3 px-4">Reallocation</td>
                  <td className="py-3 px-4">Portfolio rebalancing</td>
                  <td className="py-3 px-4 text-right font-medium">-RM 2,500</td>
                  <td className="py-3 px-4"><span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Completed</span></td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-3 px-4">Oct 01, 2025</td>
                  <td className="py-3 px-4">Contribution</td>
                  <td className="py-3 px-4">Monthly allocation</td>
                  <td className="py-3 px-4 text-right font-medium">+RM 5,000</td>
                  <td className="py-3 px-4"><span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Completed</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderPlans = () => {
    // Show theme detail page if a theme is selected
    if (viewingThemeId !== null) {
      return (
        <div className="space-y-0 min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 -m-6 -m-8 p-8">
          {/* Hero Section */}
          <div className="relative h-80 bg-gradient-to-r from-blue-800 to-blue-900 overflow-hidden rounded-lg mb-0">
            {/* Back Button */}
            <button
              onClick={() => setViewingThemeId(null)}
              className="absolute top-6 left-6 z-10 text-white hover:text-blue-200 font-medium flex items-center gap-2 text-sm"
            >
              ← Back to Plans
            </button>

            {/* Header Content */}
            <div className="relative h-full flex items-center px-8">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-4 border-blue-300 shadow-lg">
                  <span className="text-2xl font-bold text-blue-800">{['A1', 'A2', 'A3', 'A4'][viewingThemeId]}</span>
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">
                    {['MENANGANI ISU KEMAMPUAN DAN KEPELBAGAIAN PERUMAHAN', 'Implementation Phase', 'Active Deployment', 'Monitoring & Adjustment'][viewingThemeId]}
                  </h1>
                  <p className="text-blue-100 text-lg">Strategic Initiative for Nur' Family</p>
                </div>
              </div>
            </div>

            {/* Progress - Top Right */}
            <div className="absolute top-8 right-8 text-white">
              <div className="text-sm font-semibold mb-2">Pencapaian Sasaran Inisiatif Strategi</div>
              <div className="w-96 h-8 bg-white/20 rounded-full overflow-hidden border border-white/30">
                <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600" style={{width: '66%'}}></div>
              </div>
              <div className="text-right text-2xl font-bold mt-2">66%</div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-lg mt-6">
            <div className="p-8">
              {/* Four Radial Gauge Charts */}
              <div className="grid grid-cols-4 gap-6 mb-12">
                {[0, 1, 2, 3].map((idx) => {
                  const percentages = [77.35, 100.00, 23.16, 23.16];
                  const percentage = percentages[idx];
                  const radius = 50;
                  const centerX = 100;
                  const centerY = 100;
                  
                  // Calculate angle: 0% = 0°, 100% = 180°
                  const angle = (percentage / 100) * Math.PI;
                  const endX = centerX + radius * Math.cos(Math.PI - angle);
                  const endY = centerY - radius * Math.sin(angle);
                  const largeArc = percentage > 50 ? 1 : 0;
                  
                  return (
                    <div key={idx} className="bg-white rounded-lg shadow-lg p-8 border border-gray-200 flex flex-col items-center justify-center">
                      <div className="text-lg font-bold text-gray-800 mb-6">A1T{idx + 1}</div>
                      
                      {/* Radial Semicircle Gauge */}
                      <div className="relative w-48 h-32 flex items-center justify-center mb-6">
                        <svg width="200" height="120" viewBox="0 0 200 120" className="w-full h-full">
                          {/* Background arc (full semicircle) */}
                          <path
                            d="M 50 100 A 50 50 0 0 1 150 100"
                            fill="none"
                            stroke="#d1d5db"
                            strokeWidth="14"
                            strokeLinecap="round"
                          />
                          
                          {/* Filled progress arc */}
                          <path
                            d={`M 50 100 A 50 50 0 ${largeArc} 1 ${endX} ${endY}`}
                            fill="none"
                            stroke="#1e40af"
                            strokeWidth="14"
                            strokeLinecap="round"
                            className="transition-all duration-700"
                          />
                        </svg>
                        
                        {/* Percentage text */}
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                          <span className="text-2xl font-bold text-gray-800">{percentage.toFixed(2)}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tabs */}
              <div className="mt-8">
                <div className="flex gap-8 border-b border-gray-200 mb-8">
                  <button className="px-4 py-3 font-medium text-gray-700 border-b-2 border-blue-600 text-blue-600">
                    Sasaran
                  </button>
                  <button className="px-4 py-3 font-medium text-gray-500 hover:text-gray-700">
                    Tajuk Sasaran
                  </button>
                  <button className="px-4 py-3 font-medium text-gray-500 hover:text-gray-700 ml-auto">
                    Maklumat Lanjut
                  </button>
                </div>

                {/* Content Table */}
                <div className="space-y-4">
                  {[
                    { id: 'A1T1', desc: 'Pembekalan 220,000 unit Rumah Mampu Milik menjelang tahun 2030', goalName: 'Dana kecemasan 6 bulan' },
                    { id: 'A1T2', desc: '3,000 keluarga mendapat faedah daripada kewujudan skim perumahan urban menjelang tahun 2030', goalName: null },
                    { id: 'A1T3', desc: 'Pembekalan 22,000 unit sewa beli menjelang tahun 2030', goalName: null }
                  ].map((item) => {
                    const isExpanded = expandedTarget === item.id;
                    const matchingGoal = savingsGoals.find(g => g.goal_name === item.goalName);
                    const currentAmount = matchingGoal 
                      ? savingsRecords.reduce((sum, record) => sum + (record.amount || 0), 0)
                      : 0;
                    const targetAmount = matchingGoal ? (matchingGoal.target_amount || 0) : 0;
                    const progressPercent = targetAmount > 0 ? Math.round((currentAmount / targetAmount) * 100) : 0;
                    
                    return (
                      <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div 
                          className="bg-gray-50 p-4 border-b border-gray-200 hover:bg-gray-100 transition cursor-pointer"
                          onClick={() => setExpandedTarget(isExpanded ? null : item.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <span className="font-bold text-gray-800 min-w-20">{item.id}</span>
                              <span className="text-gray-700">{item.desc}</span>
                            </div>
                            <span className={`text-gray-400 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`}>↓</span>
                          </div>
                        </div>
                        
                        {/* Expanded Content - Table */}
                        {isExpanded && (
                          <div className="p-4 bg-white">
                            {matchingGoal ? (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                  <div className="bg-blue-50 p-3 rounded">
                                    <p className="text-xs text-gray-600 mb-1">Target Amount</p>
                                    <p className="text-lg font-bold text-blue-600">RM {targetAmount.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                  </div>
                                  <div className="bg-green-50 p-3 rounded">
                                    <p className="text-xs text-gray-600 mb-1">Current Savings</p>
                                    <p className="text-lg font-bold text-green-600">RM {currentAmount.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                  </div>
                                </div>
                                
                                <div className="mb-3">
                                  <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">Progress</span>
                                    <span className="text-sm font-bold text-gray-800">{progressPercent}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div 
                                      className="bg-blue-600 h-3 rounded-full transition-all" 
                                      style={{ width: `${progressPercent}%` }}
                                    ></div>
                                  </div>
                                  <p className="text-xs text-gray-600 mt-2">
                                    {targetAmount > currentAmount 
                                      ? `RM ${(targetAmount - currentAmount).toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} remaining to reach target`
                                      : 'Target achieved! ✓'
                                    }
                                  </p>
                                </div>
                                
                                <table className="w-full text-sm">
                                  <thead className="bg-gray-50 border-t border-b border-gray-200">
                                    <tr>
                                      <th className="text-left py-2 px-3 font-semibold text-gray-700">Tajuk Projek</th>
                                      <th className="text-right py-2 px-3 font-semibold text-gray-700">Progress</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="border-b border-gray-200 hover:bg-gray-50">
                                      <td className="py-2 px-3 text-gray-700">{item.goalName}</td>
                                      <td className="py-2 px-3 text-right">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${progressPercent >= 100 ? 'bg-green-100 text-green-700' : progressPercent >= 50 ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                          {progressPercent}%
                                        </span>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="p-4 text-center text-gray-500 text-sm">
                                No linked savings goal found for this target.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Admin Buttons */}
              {user?.role === 'admin' && (
                <div className="flex gap-3 mt-12 pt-8 border-t">
                  <button
                    onClick={() => setEditingTheme(viewingThemeId)}
                    className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition font-medium"
                  >
                    Edit Theme
                  </button>
                  <button
                    onClick={() => setViewingThemeId(null)}
                    className="px-6 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition font-medium"
                  >
                    Back
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Show plans list
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow p-8 text-white">
          <h2 className="text-3xl font-bold mb-2">Strategic Plans</h2>
          <p className="text-blue-100">RANCANGAN NUR' KE - 1 | Timeframe: 2025-2030</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Plan Progress</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Plan Progression (%)</label>
              <input
                type="range"
                min="0"
                max="100"
                value={planProgress[1] || 0}
                onChange={(e) => setPlanProgress({ ...planProgress, [1]: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="text-right text-sm text-gray-600 mt-2">{planProgress[1] || 0}%</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">TEMA A</h3>
          <p className="text-sm text-gray-600 mb-6">MEMBANGUNKAN ASAS EKONOMI NUR'</p>
          <div className="grid grid-cols-4 gap-4">
            {[
              { title: 'A1', subtext: 'Membina Kubu Kewangan Nur\'', progress: planProgress[1] ? Math.min(100, planProgress[1] * 0.8) : 0 },
              { title: 'Development', subtext: 'Implementation Phase', progress: planProgress[1] ? Math.max(0, Math.min(100, planProgress[1] - 20)) : 0 },
              { title: 'Execution', subtext: 'Active Deployment', progress: planProgress[1] ? Math.max(0, Math.min(100, planProgress[1] * 1.1)) : 0 },
              { title: 'Review', subtext: 'Monitoring & Adjustment', progress: planProgress[1] ? Math.min(100, planProgress[1] * 0.9) : 0 }
            ].map((theme, idx) => (
              <div 
                key={idx} 
                onClick={() => setViewingThemeId(idx)}
                className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-4 border border-blue-100 text-center flex flex-col items-center justify-between cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all duration-200"
              >
                <div>
                  <h4 className="text-base font-bold text-gray-800 mb-1">{theme.title}</h4>
                  <p className="text-xs text-gray-600 mb-4">{theme.subtext}</p>
                </div>
                
                <div className="flex justify-center mb-3 w-full">
                  <div className="relative" style={{ width: '100px', height: '100px' }}>
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                      <circle
                        cx="60"
                        cy="60"
                        r="54"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="54"
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="8"
                        strokeDasharray={`${(theme.progress / 100) * 339.29} 339.29`}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#1e40af" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-blue-600">{Math.round(theme.progress)}%</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-xs text-gray-600">
                  {theme.progress < 30 ? 'Starting' : theme.progress < 60 ? 'In Progress' : theme.progress < 90 ? 'Advanced' : 'Completing'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    // if (!user) {
    //   return <LoginPage profiles={profiles} onLogin={setUser} />;
    // }
    if (selectedSavingsRecord) {
      return <SavingsRecordDetailView recordId={selectedSavingsRecord} />;
    }
    if (selectedAsset) {
      return <AssetDetailView assetName={selectedAsset} />;
    }
    if (selectedAlternativeInvestment) {
      return <AlternativeInvestmentDetailView investmentId={selectedAlternativeInvestment} />;
    }
    if (activeSection === 'allinvestments' && selectedInvestmentType === 'cash') {
      return <CashEquivalentDetailView />;
    }
    if (activeSection === 'allinvestments' && selectedInvestmentType === 'alternative') {
      return <AlternativeInvestmentListView />;
    }
    if (activeSection === 'allinvestments' && selectedInvestmentType === 'equities') {
      return <EquitiesDetailView />;
    }
    if (activeSection === 'allinvestments' && selectedInvestmentType === 'fixed-income' && selectedBond) {
      return <BondDetailView bondName={selectedBond} />;
    }
    if (activeSection === 'allinvestments' && selectedInvestmentType === 'fixed-income') {
      return <FixedIncomeDetailView />;
    }
    switch (activeSection) {
      case 'dashboard':
        return <DashboardView />;
      case 'portfolio':
        return <PortfolioView />;
      case 'allinvestments':
        return <AllInvestmentsView />;
      case 'governance':
        return <GovernanceView />;
      case 'admin':
        return (
          <AdminPanel
            equitiesCompanies={equitiesCompanies}
            setEquitiesCompanies={setEquitiesCompanies}
            fixedIncomeBonds={fixedIncomeBonds}
            setFixedIncomeBonds={setFixedIncomeBonds}
            assetMonthlyData={assetMonthlyData}
            setAssetMonthlyData={setAssetMonthlyData}
            fixedIncomeMonthlyData={fixedIncomeMonthlyData}
            setFixedIncomeMonthlyData={setFixedIncomeMonthlyData}
            savingsRecords={savingsRecords}
            setSavingsRecords={setSavingsRecords}
            savingsGoals={savingsGoals}
            setSavingsGoals={setSavingsGoals}
            alternativeInvestments={alternativeInvestments}
            setAlternativeInvestments={setAlternativeInvestments}
            funds={funds}
            setFunds={setFunds}
          />
        );
      case 'profiles':
        if (currentUser && currentUser.role === 'admin') {
          return <UserProfilePanel user={currentUser} profiles={profiles} setProfiles={setProfiles} />;
        }
        return (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600">Access denied</p>
          </div>
        );
      case 'myprofile':
        return (
          <div className="space-y-6 max-w-lg mx-auto">
            <h2 className="text-2xl font-bold mb-4">My Profile</h2>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="mb-2"><span className="font-semibold">Name:</span> {currentUser?.name}</div>
              <div className="mb-2"><span className="font-semibold">Email:</span> {currentUser?.email}</div>
              <div className="mb-2"><span className="font-semibold">Role:</span> {currentUser?.role}</div>
            </div>
          </div>
        );
      case 'documents':
        return <DocumentsView />;
      case 'savings':
        return <SavingsView />;
      case 'reserve':
        return <ReserveView />;
      case 'plans':
        return renderPlans();
      default:
        return (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600">This section is under development</p>
          </div>
        );
    }
  };

  if (!user) {
    return renderContent();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-blue-600">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
          <p className="text-lg text-gray-700">Loading your investment data...</p>
          {error && <p className="text-red-600 mt-4">{error}</p>}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-lg shadow">
          <p className="text-red-600 font-semibold mb-2">Error Loading Data</p>
          <p className="text-gray-700">{error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="bg-slate-900 shadow border-b border-slate-800 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors" 
                onClick={() => {
                  setSidebarOpen(!sidebarOpen);
                  setMobileMenuOpen(!mobileMenuOpen);
                }}
                title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
              >
                <Menu className="w-5 h-5 text-slate-300" />
              </button>
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-100">Nur' Investment Fund</h1>
                <p className="text-sm text-slate-400">Family Wealth Management</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2">
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-200">{currentUser?.name}</p>
                  <p className="text-xs text-slate-400">{currentUser?.role}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <button
                className="ml-4 px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                onClick={() => setUser(null)}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Overlay to close sidebar on click - Mobile */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
        
        <aside 
          className={`${
            mobileMenuOpen ? 'block' : 'hidden'
          } md:block w-64 bg-slate-900 border-r border-slate-800 min-h-screen fixed md:static left-0 top-16 md:top-0 z-40 transition-all duration-300`}>
          <div className="flex justify-end p-4 md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 hover:bg-slate-800 rounded-lg"
            >
              <X className="w-5 h-5 text-slate-300" />
            </button>
          </div>
          <nav className="p-4 space-y-2 mt-0 md:mt-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              
              // Handle grouped items (Financial with submenu)
              if (item.isGroup) {
                return (
                  <div key={item.id} className="space-y-1">
                    <button
                      onClick={() => {
                        setFinancialDropdownOpen(!financialDropdownOpen);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                        item.submenu.some(sub => activeSection === sub.id || (sub.submenu && sub.submenu.some(s => activeSection === s.id)))
                          ? 'bg-blue-600 text-white font-medium'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </div>
                      <span className={`transform transition-transform ${financialDropdownOpen ? 'rotate-180' : ''}`}>
                        ▼
                      </span>
                    </button>
                    
                    {/* Dropdown submenu */}
                    {financialDropdownOpen && (
                      <div className="pl-2 space-y-1 bg-slate-800 rounded-lg py-1">
                        {item.submenu.map((subitem) => {
                          const SubIcon = subitem.icon;
                          
                          // Handle nested subgroups (Investment submenu)
                          if (subitem.isSubGroup) {
                            return (
                              <div key={subitem.id} className="space-y-1">
                                <button
                                  onClick={() => {
                                    setInvestmentDropdownOpen(!investmentDropdownOpen);
                                  }}
                                  className={`w-full flex items-center justify-between px-3 py-2 rounded transition-colors text-sm ${
                                    subitem.submenu.some(s => activeSection === s.id)
                                      ? 'bg-blue-600 text-white font-medium'
                                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <SubIcon className="w-4 h-4" />
                                    <span>{subitem.name}</span>
                                  </div>
                                  <span className={`transform transition-transform text-xs ${investmentDropdownOpen ? 'rotate-180' : ''}`}>
                                    ▼
                                  </span>
                                </button>
                                
                                {/* Nested submenu */}
                                {investmentDropdownOpen && (
                                  <div className="pl-2 space-y-1">
                                    {subitem.submenu.map((subsubitem) => {
                                      const SubSubIcon = subsubitem.icon;
                                      return (
                                        <button
                                          key={subsubitem.id}
                                          onClick={() => {
                                            setActiveSection(subsubitem.id);
                                            setMobileMenuOpen(false);
                                          }}
                                          className={`w-full flex items-center gap-2 px-3 py-2 rounded transition-colors text-xs ${
                                            activeSection === subsubitem.id
                                              ? 'bg-blue-600 text-white font-medium'
                                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                                          }`}
                                        >
                                          <SubSubIcon className="w-3 h-3" />
                                          <span>{subsubitem.name}</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          }
                          
                          // Regular submenu items
                          return (
                            <button
                              key={subitem.id}
                              onClick={() => {
                                setActiveSection(subitem.id);
                                setMobileMenuOpen(false);
                              }}
                              className={`w-full flex items-center gap-3 px-4 py-2 rounded transition-colors text-sm ${
                                activeSection === subitem.id
                                  ? 'bg-blue-600 text-white font-medium'
                                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                              }`}
                            >
                              <SubIcon className="w-4 h-4" />
                              <span>{subitem.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }
              
              // Regular items
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeSection === item.id
                      ? 'bg-blue-600 text-white font-medium'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="flex-1 relative">
          <main className="p-6 md:p-8">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default NurInvestmentFund;