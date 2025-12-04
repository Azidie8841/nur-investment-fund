import React, { useState } from 'react';
import { addEquitiesCompany, updateEquitiesCompany, deleteEquitiesCompany, addFixedIncomeBond, updateFixedIncomeBond, deleteFixedIncomeBond, updateAssetMonthlyData, addSavingsRecord, addSavingsGoal, updateSavingsGoal, deleteSavingsRecord, deleteSavingsGoal, fetchSavingsRecords, fetchSavingsGoals } from '../utils/api';

export default function AdminPanel({
  equitiesCompanies,
  setEquitiesCompanies,
  fixedIncomeBonds,
  setFixedIncomeBonds,
  assetMonthlyData,
  setAssetMonthlyData,
  savingsRecords,
  setSavingsRecords,
  savingsGoals,
  setSavingsGoals,
}) {
  // holdings form state
  const [hName, setHName] = useState('');
  const [hType, setHType] = useState('Equity');
  const [hValue, setHValue] = useState('');
  const [hAllocation, setHAllocation] = useState('');

  // asset allocation form
  const [aName, setAName] = useState('');
  const [aValue, setAValue] = useState('');
  const [aColor, setAColor] = useState('#3b82f6');

  // company form
  const [cName, setCName] = useState('');
  const [cValue, setCValue] = useState('');
  const [cSector, setCSector] = useState('');
  const [cOwnership, setCOwnership] = useState('');
  const [cCountry, setCCountry] = useState('');

  // edit mode state
  const [editingCompany, setEditingCompany] = useState(null);
  const [editName, setEditName] = useState('');
  const [editValue, setEditValue] = useState('');
  const [editSector, setEditSector] = useState('');
  const [editOwnership, setEditOwnership] = useState('');
  const [editCountry, setEditCountry] = useState('');

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
        country: cCountry 
      });
      setEquitiesCompanies((prev) => [newCompany, ...prev]);
      setCName(''); setCValue(''); setCSector(''); setCOwnership(''); setCCountry('');
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
    setEditValue(company.value);
    setEditSector(company.sector);
    setEditOwnership(company.ownership);
    setEditCountry(company.country);
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
        country: editCountry
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

  const startEditMonthly = (assetName) => {
    setSelectedAssetForEdit(assetName);
    setMonthlyValues(assetMonthlyData[assetName] || {});
  };

  const saveMonthlyValues = async () => {
    try {
      await updateAssetMonthlyData(selectedAssetForEdit, monthlyValues);
      setAssetMonthlyData((prev) => ({
        ...prev,
        [selectedAssetForEdit]: monthlyValues
      }));
      setSelectedAssetForEdit(null);
    } catch (error) {
      alert('Failed to save monthly values: ' + error.message);
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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Admin Panel</h2>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-4">Add Company</h3>
        <form onSubmit={addCompany} className="space-y-2 grid grid-cols-2 gap-2">
          <input className="w-full px-3 py-2 border rounded col-span-1" placeholder="Company Name" value={cName} onChange={(e)=>setCName(e.target.value)} />
          <input className="w-full px-3 py-2 border rounded col-span-1" placeholder="Value" type="number" value={cValue} onChange={(e)=>setCValue(e.target.value)} />
          <input className="w-full px-3 py-2 border rounded col-span-1" placeholder="Sector" value={cSector} onChange={(e)=>setCSector(e.target.value)} />
          <input className="w-full px-3 py-2 border rounded col-span-1" placeholder="Ownership" value={cOwnership} onChange={(e)=>setCOwnership(e.target.value)} />
          <input className="w-full px-3 py-2 border rounded col-span-2" placeholder="Country" value={cCountry} onChange={(e)=>setCCountry(e.target.value)} />
          <button className="px-4 py-2 bg-purple-600 text-white rounded col-span-2">Add Company</button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="font-semibold mb-4">Recent Companies</h4>
        {editingCompany ? (
          <div className="border p-4 rounded space-y-2">
            <h5 className="font-medium">Edit Company</h5>
            <input className="w-full px-3 py-2 border rounded text-sm" placeholder="Name" value={editName} onChange={(e)=>setEditName(e.target.value)} />
            <input className="w-full px-3 py-2 border rounded text-sm" placeholder="Value" type="number" value={editValue} onChange={(e)=>setEditValue(e.target.value)} />
            <input className="w-full px-3 py-2 border rounded text-sm" placeholder="Sector" value={editSector} onChange={(e)=>setEditSector(e.target.value)} />
            <input className="w-full px-3 py-2 border rounded text-sm" placeholder="Ownership" value={editOwnership} onChange={(e)=>setEditOwnership(e.target.value)} />
            <input className="w-full px-3 py-2 border rounded text-sm" placeholder="Country" value={editCountry} onChange={(e)=>setEditCountry(e.target.value)} />
            <div className="flex gap-2">
              <button className="flex-1 px-3 py-1 bg-green-600 text-white rounded text-sm" onClick={saveEdit}>Save</button>
              <button className="flex-1 px-3 py-1 bg-gray-400 text-white rounded text-sm" onClick={cancelEdit}>Cancel</button>
            </div>
          </div>
        ) : (
          <ul className="space-y-2 text-sm">
            {equitiesCompanies.map((c, i) => (
              <li key={i} className="border p-2 rounded flex items-center justify-between">
                <span>{c.name} — {c.sector} — {c.country}</span>
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
        <form onSubmit={(e) => {
          e.preventDefault();
          if (!bName || !bValue) return;
          addFixedIncomeBond({ 
            name: bName, 
            value: Number(bValue), 
            bond_type: bType,
            rating: bRating,
            maturity_date: bMaturity,
            country: bCountry
          }).then(newBond => {
            setFixedIncomeBonds((prev) => [newBond, ...prev]);
            setBName(''); setBValue(''); setBType('Government'); setBRating('AAA'); setBMaturity(''); setBCountry('');
          }).catch(error => alert('Failed to add bond: ' + error.message));
        }} className="space-y-2 grid grid-cols-2 gap-2">
          <input className="w-full px-3 py-2 border rounded col-span-1" placeholder="Bond Name" value={bName} onChange={(e)=>setBName(e.target.value)} />
          <input className="w-full px-3 py-2 border rounded col-span-1" placeholder="Value" type="number" value={bValue} onChange={(e)=>setBValue(e.target.value)} />
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
            <input className="w-full px-3 py-2 border rounded text-sm" placeholder="Value" type="number" value={editBValue} onChange={(e)=>setEditBValue(e.target.value)} />
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
              <button className="flex-1 px-3 py-1 bg-green-600 text-white rounded text-sm" onClick={() => {
                updateFixedIncomeBond(editingBond.id, {
                  name: editBName,
                  value: Number(editBValue),
                  bond_type: editBType,
                  rating: editBRating,
                  maturity_date: editBMaturity,
                  country: editBCountry
                }).then(updated => {
                  setFixedIncomeBonds(prev => prev.map(b => b.id === editingBond.id ? updated : b));
                  setEditingBond(null);
                }).catch(error => alert('Failed to update: ' + error.message));
              }}>Save</button>
              <button className="flex-1 px-3 py-1 bg-gray-400 text-white rounded text-sm" onClick={() => setEditingBond(null)}>Cancel</button>
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
                    onClick={() => {
                      setEditingBond(b);
                      setEditBName(b.name);
                      setEditBValue(b.value);
                      setEditBType(b.bond_type);
                      setEditBRating(b.rating);
                      setEditBMaturity(b.maturity_date || '');
                      setEditBCountry(b.country || '');
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                    onClick={() => {
                      deleteFixedIncomeBond(b.id).then(() => {
                        setFixedIncomeBonds(prev => prev.filter(x => x.id !== b.id));
                        alert('Bond deleted successfully');
                      }).catch(error => alert('Failed to delete: ' + error.message));
                    }}
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
        <h3 className="font-semibold mb-4">Edit Asset Monthly Values</h3>
        {selectedAssetForEdit ? (
          <div className="space-y-3">
            <h4 className="font-medium">Edit {selectedAssetForEdit}</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].map((month) => (
                <div key={month}>
                  <label className="text-xs text-gray-600 capitalize">{month}</label>
                  <input
                    className="w-full px-2 py-1 border rounded text-sm"
                    type="number"
                    step="0.01"
                    placeholder="Enter value in RM"
                    value={monthlyValues[month] ? (monthlyValues[month] * 3.7).toFixed(2) : ''}
                    onChange={(e) => {
                      const rmValue = parseFloat(e.target.value) || 0;
                      setMonthlyValues((prev) => ({ ...prev, [month]: rmValue / 3.7 }));
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
        ) : (
          <div className="space-y-2">
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
    </div>
  );
}
