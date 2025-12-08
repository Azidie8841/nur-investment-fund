const API_BASE = 'http://localhost:5000/api';

// Helper function for error handling
const handleResponse = async (response) => {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API Error: ${response.status} ${response.statusText} - ${text}`);
  }
  return response.json();
};

// Equities Companies
export const fetchEquitiesCompanies = async () => {
  try {
    const res = await fetch(`${API_BASE}/equities-companies`);
    const data = await handleResponse(res);
    console.log('Fetched equities companies:', data);
    return data;
  } catch (error) {
    console.error('Error fetching equities companies:', error);
    throw error;
  }
};

export const addEquitiesCompany = async (company) => {
  try {
    const res = await fetch(`${API_BASE}/equities-companies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(company)
    });
    const data = await handleResponse(res);
    console.log('Added equities company:', data);
    return data;
  } catch (error) {
    console.error('Error adding equities company:', error);
    throw error;
  }
};

export const updateEquitiesCompany = async (id, company) => {
  try {
    const res = await fetch(`${API_BASE}/equities-companies/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(company)
    });
    const data = await handleResponse(res);
    console.log('Updated equities company:', data);
    return data;
  } catch (error) {
    console.error('Error updating equities company:', error);
    throw error;
  }
};

export const deleteEquitiesCompany = async (id) => {
  try {
    const res = await fetch(`${API_BASE}/equities-companies/${id}`, {
      method: 'DELETE'
    });
    const data = await handleResponse(res);
    console.log('Deleted equities company:', data);
    return data;
  } catch (error) {
    console.error('Error deleting equities company:', error);
    throw error;
  }
};

// Fixed Income Bonds
export const fetchFixedIncomeBonds = async () => {
  try {
    const res = await fetch(`${API_BASE}/fixed-income-bonds`);
    const data = await handleResponse(res);
    console.log('Fetched fixed income bonds:', data);
    return data;
  } catch (error) {
    console.error('Error fetching fixed income bonds:', error);
    throw error;
  }
};

export const addFixedIncomeBond = async (bond) => {
  try {
    const res = await fetch(`${API_BASE}/fixed-income-bonds`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bond)
    });
    const data = await handleResponse(res);
    console.log('Added fixed income bond:', data);
    return data;
  } catch (error) {
    console.error('Error adding fixed income bond:', error);
    throw error;
  }
};

export const updateFixedIncomeBond = async (id, bond) => {
  try {
    const res = await fetch(`${API_BASE}/fixed-income-bonds/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bond)
    });
    const data = await handleResponse(res);
    console.log('Updated fixed income bond:', data);
    return data;
  } catch (error) {
    console.error('Error updating fixed income bond:', error);
    throw error;
  }
};

export const deleteFixedIncomeBond = async (id) => {
  try {
    const res = await fetch(`${API_BASE}/fixed-income-bonds/${id}`, {
      method: 'DELETE'
    });
    const data = await handleResponse(res);
    console.log('Deleted fixed income bond:', data);
    return data;
  } catch (error) {
    console.error('Error deleting fixed income bond:', error);
    throw error;
  }
};

// Asset Monthly Data
export const fetchAssetMonthlyData = async () => {
  try {
    const res = await fetch(`${API_BASE}/asset-monthly-data`);
    const data = await handleResponse(res);
    console.log('Fetched asset monthly data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching asset monthly data:', error);
    throw error;
  }
};

export const updateAssetMonthlyData = async (assetName, data) => {
  try {
    const res = await fetch(`${API_BASE}/asset-monthly-data/${assetName}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await handleResponse(res);
    console.log('Updated asset monthly data:', result);
    return result;
  } catch (error) {
    console.error('Error updating asset monthly data:', error);
    throw error;
  }
};

// Performance Data
export const fetchPerformanceData = async () => {
  try {
    const res = await fetch(`${API_BASE}/performance-data`);
    const data = await handleResponse(res);
    console.log('Fetched performance data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching performance data:', error);
    throw error;
  }
};

// User Profiles
export const fetchUserProfiles = async () => {
  try {
    const res = await fetch(`${API_BASE}/user-profiles`);
    const data = await handleResponse(res);
    console.log('Fetched user profiles:', data);
    return data;
  } catch (error) {
    console.error('Error fetching user profiles:', error);
    throw error;
  }
};

export const addUserProfile = async (profile) => {
  try {
    const res = await fetch(`${API_BASE}/user-profiles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    });
    const data = await handleResponse(res);
    console.log('Added user profile:', data);
    return data;
  } catch (error) {
    console.error('Error adding user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (id, profile) => {
  try {
    const res = await fetch(`${API_BASE}/user-profiles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    });
    const data = await handleResponse(res);
    console.log('Updated user profile:', data);
    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const deleteUserProfile = async (id) => {
  try {
    const res = await fetch(`${API_BASE}/user-profiles/${id}`, {
      method: 'DELETE'
    });
    const data = await handleResponse(res);
    console.log('Deleted user profile:', data);
    return data;
  } catch (error) {
    console.error('Error deleting user profile:', error);
    throw error;
  }
};

// Savings Records
export const fetchSavingsRecords = async () => {
  try {
    const res = await fetch(`${API_BASE}/savings-records`);
    const data = await handleResponse(res);
    console.log('Fetched savings records:', data);
    return data;
  } catch (error) {
    console.error('Error fetching savings records:', error);
    throw error;
  }
};

export const addSavingsRecord = async (record) => {
  try {
    const res = await fetch(`${API_BASE}/savings-records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
    const data = await handleResponse(res);
    console.log('Added savings record:', data);
    return data;
  } catch (error) {
    console.error('Error adding savings record:', error);
    throw error;
  }
};

export const updateSavingsRecord = async (id, record) => {
  try {
    const res = await fetch(`${API_BASE}/savings-records/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
    const data = await handleResponse(res);
    console.log('Updated savings record:', data);
    return data;
  } catch (error) {
    console.error('Error updating savings record:', error);
    throw error;
  }
};

export const deleteSavingsRecord = async (id) => {
  try {
    const res = await fetch(`${API_BASE}/savings-records/${id}`, {
      method: 'DELETE'
    });
    const data = await handleResponse(res);
    console.log('Deleted savings record:', data);
    return data;
  } catch (error) {
    console.error('Error deleting savings record:', error);
    throw error;
  }
};

// Savings Goals
export const fetchSavingsGoals = async () => {
  try {
    const res = await fetch(`${API_BASE}/savings-goals`);
    const data = await handleResponse(res);
    console.log('Fetched savings goals:', data);
    return data;
  } catch (error) {
    console.error('Error fetching savings goals:', error);
    throw error;
  }
};

export const addSavingsGoal = async (goal) => {
  try {
    const res = await fetch(`${API_BASE}/savings-goals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goal)
    });
    const data = await handleResponse(res);
    console.log('Added savings goal:', data);
    return data;
  } catch (error) {
    console.error('Error adding savings goal:', error);
    throw error;
  }
};

export const updateSavingsGoal = async (id, goal) => {
  try {
    const res = await fetch(`${API_BASE}/savings-goals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goal)
    });
    const data = await handleResponse(res);
    console.log('Updated savings goal:', data);
    return data;
  } catch (error) {
    console.error('Error updating savings goal:', error);
    throw error;
  }
};

export const deleteSavingsGoal = async (id) => {
  try {
    const res = await fetch(`${API_BASE}/savings-goals/${id}`, {
      method: 'DELETE'
    });
    const data = await handleResponse(res);
    console.log('Deleted savings goal:', data);
    return data;
  } catch (error) {
    console.error('Error deleting savings goal:', error);
    throw error;
  }
};

// Fixed Income Monthly Data
export const fetchFixedIncomeMonthlyData = async () => {
  try {
    const res = await fetch(`${API_BASE}/fixed-income-monthly-data`);
    const data = await handleResponse(res);
    console.log('Fetched fixed income monthly data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching fixed income monthly data:', error);
    throw error;
  }
};

export const updateFixedIncomeMonthlyData = async (assetName, monthlyData) => {
  try {
    const res = await fetch(`${API_BASE}/fixed-income-monthly-data/${assetName}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(monthlyData)
    });
    const data = await handleResponse(res);
    console.log('Updated fixed income monthly data:', data);
    return data;
  } catch (error) {
    console.error('Error updating fixed income monthly data:', error);
    throw error;
  }
};

// Bond Annual Dividends
export const fetchBondDividends = async (bondName) => {
  try {
    const res = await fetch(`${API_BASE}/bond-dividends/${bondName}`);
    const data = await handleResponse(res);
    console.log('Fetched bond dividends:', data);
    return data;
  } catch (error) {
    console.error('Error fetching bond dividends:', error);
    throw error;
  }
};

export const addBondDividend = async (bondName, year, dividendAmount) => {
  try {
    const res = await fetch(`${API_BASE}/bond-dividends`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bondName, year, dividendAmount })
    });
    const data = await handleResponse(res);
    console.log('Added bond dividend:', data);
    return data;
  } catch (error) {
    console.error('Error adding bond dividend:', error);
    throw error;
  }
};

export const deleteBondDividend = async (bondName, year) => {
  try {
    const res = await fetch(`${API_BASE}/bond-dividends/${bondName}/${year}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await handleResponse(res);
    console.log('Deleted bond dividend:', data);
    return data;
  } catch (error) {
    console.error('Error deleting bond dividend:', error);
    throw error;
  }
};

// Bond Monthly Dividends
export const fetchBondMonthlyDividends = async () => {
  try {
    const res = await fetch(`${API_BASE}/bond-monthly-dividends`);
    const data = await handleResponse(res);
    console.log('Fetched bond monthly dividends:', data);
    return data;
  } catch (error) {
    console.error('Error fetching bond monthly dividends:', error);
    throw error;
  }
};

export const updateBondMonthlyDividends = async (bondName, monthlyData) => {
  try {
    const res = await fetch(`${API_BASE}/bond-monthly-dividends/${bondName}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(monthlyData)
    });
    const data = await handleResponse(res);
    console.log('Updated bond monthly dividends:', data);
    return data;
  } catch (error) {
    console.error('Error updating bond monthly dividends:', error);
    throw error;
  }
};

// Database Backup functions
export const createDatabaseBackup = async () => {
  try {
    const res = await fetch(`${API_BASE}/backup/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await handleResponse(res);
    console.log('Backup created:', data);
    return data;
  } catch (error) {
    console.error('Error creating backup:', error);
    throw error;
  }
};

export const listDatabaseBackups = async () => {
  try {
    const res = await fetch(`${API_BASE}/backup/list`);
    const data = await handleResponse(res);
    console.log('Backups:', data);
    return data;
  } catch (error) {
    console.error('Error listing backups:', error);
    throw error;
  }
};

export const restoreDatabaseBackup = async (backupName) => {
  try {
    const res = await fetch(`${API_BASE}/backup/restore/${backupName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await handleResponse(res);
    console.log('Database restored:', data);
    return data;
  } catch (error) {
    console.error('Error restoring backup:', error);
    throw error;
  }
};

// Bond Monthly Values
export const fetchBondMonthlyValues = async () => {
  try {
    const res = await fetch(`${API_BASE}/bond-monthly-values`);
    const data = await handleResponse(res);
    console.log('Fetched bond monthly values:', data);
    return data;
  } catch (error) {
    console.error('Error fetching bond monthly values:', error);
    throw error;
  }
};

export const updateBondMonthlyValues = async (bondName, monthlyData) => {
  try {
    const res = await fetch(`${API_BASE}/bond-monthly-values/${bondName}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(monthlyData)
    });
    const data = await handleResponse(res);
    console.log('Updated bond monthly values:', data);
    return data;
  } catch (error) {
    console.error('Error updating bond monthly values:', error);
    throw error;
  }
};

// Alternative Investments
export const fetchAlternativeInvestments = async () => {
  try {
    const res = await fetch(`${API_BASE}/alternative-investments`);
    const data = await handleResponse(res);
    console.log('Fetched alternative investments:', data);
    return data;
  } catch (error) {
    console.error('Error fetching alternative investments:', error);
    throw error;
  }
};

export const addAlternativeInvestment = async (investment) => {
  try {
    const res = await fetch(`${API_BASE}/alternative-investments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(investment)
    });
    const data = await handleResponse(res);
    console.log('Added alternative investment:', data);
    return data;
  } catch (error) {
    console.error('Error adding alternative investment:', error);
    throw error;
  }
};

export const updateAlternativeInvestment = async (id, investment) => {
  try {
    const res = await fetch(`${API_BASE}/alternative-investments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(investment)
    });
    const data = await handleResponse(res);
    console.log('Updated alternative investment:', data);
    return data;
  } catch (error) {
    console.error('Error updating alternative investment:', error);
    throw error;
  }
};

export const deleteAlternativeInvestment = async (id) => {
  try {
    const res = await fetch(`${API_BASE}/alternative-investments/${id}`, {
      method: 'DELETE'
    });
    const data = await handleResponse(res);
    console.log('Deleted alternative investment:', data);
    return data;
  } catch (error) {
    console.error('Error deleting alternative investment:', error);
    throw error;
  }
};

export const fetchAlternativeInvestmentMonthlyData = async (investmentName) => {
  try {
    const res = await fetch(`${API_BASE}/alternative-investment-monthly-data/${investmentName}`);
    const data = await handleResponse(res);
    console.log('Fetched alternative investment monthly data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching alternative investment monthly data:', error);
    throw error;
  }
};

export const updateAlternativeInvestmentMonthlyData = async (investmentName, monthlyData) => {
  try {
    const res = await fetch(`${API_BASE}/alternative-investment-monthly-data/${investmentName}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(monthlyData)
    });
    const data = await handleResponse(res);
    console.log('Updated alternative investment monthly data:', data);
    return data;
  } catch (error) {
    console.error('Error updating alternative investment monthly data:', error);
    throw error;
  }
};

// Strategic Plans
export const fetchStrategicPlans = async () => {
  try {
    const res = await fetch(`${API_BASE}/strategic-plans`);
    const data = await handleResponse(res);
    console.log('Fetched strategic plans:', data);
    return data;
  } catch (error) {
    console.error('Error fetching strategic plans:', error);
    throw error;
  }
};

export const createStrategicPlan = async (plan) => {
  try {
    const res = await fetch(`${API_BASE}/strategic-plans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(plan)
    });
    const data = await handleResponse(res);
    console.log('Created strategic plan:', data);
    return data;
  } catch (error) {
    console.error('Error creating strategic plan:', error);
    throw error;
  }
};

export const updateStrategicPlan = async (id, plan) => {
  try {
    const res = await fetch(`${API_BASE}/strategic-plans/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(plan)
    });
    const data = await handleResponse(res);
    console.log('Updated strategic plan:', data);
    return data;
  } catch (error) {
    console.error('Error updating strategic plan:', error);
    throw error;
  }
};

export const deleteStrategicPlan = async (id) => {
  try {
    const res = await fetch(`${API_BASE}/strategic-plans/${id}`, {
      method: 'DELETE'
    });
    const data = await handleResponse(res);
    console.log('Deleted strategic plan:', data);
    return data;
  } catch (error) {
    console.error('Error deleting strategic plan:', error);
    throw error;
  }
};

// Fund Management CRUD
export const fetchFunds = async () => {
  try {
    const res = await fetch(`${API_BASE}/funds`);
    const data = await handleResponse(res);
    console.log('Fetched funds:', data);
    return data;
  } catch (error) {
    console.error('Error fetching funds:', error);
    throw error;
  }
};

export const addFund = async (fund) => {
  try {
    const res = await fetch(`${API_BASE}/funds`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fund)
    });
    const data = await handleResponse(res);
    console.log('Added fund:', data);
    return data;
  } catch (error) {
    console.error('Error adding fund:', error);
    throw error;
  }
};

export const updateFund = async (id, fund) => {
  try {
    const res = await fetch(`${API_BASE}/funds/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fund)
    });
    const data = await handleResponse(res);
    console.log('Updated fund:', data);
    return data;
  } catch (error) {
    console.error('Error updating fund:', error);
    throw error;
  }
};

export const deleteFund = async (id) => {
  try {
    const res = await fetch(`${API_BASE}/funds/${id}`, {
      method: 'DELETE'
    });
    const data = await handleResponse(res);
    console.log('Deleted fund:', data);
    return data;
  } catch (error) {
    console.error('Error deleting fund:', error);
    throw error;
  }
};

export const updateFundValue = async (id, current_value) => {
  try {
    const res = await fetch(`${API_BASE}/funds/${id}/value`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_value })
    });
    const data = await handleResponse(res);
    console.log('Updated fund value:', data);
    return data;
  } catch (error) {
    console.error('Error updating fund value:', error);
    throw error;
  }
};
