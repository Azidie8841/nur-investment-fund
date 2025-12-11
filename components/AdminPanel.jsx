import React, { useState, useEffect, useRef } from 'react';
import { addEquitiesCompany, updateEquitiesCompany, deleteEquitiesCompany, addFixedIncomeBond, updateFixedIncomeBond, deleteFixedIncomeBond, updateAssetMonthlyData, updateFixedIncomeMonthlyData, updateBondMonthlyDividends, updateBondMonthlyValues, createDatabaseBackup, listDatabaseBackups, restoreDatabaseBackup, addSavingsRecord, addSavingsGoal, updateSavingsGoal, deleteSavingsRecord, deleteSavingsGoal, fetchSavingsRecords, fetchSavingsGoals, addAlternativeInvestment, updateAlternativeInvestment, deleteAlternativeInvestment, updateAlternativeInvestmentMonthlyData, fetchFunds, addFund, updateFund, deleteFund, fetchAllocationSettings, updateAllocationSettings } from '../utils/api';

export default function AdminPanel({
  equitiesCompanies,
  setEquitiesCompanies,
  fixedIncomeBonds,
  setFixedIncomeBonds,
  assetMonthlyData,
  setAssetMonthlyData,
  fixedIncomeMonthlyData,
  setFixedIncomeMonthlyData,
  savingsRecords,
  setSavingsRecords,
  savingsGoals,
  setSavingsGoals,
  alternativeInvestments,
  setAlternativeInvestments,
  funds,
  setFunds,
}) {
  // Fund management state
  const [editingFund, setEditingFund] = useState(null);
  const [editFundName, setEditFundName] = useState('');
  const [editFundType, setEditFundType] = useState('Savings');
  const [editFundTarget, setEditFundTarget] = useState('');
  const [newFundName, setNewFundName] = useState('');
  const [newFundType, setNewFundType] = useState('Savings');
  const [newFundTarget, setNewFundTarget] = useState('');
  
  // holdings form state
  const [hName, setHName] = useState('');
  const [hType, setHType] = useState('Equity');
  const [hValue, setHValue] = useState('');
  const [hAllocation, setHAllocation] = useState('');

  // asset allocation form
  const [aName, setAName] = useState('');
  const [aValue, setAValue] = useState('');
  const [aColor, setAColor] = useState('#3b82f6');

  // admin navigation state
  const [activeAdminView, setActiveAdminView] = useState('dashboard'); // 'dashboard' or 'allocation-detail'

  // allocation percentage state
  const [allocationPercentages, setAllocationPercentages] = useState({
    equities: 60,
    fixedIncome: 30,
    alternatives: 8,
    cash: 2
  });

  // allocation editing state
  const [editingAllocation, setEditingAllocation] = useState(false);
  const [tempAllocationPercentages, setTempAllocationPercentages] = useState({
    equities: 60,
    fixedIncome: 30,
    alternatives: 8,
    cash: 2
  });
  const [hoveredSegment, setHoveredSegment] = useState(null);

  // company form
  const [cName, setCName] = useState('');
  const [cValue, setCValue] = useState('');
  const [cSector, setCSector] = useState('');
  const [cOwnership, setCOwnership] = useState('');
  const [cCountry, setCCountry] = useState('');
  const [cType, setCType] = useState('Index Funds & ETF');

  // edit mode state
  const [editingCompany, setEditingCompany] = useState(null);
  const [editName, setEditName] = useState('');
  const [editValue, setEditValue] = useState('');
  const [editSector, setEditSector] = useState('');
  const [editOwnership, setEditOwnership] = useState('');
  const [editCountry, setEditCountry] = useState('');
  const [editType, setEditType] = useState('Index Funds & ETF');

  // Fixed Income Bond form state
  const [bName, setBName] = useState('');
  const [bValue, setBValue] = useState('');
  const [bType, setBType] = useState('Government');
  const [bRating, setBRating] = useState('AAA');
  const [bMaturity, setBMaturity] = useState('');
  const [bCountry, setBCountry] = useState('');

  // Fixed Income Bond edit state
  const [editingBond, setEditingBond] = useState(null);
  const [editBName, setEditBName] = useState('');
  const [editBValue, setEditBValue] = useState('');
  const [editBType, setEditBType] = useState('');
  const [editBRating, setEditBRating] = useState('');
  const [editBMaturity, setEditBMaturity] = useState('');
  const [editBCountry, setEditBCountry] = useState('');

  // Savings Record form state
  const [recordAmount, setRecordAmount] = useState('');
  const [recordDate, setRecordDate] = useState('');
  const [recordNotes, setRecordNotes] = useState('');
  const [recordType, setRecordType] = useState('in'); // 'in' for cash in, 'out' for cash out

  // Savings Goal form state
  const [goalName, setGoalName] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [goalDate, setGoalDate] = useState('');
  const [goalDescription, setGoalDescription] = useState('');

  // Savings Goal edit state
  const [editingGoal, setEditingGoal] = useState(null);
  const [editGoalName, setEditGoalName] = useState('');
  const [editGoalAmount, setEditGoalAmount] = useState('');
  const [editGoalDate, setEditGoalDate] = useState('');
  const [editGoalDescription, setEditGoalDescription] = useState('');

  // Alternative Investment form state
  const [altName, setAltName] = useState('');
  const [altType, setAltType] = useState('crypto');
  const [altValue, setAltValue] = useState('');
  const [altQuantity, setAltQuantity] = useState('');
  const [altUnit, setAltUnit] = useState('');
  const [altNotes, setAltNotes] = useState('');

  // Load funds from database on component mount
  useEffect(() => {
    const loadFunds = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/funds');
        if (response.ok) {
          const data = await response.json();
          setFunds(data);
        }
      } catch (error) {
        console.error('Failed to load funds:', error);
      }
    };
    loadFunds();
  }, []);

  // Load allocation settings from database on component mount
  useEffect(() => {
    const loadAllocationSettings = async () => {
      try {
        const settings = await fetchAllocationSettings();
        setAllocationPercentages({
          equities: settings.equities,
          fixedIncome: settings.fixed_income,
          alternatives: settings.alternatives,
          cash: settings.cash
        });
      } catch (error) {
        console.error('Failed to load allocation settings:', error);
      }
    };
    loadAllocationSettings();
  }, []);

  // simple helpers
  const addCompany = async (e) => {
    e.preventDefault();
    if (!cName || !cValue) return;
    try {
      const newCompany = await addEquitiesCompany({ 
        name: cName, 
        value: Number(cValue), 
        sector: cSector, 
        ownership: cOwnership, 
        country: cCountry,
        type: cType
      });
      setEquitiesCompanies((prev) => [newCompany, ...prev]);
      setCName(''); setCValue(''); setCSector(''); setCOwnership(''); setCCountry(''); setCType('Index Funds & ETF');
    } catch (error) {
      alert('Failed to add company: ' + error.message);
    }
  };

  const deleteCompany = async (company) => {
    if (!window.confirm(`Delete company "${company.name}"? This action cannot be undone.`)) return;
    try {
      await deleteEquitiesCompany(company.id);
      setEquitiesCompanies((prev) => prev.filter((c) => c.id !== company.id));
    } catch (error) {
      alert('Failed to delete company: ' + error.message);
    }
  };

  const startEdit = (company) => {
    setEditingCompany(company);
    setEditName(company.name);
    
    // Get latest month value from monthly data
    const monthlyData = assetMonthlyData[company.name];
    let latestValue = company.value;
    
    if (monthlyData) {
      const months = ['dec', 'nov', 'oct', 'sep', 'aug', 'jul', 'jun', 'may', 'apr', 'mar', 'feb', 'jan'];
      for (let month of months) {
        if (monthlyData[month] !== undefined && monthlyData[month] !== null) {
          latestValue = monthlyData[month] * 3.7; // Convert back to RM
          break;
        }
      }
    }
    
    setEditValue(latestValue);
    setEditSector(company.sector);
    setEditOwnership(company.ownership);
    setEditCountry(company.country);
    setEditType(company.type || 'Index Funds & ETF');
  };

  const saveEdit = async () => {
    if (!editName || editValue === '') {
      alert('Name and Value are required');
      return;
    }
    try {
      const updated = await updateEquitiesCompany(editingCompany.id, {
        name: editName,
        value: Number(editValue),
        sector: editSector,
        ownership: editOwnership,
        country: editCountry,
        type: editType
      });
      setEquitiesCompanies((prev) =>
        prev.map((c) =>
          c.id === editingCompany.id ? updated : c
        )
      );
      setEditingCompany(null);
    } catch (error) {
      alert('Failed to update company: ' + error.message);
    }
  };

  const cancelEdit = () => {
    setEditingCompany(null);
  };

  // Monthly data edit state
  const [selectedAssetForEdit, setSelectedAssetForEdit] = useState(null);
  const [monthlyValues, setMonthlyValues] = useState({});

  // Monthly dividend edit state
  const [selectedBondForDividendEdit, setSelectedBondForDividendEdit] = useState(null);
  const [monthlyDividends, setMonthlyDividends] = useState({});

  const startEditMonthly = (assetName) => {
    setSelectedAssetForEdit(assetName);
    // Initialize with existing data or empty object
    const existingData = assetMonthlyData[assetName] || {};
    setMonthlyValues({...existingData});
  };

  const saveMonthlyValues = async () => {
    try {
      // Save monthly values to database
      await updateAssetMonthlyData(selectedAssetForEdit, monthlyValues);
      setAssetMonthlyData((prev) => ({
        ...prev,
        [selectedAssetForEdit]: monthlyValues
      }));
      
      // Find the company and auto-update its market value from latest month
      const company = equitiesCompanies.find(c => c.name === selectedAssetForEdit);
      if (company) {
        const months = ['dec', 'nov', 'oct', 'sep', 'aug', 'jul', 'jun', 'may', 'apr', 'mar', 'feb', 'jan'];
        for (let month of months) {
          if (monthlyValues[month] !== undefined && monthlyValues[month] !== null) {
            const newMarketValue = Math.round(monthlyValues[month] * 3.7 * 100) / 100; // Convert to RM and round to 2 decimals
            // Auto-save updated market value to database
            await updateEquitiesCompany(company.id, {
              name: company.name,
              value: newMarketValue,
              sector: company.sector,
              ownership: company.ownership,
              country: company.country,
              type: company.type
            });
            // Update state
            setEquitiesCompanies((prev) =>
              prev.map((c) =>
                c.id === company.id ? { ...c, value: newMarketValue } : c
              )
            );
            break;
          }
        }
      }
      
      setSelectedAssetForEdit(null);
      alert('Monthly values saved and market value updated!');
    } catch (error) {
      alert('Failed to save monthly values: ' + error.message);
    }
  };

  // Auto-save monthly values with debounce
  const autoSaveTimeoutRef = useRef(null);
  const autoSaveMonthlyValues = async () => {
    try {
      if (selectedAssetForEdit) {
        await updateAssetMonthlyData(selectedAssetForEdit, monthlyValues);
        setAssetMonthlyData((prev) => ({
          ...prev,
          [selectedAssetForEdit]: monthlyValues
        }));
      }
    } catch (error) {
      console.error('Failed to auto-save monthly values:', error.message);
    }
  };

  // Debounced auto-save for monthly values
  useEffect(() => {
    if (selectedAssetForEdit && Object.keys(monthlyValues).length > 0) {
      // Clear previous timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      // Set new timeout for auto-save after 1.5 seconds of no changes
      autoSaveTimeoutRef.current = setTimeout(() => {
        autoSaveMonthlyValues();
      }, 1500);
    }
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [monthlyValues, selectedAssetForEdit]);

  const startEditBondDividends = (bondName, currentDividends = {}) => {
    setSelectedBondForDividendEdit(bondName);
    setMonthlyDividends(currentDividends);
  };

  const saveBondMonthlyDividends = async () => {
    try {
      await updateBondMonthlyDividends(selectedBondForDividendEdit, monthlyDividends);
      setSelectedBondForDividendEdit(null);
      setMonthlyDividends({});
      alert('Bond monthly dividends saved');
    } catch (error) {
      alert('Failed to save bond dividends: ' + error.message);
    }
  };

  // Monthly Bond Values handlers
  const [selectedBondForValueEdit, setSelectedBondForValueEdit] = React.useState(null);
  const [monthlyBondValues, setMonthlyBondValues] = React.useState({});

  const startEditBondValues = (bondName, currentValues = {}) => {
    setSelectedBondForValueEdit(bondName);
    setMonthlyBondValues(currentValues);
  };

  const saveBondMonthlyValues = async () => {
    try {
      await updateBondMonthlyValues(selectedBondForValueEdit, monthlyBondValues);
      setSelectedBondForValueEdit(null);
      setMonthlyBondValues({});
      alert('Bond monthly values saved');
    } catch (error) {
      alert('Failed to save bond values: ' + error.message);
    }
  };

  // Backup handlers
  const [backups, setBackups] = React.useState([]);
  const [showBackups, setShowBackups] = React.useState(false);

  const handleCreateBackup = async () => {
    try {
      await createDatabaseBackup();
      alert('Database backup created successfully');
      loadBackups();
    } catch (error) {
      alert('Failed to create backup: ' + error.message);
    }
  };

  const loadBackups = async () => {
    try {
      const backupList = await listDatabaseBackups();
      setBackups(backupList);
    } catch (error) {
      console.error('Failed to load backups:', error);
      setBackups([]);
    }
  };

  const handleRestoreBackup = async (backupName) => {
    if (window.confirm(`Restore database from ${backupName}? This will replace all current data.`)) {
      try {
        await restoreDatabaseBackup(backupName);
        alert('Database restored successfully. Server is restarting...');
        
        // Wait 3 seconds for server to restart after process.exit(0)
        setTimeout(() => {
          window.location.reload();
        }, 3000);
        
      } catch (error) {
        alert('Failed to restore backup: ' + error.message);
      }
    }
  };

  // Savings Record handlers
  const handleAddRecord = async () => {
    console.log('Add Record clicked');
    console.log('recordAmount:', recordAmount, 'type:', typeof recordAmount);
    console.log('recordDate:', recordDate, 'type:', typeof recordDate);
    
    // Trim whitespace
    const trimmedAmount = recordAmount.trim();
    const amount = parseFloat(trimmedAmount);
    
    console.log('trimmedAmount:', trimmedAmount);
    console.log('parsed amount:', amount, 'isNaN:', isNaN(amount));
    
    if (!trimmedAmount || isNaN(amount)) {
      alert('Please enter a valid amount');
      return;
    }
    
    if (amount <= 0) {
      alert('Amount must be greater than 0');
      return;
    }
    
    if (!recordDate) {
      alert('Please select a date');
      return;
    }
    
    try {
      // For cash out, store as negative value
      const finalAmount = recordType === 'out' ? -amount : amount;
      console.log('Sending to API:', { amount: finalAmount, record_date: recordDate, notes: recordNotes, type: recordType });
      const newRecord = await addSavingsRecord({
        amount: finalAmount,
        record_date: recordDate,
        notes: recordNotes
      });
      console.log('Record added:', newRecord);
      setSavingsRecords((prev) => [newRecord, ...prev]);
      setRecordAmount('');
      setRecordDate('');
      setRecordNotes('');
      setRecordType('in');
      alert('Savings record added successfully');
    } catch (error) {
      console.error('Error adding record:', error);
      alert('Error adding savings record: ' + error.message);
    }
  };

  const handleDeleteRecord = async (id) => {
    console.log('Delete button clicked for record:', id);
    if (!window.confirm('Delete this savings record?')) return;
    try {
      await deleteSavingsRecord(id);
      setSavingsRecords((prev) => prev.filter((r) => r.id !== id));
      alert('Record deleted');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  // Savings Goal handlers
  const handleAddGoal = async () => {
    console.log('Add Goal clicked');
    console.log('goalName:', goalName, 'type:', typeof goalName);
    console.log('goalAmount:', goalAmount, 'type:', typeof goalAmount);
    
    // Trim whitespace
    const trimmedName = goalName.trim();
    const trimmedAmount = goalAmount.trim();
    const amount = parseFloat(trimmedAmount);
    
    console.log('trimmedName:', trimmedName);
    console.log('trimmedAmount:', trimmedAmount);
    console.log('parsed amount:', amount, 'isNaN:', isNaN(amount));
    
    if (!trimmedName) {
      alert('Please enter a goal name');
      return;
    }
    
    if (!trimmedAmount || isNaN(amount)) {
      alert('Please enter a valid amount');
      return;
    }
    
    if (amount <= 0) {
      alert('Amount must be greater than 0');
      return;
    }
    
    try {
      console.log('Sending to API:', { goal_name: trimmedName, target_amount: amount, target_date: goalDate, description: goalDescription });
      const newGoal = await addSavingsGoal({
        goal_name: trimmedName,
        target_amount: amount,
        target_date: goalDate,
        description: goalDescription
      });
      console.log('Goal added:', newGoal);
      setSavingsGoals((prev) => [newGoal, ...prev]);
      setGoalName('');
      setGoalAmount('');
      setGoalDate('');
      setGoalDescription('');
      alert('Savings goal added successfully');
    } catch (error) {
      console.error('Error adding goal:', error);
      alert('Error adding savings goal: ' + error.message);
    }
  };

  const handleDeleteGoal = async (id) => {
    console.log('Delete button clicked for goal:', id);
    if (!window.confirm('Delete this savings goal?')) return;
    try {
      await deleteSavingsGoal(id);
      setSavingsGoals((prev) => prev.filter((g) => g.id !== id));
      alert('Goal deleted');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const startEditGoal = (goal) => {
    setEditingGoal(goal);
    setEditGoalName(goal.goal_name);
    setEditGoalAmount(goal.target_amount.toString());
    setEditGoalDate(goal.target_date || '');
    setEditGoalDescription(goal.description || '');
  };

  const cancelEditGoal = () => {
    setEditingGoal(null);
    setEditGoalName('');
    setEditGoalAmount('');
    setEditGoalDate('');
    setEditGoalDescription('');
  };

  const saveEditGoal = async () => {
    const amount = parseFloat(editGoalAmount);
    if (!editGoalName || !editGoalAmount || isNaN(amount) || amount <= 0) {
      alert('Please fill in all required fields with valid values');
      return;
    }
    try {
      await updateSavingsGoal(editingGoal.id, {
        goal_name: editGoalName,
        target_amount: amount,
        target_date: editGoalDate,
        description: editGoalDescription,
        status: editingGoal.status
      });
      setSavingsGoals((prev) =>
        prev.map((g) =>
          g.id === editingGoal.id
            ? {
                ...g,
                goal_name: editGoalName,
                target_amount: amount,
                target_date: editGoalDate,
                description: editGoalDescription
              }
            : g
        )
      );
      cancelEditGoal();
      alert('Goal updated successfully');
    } catch (error) {
      alert('Error updating goal: ' + error.message);
    }
  };

  // Fixed Income Bond handlers
  const addBond = async (e) => {
    e.preventDefault();
    if (!bName || !bValue) return;
    try {
      const newBond = await addFixedIncomeBond({ 
        name: bName, 
        value: Number(bValue) / 3.7,
        bond_type: bType,
        rating: bRating,
        maturity_date: bMaturity,
        country: bCountry
      });
      setFixedIncomeBonds((prev) => [newBond, ...prev]);
      setBName(''); setBValue(''); setBType('Government'); setBRating('AAA'); setBMaturity(''); setBCountry('');
    } catch (error) {
      alert('Failed to add bond: ' + error.message);
    }
  };

  const deleteBond = async (bond) => {
    if (!window.confirm(`Delete bond "${bond.name}"? This action cannot be undone.`)) return;
    try {
      await deleteFixedIncomeBond(bond.id);
      setFixedIncomeBonds((prev) => prev.filter((b) => b.id !== bond.id));
    } catch (error) {
      alert('Failed to delete bond: ' + error.message);
    }
  };

  const startEditBond = (bond) => {
    setEditingBond(bond);
    setEditBName(bond.name);
    setEditBValue(bond.value * 3.7);
    setEditBType(bond.bond_type);
    setEditBRating(bond.rating);
    setEditBMaturity(bond.maturity_date || '');
    setEditBCountry(bond.country || '');
  };

  const saveBondEdit = async () => {
    if (!editBName || editBValue === '') {
      alert('Name and Value are required');
      return;
    }
    try {
      const updated = await updateFixedIncomeBond(editingBond.id, {
        name: editBName,
        value: Number(editBValue) / 3.7,
        bond_type: editBType,
        rating: editBRating,
        maturity_date: editBMaturity,
        country: editBCountry
      });
      setFixedIncomeBonds((prev) =>
        prev.map((b) =>
          b.id === editingBond.id ? updated : b
        )
      );
      setEditingBond(null);
    } catch (error) {
      alert('Failed to update bond: ' + error.message);
    }
  };

  const cancelEditBond = () => {
    setEditingBond(null);
  };

  // Alternative Investment handlers
  const handleAddAlternativeInvestment = async (e) => {
    e.preventDefault();
    const value = parseFloat(altValue);
    if (!altName || !value || value <= 0) {
      alert('Please fill in all required fields with valid values');
      return;
    }
    try {
      const newInvestment = await addAlternativeInvestment({
        name: altName,
        asset_type: altType,
        current_value: value,
        quantity: altQuantity ? parseFloat(altQuantity) : null,
        unit: altUnit || null,
        notes: altNotes || null
      });
      setAlternativeInvestments((prev) => [newInvestment, ...prev]);
      setAltName('');
      setAltValue('');
      setAltQuantity('');
      setAltUnit('');
      setAltNotes('');
      alert('Alternative investment added successfully');
    } catch (error) {
      alert('Error adding investment: ' + error.message);
    }
  };

  const handleDeleteAlternativeInvestment = async (id) => {
    if (!window.confirm('Delete this alternative investment?')) return;
    try {
      await deleteAlternativeInvestment(id);
      setAlternativeInvestments((prev) => prev.filter((inv) => inv.id !== id));
      alert('Investment deleted');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Allocation Detail View */}
      {activeAdminView === 'allocation-detail' && (
        <div className="space-y-6">
          <button 
            onClick={() => setActiveAdminView('dashboard')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
          >
            <span>←</span> Back to Admin Dashboard
          </button>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">💎 Alternative Investments Allocation</h2>

          {/* Bitcoin and Gold Allocation Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bitcoin Card */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200 shadow-sm hover:shadow-md transition">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-xl font-bold text-gray-800">Bitcoin</h4>
                  <p className="text-xs text-gray-600 mt-1">Cryptocurrency asset</p>
                </div>
                <span className="text-4xl">₿</span>
              </div>

              {/* Allocation Input Section */}
              <div className="bg-white rounded-lg p-4 mb-4 border border-orange-200">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Allocation %</label>
                <div className="flex gap-2 items-center">
                  <input 
                    type="number" 
                    min="0" 
                    max="100" 
                    value={editingAllocation ? tempAllocationPercentages.alternatives : allocationPercentages.alternatives}
                    onChange={(e) => {
                      if (editingAllocation) {
                        const val = Math.max(0, Math.min(100, Number(e.target.value)));
                        setTempAllocationPercentages({...tempAllocationPercentages, alternatives: val});
                      }
                    }}
                    disabled={!editingAllocation}
                    className="flex-1 px-3 py-2 border-2 border-orange-400 rounded text-2xl font-bold text-center disabled:bg-gray-100"
                  />
                  <span className="text-2xl font-bold text-orange-600">%</span>
                </div>
              </div>

              {/* Should Invest Amount */}
              <div className="bg-orange-100 rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-1">Should invest</p>
                <p className="text-3xl font-bold text-orange-600">
                  RM {((funds[0]?.target_value || 0) * (editingAllocation ? tempAllocationPercentages.alternatives : allocationPercentages.alternatives) / 100).toLocaleString('en-MY', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </p>
              </div>
            </div>

            {/* Gold Card */}
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6 border border-yellow-200 shadow-sm hover:shadow-md transition">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-xl font-bold text-gray-800">Gold</h4>
                  <p className="text-xs text-gray-600 mt-1">Precious metal asset</p>
                </div>
                <span className="text-4xl">🏆</span>
              </div>

              {/* Allocation Input Section */}
              <div className="bg-white rounded-lg p-4 mb-4 border border-yellow-200">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Allocation %</label>
                <div className="flex gap-2 items-center">
                  <input 
                    type="number" 
                    min="0" 
                    max="100" 
                    value={editingAllocation ? tempAllocationPercentages.alternatives : allocationPercentages.alternatives}
                    onChange={(e) => {
                      if (editingAllocation) {
                        const val = Math.max(0, Math.min(100, Number(e.target.value)));
                        setTempAllocationPercentages({...tempAllocationPercentages, alternatives: val});
                      }
                    }}
                    disabled={!editingAllocation}
                    className="flex-1 px-3 py-2 border-2 border-yellow-400 rounded text-2xl font-bold text-center disabled:bg-gray-100"
                  />
                  <span className="text-2xl font-bold text-yellow-600">%</span>
                </div>
              </div>

              {/* Should Invest Amount */}
              <div className="bg-yellow-100 rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-1">Should invest</p>
                <p className="text-3xl font-bold text-yellow-600">
                  RM {((funds[0]?.target_value || 0) * (editingAllocation ? tempAllocationPercentages.alternatives : allocationPercentages.alternatives) / 100).toLocaleString('en-MY', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </p>
              </div>
            </div>
          </div>

          {/* Edit/Save Button */}
          <button
            onClick={async () => {
              if (!editingAllocation) {
                setTempAllocationPercentages(allocationPercentages);
                setEditingAllocation(true);
              } else {
                // Save changes
                setAllocationPercentages(tempAllocationPercentages);
                setEditingAllocation(false);
                alert('Allocation updated');
              }
            }}
            className={`w-full px-6 py-4 rounded-lg font-bold text-white transition text-lg ${
              editingAllocation
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {editingAllocation ? '✓ Save Changes' : 'Edit Allocation'}
          </button>
        </div>
      )}

      {/* Main Admin Dashboard View */}
      {activeAdminView === 'dashboard' && (
      <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold">Admin Panel</h2>
        <span className="bg-red-500 text-white px-4 py-1 rounded-full text-sm font-semibold animate-pulse">ADMIN MODE</span>
      </div>

      {/* Fund Management Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-4">Fund Management</h3>
        
        {/* Add New Fund Form */}
        <div className="border p-4 rounded space-y-2 mb-6 bg-blue-50">
          <h5 className="font-medium text-blue-900">Add New Fund</h5>
          <input 
            className="w-full px-3 py-2 border rounded text-sm" 
            placeholder="Fund Name" 
            value={newFundName} 
            onChange={(e)=>setNewFundName(e.target.value)} 
          />
          <select 
            className="w-full px-3 py-2 border rounded text-sm"
            value={newFundType}
            onChange={(e)=>setNewFundType(e.target.value)}
          >
            <option value="Savings">Savings</option>
            <option value="Emergency">Emergency</option>
            <option value="Investment">Investment</option>
            <option value="Education">Education</option>
            <option value="Retirement">Retirement</option>
            <option value="Other">Other</option>
          </select>
          <input 
            className="w-full px-3 py-2 border rounded text-sm" 
            placeholder="Target Total Value (RM)" 
            type="number" 
            step="0.01"
            value={newFundTarget} 
            onChange={(e)=>setNewFundTarget(e.target.value)} 
          />
          <button 
            className="w-full px-3 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700"
            onClick={async () => {
              if (newFundName.trim() && newFundTarget && newFundTarget !== '') {
                try {
                  const response = await fetch('http://localhost:5000/api/funds', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      name: newFundName,
                      type: newFundType,
                      target_value: Number(newFundTarget),
                      current_value: 0,
                      description: ''
                    })
                  });
                  
                  if (response.ok) {
                    const newFund = await response.json();
                    setFunds([...funds, newFund]);
                    setNewFundName('');
                    setNewFundType('Savings');
                    setNewFundTarget('');
                    alert('Fund created successfully!');
                  } else {
                    const errorData = await response.json();
                    alert('Failed to create fund: ' + (errorData.error || 'Unknown error'));
                  }
                } catch (error) {
                  alert('Error creating fund: ' + error.message);
                }
              } else {
                alert('Please fill in all required fields: Fund Name and Target Value');
              }
            }}
          >
            + Add Fund
          </button>
        </div>

        {/* Edit/View Funds */}
        {editingFund ? (
          <div className="border p-4 rounded space-y-2 mb-4 bg-yellow-50">
            <h5 className="font-medium text-yellow-900">Edit Fund</h5>
            <input 
              className="w-full px-3 py-2 border rounded text-sm" 
              placeholder="Fund Name" 
              value={editFundName} 
              onChange={(e)=>setEditFundName(e.target.value)} 
            />
            <select 
              className="w-full px-3 py-2 border rounded text-sm"
              value={editFundType}
              onChange={(e)=>setEditFundType(e.target.value)}
            >
              <option value="Savings">Savings</option>
              <option value="Emergency">Emergency</option>
              <option value="Investment">Investment</option>
              <option value="Education">Education</option>
              <option value="Retirement">Retirement</option>
              <option value="Other">Other</option>
            </select>
            <input 
              className="w-full px-3 py-2 border rounded text-sm" 
              placeholder="Target Total Value (RM)" 
              type="number" 
              step="0.01"
              value={editFundTarget} 
              onChange={(e)=>setEditFundTarget(e.target.value)} 
            />
            <div className="flex gap-2">
              <button 
                className="flex-1 px-3 py-1 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700" 
                onClick={async () => {
                  if (editFundName.trim() && editFundTarget && editFundTarget !== '') {
                    try {
                      const response = await fetch(`http://localhost:5000/api/funds/${editingFund.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          name: editFundName,
                          type: editFundType,
                          target_value: Number(editFundTarget),
                          current_value: editingFund.current_value || 0,
                          description: editingFund.description || '',
                          status: editingFund.status || 'Active'
                        })
                      });
                      
                      if (response.ok) {
                        const updatedFund = await response.json();
                        setFunds(funds.map(f => f.id === editingFund.id ? updatedFund : f));
                        setEditingFund(null);
                        setEditFundName('');
                        setEditFundType('Savings');
                        setEditFundTarget('');
                        alert('Fund updated successfully!');
                      } else {
                        alert('Failed to update fund');
                      }
                    } catch (error) {
                      alert('Error updating fund: ' + error.message);
                    }
                  }
                }}
              >
                ✓ Save
              </button>
              <button 
                className="flex-1 px-3 py-1 bg-gray-400 text-white rounded text-sm font-medium hover:bg-gray-500" 
                onClick={() => {
                  setEditingFund(null);
                  setEditFundName('');
                  setEditFundType('Savings');
                  setEditFundTarget('');
                }}
              >
                ✕ Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {funds.length > 0 ? (
              funds.map((fund) => (
                <div key={fund.id} className="border p-3 rounded flex items-center justify-between bg-gray-50 hover:bg-gray-100">
                  <div>
                    <p className="font-medium">{fund.name}</p>
                    <p className="text-xs text-gray-600 mb-1">Type: <span className="font-semibold">{fund.type}</span></p>
                    <p className="text-sm text-gray-600">Target: RM {(fund.target_value || fund.targetValue).toLocaleString('en-MY', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                      onClick={() => {
                        setEditingFund(fund);
                        setEditFundName(fund.name);
                        setEditFundType(fund.type);
                        setEditFundTarget((fund.target_value || fund.targetValue).toString());
                      }}
                    >
                      Edit
                    </button>
                    <button 
                      className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                      onClick={async () => {
                        try {
                          const response = await fetch(`http://localhost:5000/api/funds/${fund.id}`, {
                            method: 'DELETE'
                          });
                          
                          if (response.ok) {
                            setFunds(funds.filter(f => f.id !== fund.id));
                            alert('Fund deleted successfully!');
                          } else {
                            alert('Failed to delete fund');
                          }
                        } catch (error) {
                          alert('Error deleting fund: ' + error.message);
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No funds created yet.</p>
            )}
          </div>
        )}
      </div>

      {/* Asset Allocation Strategy Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">🎯 Asset Allocation Strategy</h3>
          {funds.length > 0 && (
            <button
              onClick={() => {
                if (!editingAllocation) {
                  setTempAllocationPercentages(allocationPercentages);
                  setEditingAllocation(true);
                } else {
                  setEditingAllocation(false);
                }
              }}
              className={`px-3 py-1 rounded text-sm font-medium transition ${
                editingAllocation
                  ? 'bg-gray-400 text-white hover:bg-gray-500'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {editingAllocation ? 'Cancel' : 'Edit'}
            </button>
          )}
        </div>
        
        {funds.length > 0 ? (
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Total Investment Fund Target: <span className="font-bold text-blue-600">RM {(funds[0]?.target_value || 0).toLocaleString('en-MY', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </p>

            <div className="space-y-3">
              {/* Equities */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <p className="font-medium text-gray-800">📈 Equities (Stocks & Companies)</p>
                    <p className="text-xs text-gray-600 mt-1">Diversified stock portfolio</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    {editingAllocation ? (
                      <>
                        <input 
                          type="number" 
                          min="0" 
                          max="100" 
                          value={tempAllocationPercentages.equities}
                          onChange={(e) => {
                            const val = Math.max(0, Math.min(100, Number(e.target.value)));
                            setTempAllocationPercentages({...tempAllocationPercentages, equities: val});
                          }}
                          className="w-12 px-2 py-1 border-2 border-blue-400 rounded text-sm font-medium"
                        />
                        <span className="text-lg font-bold text-blue-600">%</span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-blue-600">{allocationPercentages.equities}%</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600">Should invest:</p>
                  <p className="text-2xl font-bold text-blue-600">
                    RM {((funds[0]?.target_value || 0) * (editingAllocation ? tempAllocationPercentages.equities : allocationPercentages.equities) / 100).toLocaleString('en-MY', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </p>
                </div>
              </div>

              {/* Fixed Income */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <p className="font-medium text-gray-800">🏦 Fixed Income (Bonds & Interest)</p>
                    <p className="text-xs text-gray-600 mt-1">Stable income-generating assets</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    {editingAllocation ? (
                      <>
                        <input 
                          type="number" 
                          min="0" 
                          max="100" 
                          value={tempAllocationPercentages.fixedIncome}
                          onChange={(e) => {
                            const val = Math.max(0, Math.min(100, Number(e.target.value)));
                            setTempAllocationPercentages({...tempAllocationPercentages, fixedIncome: val});
                          }}
                          className="w-12 px-2 py-1 border-2 border-green-400 rounded text-sm font-medium"
                        />
                        <span className="text-lg font-bold text-green-600">%</span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-green-600">{allocationPercentages.fixedIncome}%</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600">Should invest:</p>
                  <p className="text-2xl font-bold text-green-600">
                    RM {((funds[0]?.target_value || 0) * (editingAllocation ? tempAllocationPercentages.fixedIncome : allocationPercentages.fixedIncome) / 100).toLocaleString('en-MY', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </p>
                </div>
              </div>

              {/* Alternatives */}
              <div 
                onClick={() => setActiveAdminView('allocation-detail')}
                className="bg-purple-50 p-4 rounded-lg border border-purple-200 cursor-pointer hover:shadow-md hover:bg-purple-100 transition"
              >
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <p className="font-medium text-gray-800">💎 Alternatives (Crypto, Gold, etc.)</p>
                    <p className="text-xs text-gray-600 mt-1">Click to manage</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    {editingAllocation ? (
                      <>
                        <input 
                          type="number" 
                          min="0" 
                          max="100" 
                          value={tempAllocationPercentages.alternatives}
                          onChange={(e) => {
                            const val = Math.max(0, Math.min(100, Number(e.target.value)));
                            setTempAllocationPercentages({...tempAllocationPercentages, alternatives: val});
                          }}
                          className="w-12 px-2 py-1 border-2 border-purple-400 rounded text-sm font-medium"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="text-lg font-bold text-purple-600">%</span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-purple-600">{allocationPercentages.alternatives}%</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600">Should invest:</p>
                  <p className="text-2xl font-bold text-purple-600">
                    RM {((funds[0]?.target_value || 0) * (editingAllocation ? tempAllocationPercentages.alternatives : allocationPercentages.alternatives) / 100).toLocaleString('en-MY', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </p>
                </div>
              </div>

              {/* Cash & Cash Equivalent */}
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <p className="font-medium text-gray-800">💰 Cash & Cash Equivalent</p>
                    <p className="text-xs text-gray-600 mt-1">Liquid emergency reserves</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    {editingAllocation ? (
                      <>
                        <input 
                          type="number" 
                          min="0" 
                          max="100" 
                          value={tempAllocationPercentages.cash}
                          onChange={(e) => {
                            const val = Math.max(0, Math.min(100, Number(e.target.value)));
                            setTempAllocationPercentages({...tempAllocationPercentages, cash: val});
                          }}
                          className="w-12 px-2 py-1 border-2 border-amber-400 rounded text-sm font-medium"
                        />
                        <span className="text-lg font-bold text-amber-600">%</span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-amber-600">{allocationPercentages.cash}%</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600">Should invest:</p>
                  <p className="text-2xl font-bold text-amber-600">
                    RM {((funds[0]?.target_value || 0) * (editingAllocation ? tempAllocationPercentages.cash : allocationPercentages.cash) / 100).toLocaleString('en-MY', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </p>
                </div>
              </div>

              {/* Allocation Summary Chart - Donut */}
              <div className="border-t pt-4 mt-4">
                <p className="text-xs font-semibold text-gray-600 mb-4">Allocation Overview:</p>
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <svg width="280" height="280" viewBox="0 0 280 280" className="drop-shadow-lg">
                      {/* Equities (Blue) */}
                      <circle
                        cx="140"
                        cy="140"
                        r="90"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="35"
                        strokeDasharray={`${(editingAllocation ? tempAllocationPercentages.equities : allocationPercentages.equities) / 100 * 565.5} 565.5`}
                        strokeDashoffset="0"
                        transform="rotate(-90 140 140)"
                        onMouseEnter={() => setHoveredSegment('equities')}
                        onMouseLeave={() => setHoveredSegment(null)}
                        className="cursor-pointer hover:opacity-80 transition"
                        style={{ opacity: hoveredSegment === null || hoveredSegment === 'equities' ? 1 : 0.4 }}
                      />
                      {/* Fixed Income (Green) */}
                      <circle
                        cx="140"
                        cy="140"
                        r="90"
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="35"
                        strokeDasharray={`${(editingAllocation ? tempAllocationPercentages.fixedIncome : allocationPercentages.fixedIncome) / 100 * 565.5} 565.5`}
                        strokeDashoffset={-((editingAllocation ? tempAllocationPercentages.equities : allocationPercentages.equities) / 100 * 565.5)}
                        transform="rotate(-90 140 140)"
                        onMouseEnter={() => setHoveredSegment('fixedIncome')}
                        onMouseLeave={() => setHoveredSegment(null)}
                        className="cursor-pointer hover:opacity-80 transition"
                        style={{ opacity: hoveredSegment === null || hoveredSegment === 'fixedIncome' ? 1 : 0.4 }}
                      />
                      {/* Alternatives (Purple) */}
                      <circle
                        cx="140"
                        cy="140"
                        r="90"
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth="35"
                        strokeDasharray={`${(editingAllocation ? tempAllocationPercentages.alternatives : allocationPercentages.alternatives) / 100 * 565.5} 565.5`}
                        strokeDashoffset={-((editingAllocation ? tempAllocationPercentages.equities + tempAllocationPercentages.fixedIncome : allocationPercentages.equities + allocationPercentages.fixedIncome) / 100 * 565.5)}
                        transform="rotate(-90 140 140)"
                        onMouseEnter={() => setHoveredSegment('alternatives')}
                        onMouseLeave={() => setHoveredSegment(null)}
                        className="cursor-pointer hover:opacity-80 transition"
                        style={{ opacity: hoveredSegment === null || hoveredSegment === 'alternatives' ? 1 : 0.4 }}
                      />
                      {/* Cash (Amber) */}
                      <circle
                        cx="140"
                        cy="140"
                        r="90"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="35"
                        strokeDasharray={`${(editingAllocation ? tempAllocationPercentages.cash : allocationPercentages.cash) / 100 * 565.5} 565.5`}
                        strokeDashoffset={-((editingAllocation ? tempAllocationPercentages.equities + tempAllocationPercentages.fixedIncome + tempAllocationPercentages.alternatives : allocationPercentages.equities + allocationPercentages.fixedIncome + allocationPercentages.alternatives) / 100 * 565.5)}
                        transform="rotate(-90 140 140)"
                        onMouseEnter={() => setHoveredSegment('cash')}
                        onMouseLeave={() => setHoveredSegment(null)}
                        className="cursor-pointer hover:opacity-80 transition"
                        style={{ opacity: hoveredSegment === null || hoveredSegment === 'cash' ? 1 : 0.4 }}
                      />
                      {/* Center circle */}
                      <circle cx="140" cy="140" r="55" fill="white" />
                      <text x="140" y="150" textAnchor="middle" className="text-2xl font-bold" fill="#374151" fontFamily="Arial, sans-serif">
                        {editingAllocation ? tempAllocationPercentages.equities + tempAllocationPercentages.fixedIncome + tempAllocationPercentages.alternatives + tempAllocationPercentages.cash : allocationPercentages.equities + allocationPercentages.fixedIncome + allocationPercentages.alternatives + allocationPercentages.cash}%
                      </text>
                    </svg>
                    
                    {/* Hover Tooltip */}
                    {hoveredSegment && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-gray-900 text-white px-4 py-3 rounded-lg text-center shadow-lg">
                          {hoveredSegment === 'equities' && (
                            <div>
                              <p className="font-semibold text-lg">Equities</p>
                              <p className="text-xl font-bold text-blue-400">{editingAllocation ? tempAllocationPercentages.equities : allocationPercentages.equities}%</p>
                            </div>
                          )}
                          {hoveredSegment === 'fixedIncome' && (
                            <div>
                              <p className="font-semibold text-lg">Fixed Income</p>
                              <p className="text-xl font-bold text-green-400">{editingAllocation ? tempAllocationPercentages.fixedIncome : allocationPercentages.fixedIncome}%</p>
                            </div>
                          )}
                          {hoveredSegment === 'alternatives' && (
                            <div>
                              <p className="font-semibold text-lg">Alternatives</p>
                              <p className="text-xl font-bold text-purple-400">{editingAllocation ? tempAllocationPercentages.alternatives : allocationPercentages.alternatives}%</p>
                            </div>
                          )}
                          {hoveredSegment === 'cash' && (
                            <div>
                              <p className="font-semibold text-lg">Cash</p>
                              <p className="text-xl font-bold text-amber-400">{editingAllocation ? tempAllocationPercentages.cash : allocationPercentages.cash}%</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-4 mt-4 text-xs flex-wrap justify-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span>Equities ({editingAllocation ? tempAllocationPercentages.equities : allocationPercentages.equities}%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Fixed Income ({editingAllocation ? tempAllocationPercentages.fixedIncome : allocationPercentages.fixedIncome}%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded"></div>
                    <span>Alternatives ({editingAllocation ? tempAllocationPercentages.alternatives : allocationPercentages.alternatives}%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-amber-500 rounded"></div>
                    <span>Cash ({editingAllocation ? tempAllocationPercentages.cash : allocationPercentages.cash}%)</span>
                  </div>
                </div>
                <div className="text-right mt-4 pt-4 border-t">
                  <p className="text-xs text-gray-600">Total Allocation:</p>
                  <p className={`text-lg font-bold ${(editingAllocation ? tempAllocationPercentages.equities + tempAllocationPercentages.fixedIncome + tempAllocationPercentages.alternatives + tempAllocationPercentages.cash : allocationPercentages.equities + allocationPercentages.fixedIncome + allocationPercentages.alternatives + allocationPercentages.cash) === 100 ? 'text-green-600' : 'text-orange-600'}`}>
                    {editingAllocation ? tempAllocationPercentages.equities + tempAllocationPercentages.fixedIncome + tempAllocationPercentages.alternatives + tempAllocationPercentages.cash : allocationPercentages.equities + allocationPercentages.fixedIncome + allocationPercentages.alternatives + allocationPercentages.cash}%
                  </p>
                </div>
              </div>

              {/* Save Button */}
              {editingAllocation && (
                <div className="flex gap-2 pt-4 border-t">
                  <button
                    onClick={async () => {
                      if (tempAllocationPercentages.equities + tempAllocationPercentages.fixedIncome + tempAllocationPercentages.alternatives + tempAllocationPercentages.cash === 100) {
                        try {
                          await updateAllocationSettings(
                            tempAllocationPercentages.equities,
                            tempAllocationPercentages.fixedIncome,
                            tempAllocationPercentages.alternatives,
                            tempAllocationPercentages.cash
                          );
                          setAllocationPercentages(tempAllocationPercentages);
                          setEditingAllocation(false);
                          alert('Allocation percentages saved successfully!');
                        } catch (error) {
                          alert('Failed to save allocation settings: ' + error.message);
                        }
                      } else {
                        alert('Total allocation must equal 100%');
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700 transition"
                  >
                    ✓ Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingAllocation(false);
                      setTempAllocationPercentages(allocationPercentages);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-400 text-white rounded font-medium hover:bg-gray-500 transition"
                  >
                    ✕ Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">Add a Fund in Fund Management to see allocation strategy</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-4">Add Company</h3>
        <form onSubmit={addCompany} className="space-y-2 grid grid-cols-2 gap-2">
          <input className="w-full px-3 py-2 border rounded col-span-1" placeholder="Company Name" value={cName} onChange={(e)=>setCName(e.target.value)} />
          <input className="w-full px-3 py-2 border rounded col-span-1" placeholder="Value" type="number" value={cValue} onChange={(e)=>setCValue(e.target.value)} />
          <input className="w-full px-3 py-2 border rounded col-span-1" placeholder="Sector" value={cSector} onChange={(e)=>setCSector(e.target.value)} />
          <input className="w-full px-3 py-2 border rounded col-span-1" placeholder="Ownership" value={cOwnership} onChange={(e)=>setCOwnership(e.target.value)} />
          <select className="w-full px-3 py-2 border rounded col-span-1" value={cType} onChange={(e)=>setCType(e.target.value)}>
            <option value="Index Funds & ETF">Index Funds & ETF</option>
            <option value="Dividend Stocks">Dividend Stocks</option>
            <option value="7 Value Magnificent">7 Value Magnificent</option>
            <option value="Growth Stocks">Growth Stocks</option>
          </select>
          <input className="w-full px-3 py-2 border rounded col-span-1" placeholder="Country" value={cCountry} onChange={(e)=>setCCountry(e.target.value)} />
          <button className="px-4 py-2 bg-purple-600 text-white rounded col-span-2">Add Company</button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="font-semibold mb-4">Recent Companies</h4>
        {editingCompany ? (
          <div className="border p-4 rounded space-y-3">
            <h5 className="font-medium text-lg mb-4">Edit Company</h5>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Company Name</label>
              <input className="w-full px-3 py-2 border rounded text-sm" placeholder="e.g., Apple Inc." value={editName} onChange={(e)=>setEditName(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Market Value (RM) - Latest Month</label>
              <input 
                className="w-full px-3 py-2 border rounded text-sm bg-gray-100 cursor-not-allowed" 
                type="number" 
                value={editValue} 
                readOnly 
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">This value is automatically updated from the latest monthly value. Edit it in "Edit Monthly Values" section.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Sector</label>
              <input className="w-full px-3 py-2 border rounded text-sm" placeholder="e.g., Technology, Finance" value={editSector} onChange={(e)=>setEditSector(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Ownership %</label>
              <input className="w-full px-3 py-2 border rounded text-sm" placeholder="e.g., 5.2" value={editOwnership} onChange={(e)=>setEditOwnership(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Investment Type</label>
              <select className="w-full px-3 py-2 border rounded text-sm" value={editType} onChange={(e)=>setEditType(e.target.value)}>
                <option value="Index Funds & ETF">Index Funds & ETF</option>
                <option value="Dividend Stocks">Dividend Stocks</option>
                <option value="7 Value Magnificent">7 Value Magnificent</option>
                <option value="Growth Stocks">Growth Stocks</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Country</label>
              <input className="w-full px-3 py-2 border rounded text-sm" placeholder="e.g., United States" value={editCountry} onChange={(e)=>setEditCountry(e.target.value)} />
            </div>

            <div className="flex gap-2 pt-2">
              <button className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-sm font-semibold hover:bg-green-700" onClick={saveEdit}>Save</button>
              <button className="flex-1 px-3 py-2 bg-gray-400 text-white rounded text-sm font-semibold hover:bg-gray-500" onClick={cancelEdit}>Cancel</button>
            </div>
          </div>
        ) : (
          <ul className="space-y-2 text-sm">
            {equitiesCompanies.map((c, i) => (
              <li key={i} className="border p-2 rounded flex items-center justify-between">
                <div>
                  <span>{c.name} — {c.sector} — {c.country}</span>
                  <p className="text-xs text-gray-500 mt-1">{c.type || 'Index Funds & ETF'}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
                    onClick={() => startEdit(c)}
                  >
                    Edit
                  </button>
                  <button
                    className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                    onClick={() => deleteCompany(c)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-4">Add Fixed Income Bond</h3>
        <form onSubmit={addBond} className="space-y-2 grid grid-cols-2 gap-2">
          <input className="w-full px-3 py-2 border rounded col-span-1" placeholder="Bond Name" value={bName} onChange={(e)=>setBName(e.target.value)} />
          <input className="w-full px-3 py-2 border rounded col-span-1" placeholder="Value (RM)" type="number" step="0.01" value={bValue} onChange={(e)=>setBValue(e.target.value)} />
          <select className="w-full px-3 py-2 border rounded col-span-1" value={bType} onChange={(e)=>setBType(e.target.value)}>
            <option>Government</option>
            <option>Corporate</option>
            <option>Municipal</option>
            <option>International</option>
          </select>
          <select className="w-full px-3 py-2 border rounded col-span-1" value={bRating} onChange={(e)=>setBRating(e.target.value)}>
            <option>AAA</option>
            <option>AA</option>
            <option>A</option>
            <option>BBB</option>
            <option>BB</option>
            <option>B</option>
          </select>
          <input className="w-full px-3 py-2 border rounded col-span-1" placeholder="Maturity Date" type="date" value={bMaturity} onChange={(e)=>setBMaturity(e.target.value)} />
          <input className="w-full px-3 py-2 border rounded col-span-1" placeholder="Country" value={bCountry} onChange={(e)=>setBCountry(e.target.value)} />
          <button className="px-4 py-2 bg-blue-600 text-white rounded col-span-2">Add Bond</button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="font-semibold mb-4">Fixed Income Bonds</h4>
        {editingBond ? (
          <div className="border p-4 rounded space-y-2">
            <h5 className="font-medium">Edit Bond</h5>
            <input className="w-full px-3 py-2 border rounded text-sm" placeholder="Name" value={editBName} onChange={(e)=>setEditBName(e.target.value)} />
            <input className="w-full px-3 py-2 border rounded text-sm" placeholder="Value (RM)" type="number" step="0.01" value={editBValue} onChange={(e)=>setEditBValue(e.target.value)} />
            <select className="w-full px-3 py-2 border rounded text-sm" value={editBType} onChange={(e)=>setEditBType(e.target.value)}>
              <option>Government</option>
              <option>Corporate</option>
              <option>Municipal</option>
              <option>International</option>
            </select>
            <select className="w-full px-3 py-2 border rounded text-sm" value={editBRating} onChange={(e)=>setEditBRating(e.target.value)}>
              <option>AAA</option>
              <option>AA</option>
              <option>A</option>
              <option>BBB</option>
              <option>BB</option>
              <option>B</option>
            </select>
            <input className="w-full px-3 py-2 border rounded text-sm" placeholder="Maturity Date" type="date" value={editBMaturity} onChange={(e)=>setEditBMaturity(e.target.value)} />
            <input className="w-full px-3 py-2 border rounded text-sm" placeholder="Country" value={editBCountry} onChange={(e)=>setEditBCountry(e.target.value)} />
            <div className="flex gap-2">
              <button className="flex-1 px-3 py-1 bg-green-600 text-white rounded text-sm" onClick={saveBondEdit}>Save</button>
              <button className="flex-1 px-3 py-1 bg-gray-400 text-white rounded text-sm" onClick={cancelEditBond}>Cancel</button>
            </div>
          </div>
        ) : (
          <ul className="space-y-2 text-sm">
            {fixedIncomeBonds.map((b, i) => (
              <li key={i} className="border p-2 rounded flex items-center justify-between">
                <span>{b.name} — {b.bond_type} ({b.rating}) — {b.country}</span>
                <div className="flex gap-1">
                  <button
                    className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
                    onClick={() => startEditBond(b)}
                  >
                    Edit
                  </button>
                  <button
                    className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                    onClick={() => deleteBond(b)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-4">Edit Monthly Values</h3>
        {selectedAssetForEdit && (equitiesCompanies.find(c => c.name === selectedAssetForEdit) || fixedIncomeBonds.find(b => b.name === selectedAssetForEdit)) ? (
          <div className="space-y-3">
            <h4 className="font-medium">Edit {selectedAssetForEdit} (Equities)</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].map((month) => (
                <div key={month}>
                  <label className="text-xs text-gray-600 capitalize">{month}</label>
                  <input
                    className="w-full px-2 py-1 border rounded text-sm"
                    type="text"
                    placeholder="Enter value (e.g., 1,514.87 or 1514.87)"
                    value={monthlyValues[month] !== undefined && monthlyValues[month] !== null ? (monthlyValues[month] * 3.7).toFixed(2) : ''}
                    onChange={(e) => {
                      const input = e.target.value;
                      // Remove commas and parse
                      const cleanValue = input.replace(/,/g, '');
                      const rmValue = cleanValue === '' ? undefined : (parseFloat(cleanValue) || 0);
                      setMonthlyValues((prev) => ({ ...prev, [month]: rmValue !== undefined ? rmValue / 3.7 : undefined }));
                    }}
                  />
                </div>
              ))}
              <div className="md:col-span-2">
                <label className="text-xs text-gray-600">Incorporated In</label>
                <input
                  className="w-full px-2 py-1 border rounded text-sm"
                  value={monthlyValues.incorporated || ''}
                  onChange={(e) => setMonthlyValues((prev) => ({ ...prev, incorporated: e.target.value }))}
                  placeholder="e.g., Luxembourg"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded"
                onClick={saveMonthlyValues}
              >
                Save
              </button>
              <button
                className="flex-1 px-4 py-2 bg-gray-400 text-white rounded"
                onClick={() => setSelectedAssetForEdit(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}
        {selectedAssetForEdit && (fixedIncomeBonds.find(b => b.name === selectedAssetForEdit) || alternativeInvestments.find(a => a.name === selectedAssetForEdit)) ? (
          <div className="space-y-3">
            <h4 className="font-medium">Edit {selectedAssetForEdit} (Fixed Income)</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].map((month) => (
                <div key={month}>
                  <label className="text-xs text-gray-600 capitalize">{month}</label>
                  <input
                    className="w-full px-2 py-1 border rounded text-sm"
                    type="text"
                    placeholder="Enter value (e.g., 1,514.87 or 1514.87)"
                    value={monthlyValues[month] !== undefined && monthlyValues[month] !== null ? (monthlyValues[month] * 3.7).toFixed(2) : ''}
                    onChange={(e) => {
                      const input = e.target.value;
                      // Remove commas and parse
                      const cleanValue = input.replace(/,/g, '');
                      const rmValue = cleanValue === '' ? undefined : (parseFloat(cleanValue) || 0);
                      setMonthlyValues((prev) => ({ ...prev, [month]: rmValue !== undefined ? rmValue / 3.7 : undefined }));
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 items-center">
              <div className="flex-1 px-4 py-2 bg-green-100 text-green-700 rounded text-sm text-center">
                ✓ Auto-saving...
              </div>
              <button
                className="flex-1 px-4 py-2 bg-gray-400 text-white rounded"
                onClick={() => setSelectedAssetForEdit(null)}
              >
                Done
              </button>
            </div>
          </div>
        ) : null}
        {!selectedAssetForEdit && (
          <div className="space-y-2">
            <h4 className="font-medium mb-3">Equities</h4>
            {equitiesCompanies.map((asset, idx) => (
              <button
                key={idx}
                className="w-full text-left p-3 border rounded hover:bg-gray-50 flex justify-between items-center"
                onClick={() => startEditMonthly(asset.name)}
              >
                <span>{asset.name}</span>
                <span className="px-2 py-1 bg-blue-500 text-white rounded text-xs">Edit Monthly</span>
              </button>
            ))}
            <h4 className="font-medium mt-4 mb-3">Fixed Income</h4>
            {fixedIncomeBonds.map((asset, idx) => (
              <button
                key={idx}
                className="w-full text-left p-3 border rounded hover:bg-gray-50 flex justify-between items-center"
                onClick={() => {
                  setSelectedAssetForEdit(asset.name);
                  setMonthlyValues(fixedIncomeMonthlyData[asset.name] || {});
                }}
              >
                <span>{asset.name}</span>
                <span className="px-2 py-1 bg-green-600 text-white rounded text-xs">Edit Monthly</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bond Monthly Dividends Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-4">Bond Monthly Dividends</h3>
        {selectedBondForDividendEdit ? (
          <div className="space-y-4">
            <h4 className="font-medium">Edit Monthly Dividends - {selectedBondForDividendEdit}</h4>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].map((month) => (
                <div key={month}>
                  <label className="text-xs text-gray-600 capitalize">{month}</label>
                  <input
                    className="w-full px-2 py-1 border rounded text-sm"
                    type="text"
                    placeholder="Enter value (e.g., 1,514.87 or 1514.87)"
                    value={monthlyDividends[month] !== undefined && monthlyDividends[month] !== null ? (monthlyDividends[month] * 3.7).toFixed(2) : ''}
                    onChange={(e) => {
                      const input = e.target.value;
                      const cleanValue = input.replace(/,/g, '');
                      const rmValue = cleanValue === '' ? undefined : (parseFloat(cleanValue) || 0);
                      setMonthlyDividends((prev) => ({ ...prev, [month]: rmValue !== undefined ? rmValue / 3.7 : undefined }));
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded"
                onClick={saveBondMonthlyDividends}
              >
                Save Dividends
              </button>
              <button
                className="flex-1 px-4 py-2 bg-gray-400 text-white rounded"
                onClick={() => {
                  setSelectedBondForDividendEdit(null);
                  setMonthlyDividends({});
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-gray-600 mb-3">Select a bond to add monthly dividend tracking:</p>
            {fixedIncomeBonds.map((bond, idx) => (
              <button
                key={idx}
                className="w-full text-left p-3 border rounded hover:bg-orange-50 flex justify-between items-center"
                onClick={() => startEditBondDividends(bond.name, {})}
              >
                <span>{bond.name}</span>
                <span className="px-2 py-1 bg-orange-500 text-white rounded text-xs">Add Dividends</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bond Monthly Values Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-4">Bond Monthly Values</h3>
        {selectedBondForValueEdit ? (
          <div className="space-y-4">
            <h4 className="font-medium">Edit Monthly Bond Values - {selectedBondForValueEdit}</h4>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].map((month) => (
                <div key={month}>
                  <label className="text-xs text-gray-600 capitalize">{month}</label>
                  <input
                    className="w-full px-2 py-1 border rounded text-sm"
                    type="text"
                    placeholder="Enter value (e.g., 1,514.87 or 1514.87)"
                    value={monthlyBondValues[month] !== undefined && monthlyBondValues[month] !== null ? (monthlyBondValues[month] * 3.7).toFixed(2) : ''}
                    onChange={(e) => {
                      const input = e.target.value;
                      const cleanValue = input.replace(/,/g, '');
                      const rmValue = cleanValue === '' ? undefined : (parseFloat(cleanValue) || 0);
                      setMonthlyBondValues((prev) => ({ ...prev, [month]: rmValue !== undefined ? rmValue / 3.7 : undefined }));
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded"
                onClick={saveBondMonthlyValues}
              >
                Save Values
              </button>
              <button
                className="flex-1 px-4 py-2 bg-gray-400 text-white rounded"
                onClick={() => {
                  setSelectedBondForValueEdit(null);
                  setMonthlyBondValues({});
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-gray-600 mb-3">Track bond market value changes each month:</p>
            {fixedIncomeBonds.map((bond, idx) => (
              <button
                key={idx}
                className="w-full text-left p-3 border rounded hover:bg-indigo-50 flex justify-between items-center"
                onClick={() => startEditBondValues(bond.name, {})}
              >
                <span>{bond.name}</span>
                <span className="px-2 py-1 bg-indigo-500 text-white rounded text-xs">Add Monthly Values</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Savings Records Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-4">Add Savings Record</h3>
        <div className="space-y-2 grid grid-cols-4 gap-2">
          <select 
            value={recordType}
            onChange={(e) => setRecordType(e.target.value)}
            className="w-full px-3 py-2 border rounded col-span-1 bg-white"
          >
            <option value="in">Cash In</option>
            <option value="out">Cash Out</option>
          </select>
          <input 
            type="number" 
            step="0.01"
            placeholder="Amount (RM)" 
            value={recordAmount}
            onChange={(e) => setRecordAmount(e.target.value)}
            className="w-full px-3 py-2 border rounded col-span-1" 
          />
          <input 
            type="date" 
            value={recordDate}
            onChange={(e) => setRecordDate(e.target.value)}
            className="w-full px-3 py-2 border rounded col-span-1" 
          />
          <input 
            type="text" 
            placeholder="Notes" 
            value={recordNotes}
            onChange={(e) => setRecordNotes(e.target.value)}
            className="w-full px-3 py-2 border rounded col-span-1" 
          />
          <button 
            onClick={handleAddRecord}
            className="px-4 py-2 bg-blue-600 text-white rounded col-span-4"
          >
            Add Record
          </button>
        </div>

        <h4 className="font-semibold mt-6 mb-3">Recent Savings Records</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-2 px-3">Date</th>
                <th className="text-left py-2 px-3">Type</th>
                <th className="text-right py-2 px-3">Amount (RM)</th>
                <th className="text-left py-2 px-3">Notes</th>
                <th className="text-center py-2 px-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {savingsRecords && savingsRecords.length > 0 ? (
                savingsRecords.map((record) => (
                  <tr key={record.id} className="border-t hover:bg-gray-50">
                    <td className="py-2 px-3">{record.record_date}</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${record.amount >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {record.amount >= 0 ? 'Cash In' : 'Cash Out'}
                      </span>
                    </td>
                    <td className={`py-2 px-3 text-right font-medium ${record.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {record.amount.toLocaleString('en-MY', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </td>
                    <td className="py-2 px-3">{record.notes || '-'}</td>
                    <td className="py-2 px-3 text-center">
                      <button 
                        onClick={() => handleDeleteRecord(record.id)}
                        className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-4 px-3 text-center text-gray-500">No savings records</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Savings Goals Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-4">Add Savings Goal</h3>
        <div className="space-y-2 grid grid-cols-2 gap-2">
          <input 
            type="text" 
            placeholder="Goal Name" 
            value={goalName}
            onChange={(e) => setGoalName(e.target.value)}
            className="w-full px-3 py-2 border rounded col-span-1" 
          />
          <input 
            type="number" 
            step="0.01"
            placeholder="Target Amount (RM)" 
            value={goalAmount}
            onChange={(e) => setGoalAmount(e.target.value)}
            className="w-full px-3 py-2 border rounded col-span-1" 
          />
          <input 
            type="date" 
            value={goalDate}
            onChange={(e) => setGoalDate(e.target.value)}
            className="w-full px-3 py-2 border rounded col-span-2" 
          />
          <input 
            type="text" 
            placeholder="Description" 
            value={goalDescription}
            onChange={(e) => setGoalDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded col-span-2" 
          />
          <button 
            onClick={handleAddGoal}
            className="px-4 py-2 bg-green-600 text-white rounded col-span-2"
          >
            Add Goal
          </button>
        </div>

        <h4 className="font-semibold mt-6 mb-3">Savings Goals</h4>
        {editingGoal ? (
          <div className="border p-4 rounded space-y-3 mb-4 bg-blue-50">
            <h5 className="font-medium">Edit Goal</h5>
            <input 
              type="text" 
              placeholder="Goal Name" 
              value={editGoalName}
              onChange={(e) => setEditGoalName(e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm" 
            />
            <input 
              type="number" 
              step="0.01"
              placeholder="Target Amount (RM)" 
              value={editGoalAmount}
              onChange={(e) => setEditGoalAmount(e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm" 
            />
            <input 
              type="date" 
              value={editGoalDate}
              onChange={(e) => setEditGoalDate(e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm" 
            />
            <input 
              type="text" 
              placeholder="Description" 
              value={editGoalDescription}
              onChange={(e) => setEditGoalDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm" 
            />
            <div className="flex gap-2">
              <button 
                onClick={saveEditGoal}
                className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                Save
              </button>
              <button 
                onClick={cancelEditGoal}
                className="flex-1 px-3 py-2 bg-gray-400 text-white rounded text-sm hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {savingsGoals && savingsGoals.length > 0 ? (
            savingsGoals.map((goal) => (
              <div key={goal.id} className="p-3 border rounded hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="font-medium">{goal.goal_name}</p>
                    <p className="text-xs text-gray-600">Target: RM {goal.target_amount.toLocaleString('en-MY', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                    {goal.target_date && <p className="text-xs text-gray-600">By: {goal.target_date}</p>}
                    {goal.description && <p className="text-xs text-gray-600 mt-1">{goal.description}</p>}
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button 
                      onClick={() => startEditGoal(goal)}
                      className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 py-4 text-center text-gray-500">No savings goals</div>
          )}
        </div>
      </div>

      {/* Database Backup Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-4">🛡️ Database Backup & Recovery</h3>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Automatically backup your data to prevent loss. Only stored locally on your computer.</p>
          
          <div className="flex gap-2">
            <button
              onClick={handleCreateBackup}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              💾 Create Backup Now
            </button>
            <button
              onClick={() => {
                setShowBackups(!showBackups);
                if (!showBackups) loadBackups();
              }}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              📋 View Backups ({backups.length})
            </button>
          </div>

          {showBackups && (
            <div className="bg-gray-50 rounded p-4 max-h-64 overflow-y-auto">
              {backups.length > 0 ? (
                <div className="space-y-2">
                  {backups.map((backup, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white p-3 rounded border">
                      <div className="text-sm">
                        <p className="font-medium">{backup.name}</p>
                        <p className="text-xs text-gray-500">{backup.date}</p>
                      </div>
                      <button
                        onClick={() => handleRestoreBackup(backup.name)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                      >
                        Restore
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">No backups available yet</p>
              )}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
            <p className="font-medium text-blue-900 mb-1">💡 Best Practices:</p>
            <ul className="text-blue-800 text-xs space-y-1 list-disc list-inside">
              <li>Create backups regularly (daily recommended)</li>
              <li>Keep last 10 backups automatically</li>
              <li>Backups are stored securely on your computer only</li>
              <li>No data is shared or uploaded anywhere</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Alternative Investments Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-4">Add Alternative Investment</h3>
        <div className="space-y-2 grid grid-cols-4 gap-2">
          <input 
            type="text" 
            placeholder="Asset Name (e.g., Bitcoin, Gold)" 
            value={altName}
            onChange={(e) => setAltName(e.target.value)}
            className="w-full px-3 py-2 border rounded col-span-1" 
          />
          <select 
            value={altType}
            onChange={(e) => setAltType(e.target.value)}
            className="w-full px-3 py-2 border rounded col-span-1 bg-white"
          >
            <option value="crypto">Cryptocurrency</option>
            <option value="gold">Gold</option>
            <option value="silver">Silver</option>
            <option value="real-estate">Real Estate</option>
            <option value="collectibles">Collectibles</option>
            <option value="other">Other</option>
          </select>
          <input 
            type="number" 
            step="0.01"
            placeholder="Current Value (RM)" 
            value={altValue}
            onChange={(e) => setAltValue(e.target.value)}
            className="w-full px-3 py-2 border rounded col-span-1" 
          />
          <input 
            type="text" 
            placeholder="Unit (e.g., coins, oz)" 
            value={altUnit}
            onChange={(e) => setAltUnit(e.target.value)}
            className="w-full px-3 py-2 border rounded col-span-1" 
          />
          <input 
            type="number" 
            step="0.01"
            placeholder="Quantity" 
            value={altQuantity}
            onChange={(e) => setAltQuantity(e.target.value)}
            className="w-full px-3 py-2 border rounded col-span-1" 
          />
          <input 
            type="text" 
            placeholder="Notes" 
            value={altNotes}
            onChange={(e) => setAltNotes(e.target.value)}
            className="w-full px-3 py-2 border rounded col-span-3" 
          />
          <button 
            onClick={handleAddAlternativeInvestment}
            className="px-4 py-2 bg-blue-600 text-white rounded col-span-4"
          >
            Add Investment
          </button>
        </div>

        <h4 className="font-semibold mt-6 mb-3">Alternative Investments</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-2 px-3">Asset Name</th>
                <th className="text-left py-2 px-3">Type</th>
                <th className="text-left py-2 px-3">Quantity</th>
                <th className="text-right py-2 px-3">Value (RM)</th>
                <th className="text-left py-2 px-3">Notes</th>
                <th className="text-center py-2 px-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {alternativeInvestments && alternativeInvestments.length > 0 ? (
                alternativeInvestments.map((inv) => (
                  <tr key={inv.id} className="border-t hover:bg-gray-50">
                    <td className="py-2 px-3">{inv.name}</td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium capitalize">
                        {inv.asset_type}
                      </span>
                    </td>
                    <td className="py-2 px-3">{inv.quantity ? `${inv.quantity} ${inv.unit}` : '-'}</td>
                    <td className="py-2 px-3 text-right font-medium">
                      {inv.current_value.toLocaleString('en-MY', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </td>
                    <td className="py-2 px-3 text-gray-600 text-xs">{inv.notes || '-'}</td>
                    <td className="py-2 px-3 text-center">
                      <button 
                        onClick={() => handleDeleteAlternativeInvestment(inv.id)}
                        className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-4 px-3 text-center text-gray-500">No alternative investments</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>
      )}
    </div>
  );
}
