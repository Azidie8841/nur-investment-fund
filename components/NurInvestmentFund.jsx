import React, { useState, useEffect } from 'react';

import { LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Target, FileText, Users, Menu, X, Home, Briefcase, Shield, BookOpen, Calendar } from 'lucide-react';
import AdminPanel from './AdminPanel';

const NurInvestmentFund = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedInvestmentType, setSelectedInvestmentType] = useState(null);
  const [user] = useState({ name: 'Family Member', role: 'Investor' });
  const initialPerformanceData = [
    { month: 'Jan', value: 950000 },
    { month: 'Feb', value: 980000 },
    { month: 'Mar', value: 1020000 },
    { month: 'Apr', value: 1050000 },
    { month: 'May', value: 1080000 },
    { month: 'Jun', value: 1150000 },
    { month: 'Jul', value: 1200000 },
    { month: 'Aug', value: 1180000 },
    { month: 'Sep', value: 1250000 },
    { month: 'Oct', value: 1320000 },
    { month: 'Nov', value: 1380000 },
    { month: 'Dec', value: 1450000 }
  ];

  const initialAssetAllocation = [
    { name: 'Equities', value: 580000, color: '#3b82f6' },
    { name: 'Fixed Income', value: 435000, color: '#10b981' },
    { name: 'Cryptocurrencies', value: 290000, color: '#f59e0b' },
    { name: 'Gold', value: 87000, color: '#8b5cf6' },
    { name: 'Cash & Cash Equivalents', value: 58000, color: '#6b7280' }
  ];

  const initialHoldings = [
    { name: 'Equity ETF', type: 'Equity', value: 250000, allocation: '17.2%' },
    { name: 'ASB 2', type: 'Fixed Income', value: 200000, allocation: '13.8%' },
    { name: 'Real Estate Investment Trust', type: 'Real Estate', value: 180000, allocation: '12.4%' },
    { name: 'Apple', type: 'Equity', value: 150000, allocation: '10.3%' },
    { name: 'NVIDIA', type: 'Equity', value: 120000, allocation: '8.3%' },
    { name: 'Bitcoin', type: 'Cryptocurrencies', value: 87000, allocation: '6.0%' },
    { name: 'Money Market', type: 'Cash', value: 58000, allocation: '4.0%' },
    { name: 'SPUS ETF', type: 'Equity', value: 120000, allocation: '8.3%' },
  ];

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
  const initialEquitiesCompanies = [
    { name: 'Equity ETF', value: 250000, sector: 'ETF', ownership: '—', country: 'Global' },
    { name: 'Apple', value: 150000, sector: 'Technology', ownership: '—', country: 'United States' },
    { name: 'NVIDIA', value: 120000, sector: 'Technology', ownership: '—', country: 'United States' },
    { name: 'SPUS ETF', value: 120000, sector: 'ETF', ownership: '—', country: 'United States' }
  ];

  const initialMarketSegments = [
    { name: 'Equities', value: 13841391791701, countries: 62, companies: 8314, color: '#1e40af' },
    { name: 'Fixed Income', value: 5311013977241, countries: 50, bonds: 1683, color: '#059669' },
    { name: 'Real Estate', value: 365193706334, countries: 15, investments: 1341, color: '#d97706' },
    { name: 'Renewable Energy', value: 84238157610, countries: 5, investments: 10, color: '#7c3aed' }
  ];

  // Move initial arrays into component state so admin can edit them
  // small helper to persist state to localStorage
  const useLocalState = (key, initial) => {
    const [state, setState] = useState(() => {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : initial;
      } catch (e) {
        return initial;
      }
    });

    useEffect(() => {
      try {
        localStorage.setItem(key, JSON.stringify(state));
      } catch (e) {
        // ignore write errors
      }
    }, [key, state]);

    return [state, setState];
  };

  const [performanceData, setPerformanceData] = useLocalState('nur:performanceData', initialPerformanceData);
  const [assetAllocation, setAssetAllocation] = useLocalState('nur:assetAllocation', initialAssetAllocation);
  const [holdings, setHoldings] = useLocalState('nur:holdings', initialHoldings);
  const [globalMarketData, setGlobalMarketData] = useLocalState('nur:globalMarketData', initialGlobalMarketData);
  const [equitiesData, setEquitiesData] = useLocalState('nur:equitiesData', initialEquitiesData);
  const [equitiesCompanies, setEquitiesCompanies] = useLocalState('nur:equitiesCompanies', initialEquitiesCompanies);
  const [marketSegments, setMarketSegments] = useLocalState('nur:marketSegments', initialMarketSegments);

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'portfolio', name: 'Portfolio', icon: Briefcase },
    { id: 'performance', name: 'Performance', icon: TrendingUp },
    { id: 'allinvestments', name: 'All Investments', icon: TrendingUp },
    { id: 'governance', name: 'Governance', icon: Shield },
    { id: 'documents', name: 'Documents', icon: FileText },
    { id: 'admin', name: 'Admin', icon: Shield },
    { id: 'family', name: 'Family', icon: Users },
    { id: 'education', name: 'Education', icon: BookOpen },
    { id: 'meetings', name: 'Meetings', icon: Calendar }
  ];

  const DashboardView = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Fund Value</p>
              <p className="text-2xl font-bold text-gray-900">$1,450,000</p>
              <p className="text-sm text-green-600 mt-1">+8.2% YTD</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Your Stake</p>
              <p className="text-2xl font-bold text-gray-900">$290,000</p>
              <p className="text-sm text-gray-500 mt-1">20% ownership</p>
            </div>
            <Target className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Annual Return</p>
              <p className="text-2xl font-bold text-gray-900">12.4%</p>
              <p className="text-sm text-gray-500 mt-1">vs 10.2% benchmark</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Last Distribution</p>
              <p className="text-2xl font-bold text-gray-900">$18,000</p>
              <p className="text-sm text-gray-500 mt-1">Q4 2024</p>
            </div>
            <Users className="w-8 h-8 text-orange-600" />
          </div>
        </div>
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

  const EquitiesDetailView = () => (
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
          <p className="text-gray-600 mt-2">13,841,391,791,701 NOK</p>
          <p className="text-sm text-gray-500">62 countries • 8,314 investments • 70.6% of all investments</p>
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
                  <th className="text-left py-3 px-4 font-semibold">Company</th>
                  <th className="text-right py-3 px-4 font-semibold">Value NOK</th>
                  <th className="text-left py-3 px-4 font-semibold">Sector</th>
                  <th className="text-right py-3 px-4 font-semibold">Ownership</th>
                  <th className="text-left py-3 px-4 font-semibold">Country</th>
                </tr>
              </thead>
              <tbody>
                {equitiesCompanies.map((company, idx) => (
                  <tr key={idx} className="border-t hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <a href="#" className="text-blue-600 hover:underline">{company.name}</a>
                    </td>
                    <td className="py-3 px-4 text-right">{company.value.toLocaleString()}</td>
                    <td className="py-3 px-4">{company.sector}</td>
                    <td className="py-3 px-4 text-right">{company.ownership}</td>
                    <td className="py-3 px-4">{company.country}</td>
                  </tr>
                ))}
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
          <h3 className="text-lg font-semibold mb-4">Historic Investments - Equities</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={equitiesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip formatter={(value) => `${value}T NOK`} />
              <Bar dataKey="value" fill="#1e40af" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const AllInvestmentsView = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">All Investments Overview</h2>
          <p className="text-gray-600 mt-2">Total market value: 19,601,837,632,886 NOK</p>
          <p className="text-sm text-gray-500">70 countries • 11,308 investments • 100% of all investments</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {marketSegments.map((segment, idx) => (
            <div 
              key={idx} 
              className="border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                if (segment.name === 'Equities') {
                  setSelectedInvestmentType('equities');
                }
              }}
            >
              <h3 className="text-lg font-semibold mb-2" style={{ color: segment.color }}>{segment.name}</h3>
              <p className="text-2xl font-bold text-gray-900 mb-2">
                {(segment.value / 1000000000000).toFixed(2)}T NOK
              </p>
              <div className="space-y-1 text-sm text-gray-600">
                <p>{segment.countries} countries</p>
                <p>{segment.companies || segment.bonds || segment.investments} {segment.companies ? 'companies' : segment.bonds ? 'bonds' : 'investments'}</p>
                <p>{((segment.value / 19601837632886) * 100).toFixed(1)}% of all investments</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Historic Investments (Billions NOK)</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={globalMarketData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="equities" stackId="a" fill="#1e40af" name="Equity Investments" />
              <Bar dataKey="fixed" stackId="a" fill="#059669" name="Fixed-income Investments" />
              <Bar dataKey="real" stackId="a" fill="#d97706" name="Real Estate Investments" />
              <Bar dataKey="renewable" stackId="a" fill="#7c3aed" name="Renewable Energy" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

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

  const renderContent = () => {
    if (activeSection === 'allinvestments' && selectedInvestmentType === 'equities') {
      return <EquitiesDetailView />;
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
              holdings={holdings}
              setHoldings={setHoldings}
              assetAllocation={assetAllocation}
              setAssetAllocation={setAssetAllocation}
              equitiesCompanies={equitiesCompanies}
              setEquitiesCompanies={setEquitiesCompanies}
              performanceData={performanceData}
              setPerformanceData={setPerformanceData}
              marketSegments={marketSegments}
              setMarketSegments={setMarketSegments}
            />
          );
      case 'documents':
        return <DocumentsView />;
      default:
        return (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600">This section is under development</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow border-b sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors" 
                onClick={() => {
                  setSidebarOpen(!sidebarOpen);
                  setMobileMenuOpen(!mobileMenuOpen);
                }}
                title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Nur' Investment Fund</h1>
                <p className="text-sm text-gray-600">Family Wealth Management</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2">
                <div className="text-right">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-gray-600">{user.role}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className={`${
          mobileMenuOpen ? 'block' : 'hidden'
        } md:${sidebarOpen ? 'block' : 'hidden'} w-64 bg-white border-r min-h-screen fixed md:relative left-0 top-0 z-40 transition-all duration-300`}>
          <div className="flex justify-end p-4 md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <nav className="p-4 space-y-2 mt-0 md:mt-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeSection === item.id
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 p-6 md:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default NurInvestmentFund;