import React, { useState } from 'react';
import { addEquitiesCompany, updateEquitiesCompany, deleteEquitiesCompany, updateAssetMonthlyData } from '../utils/api';

export default function AdminPanel({
  equitiesCompanies,
  setEquitiesCompanies,
  assetMonthlyData,
  setAssetMonthlyData,
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
    </div>
  );
}
