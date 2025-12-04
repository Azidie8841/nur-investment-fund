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

