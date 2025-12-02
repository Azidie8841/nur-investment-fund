import React, { useState } from 'react';

export default function AdminPanel({
  holdings,
  setHoldings,
  assetAllocation,
  setAssetAllocation,
  equitiesCompanies,
  setEquitiesCompanies,
  performanceData,
  setPerformanceData,
  marketSegments,
  setMarketSegments,
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
  const addHolding = (e) => {
    e.preventDefault();
    if (!hName || !hValue) return;
    const newHolding = {
      name: hName,
      type: hType,
      value: Number(hValue),
      allocation: hAllocation || '0%'
    };
    setHoldings((prev) => [newHolding, ...prev]);
    setHName(''); setHValue(''); setHAllocation(''); setHType('Equity');
  };

  const addAllocation = (e) => {
    e.preventDefault();
    if (!aName || !aValue) return;
    const newAlloc = { name: aName, value: Number(aValue), color: aColor };
    setAssetAllocation((prev) => [newAlloc, ...prev]);
    setAName(''); setAValue(''); setAColor('#3b82f6');
  };

  const addCompany = (e) => {
    e.preventDefault();
    if (!cName || !cValue) return;
    const newCompany = { name: cName, value: Number(cValue), sector: cSector, ownership: cOwnership, country: cCountry };
    setEquitiesCompanies((prev) => [newCompany, ...prev]);
    setCName(''); setCValue(''); setCSector(''); setCOwnership(''); setCCountry('');
  };

  const deleteCompany = (company) => {
    // confirm deletion
    if (!window.confirm(`Delete company "${company.name}"? This action cannot be undone.`)) return;
    setEquitiesCompanies((prev) => prev.filter((c) => c !== company));
  };

  const startEdit = (company) => {
    setEditingCompany(company);
    setEditName(company.name);
    setEditValue(company.value);
    setEditSector(company.sector);
    setEditOwnership(company.ownership);
    setEditCountry(company.country);
  };

  const saveEdit = () => {
    if (!editName || editValue === '') {
      alert('Name and Value are required');
      return;
    }
    setEquitiesCompanies((prev) =>
      prev.map((c) =>
        c === editingCompany
          ? { name: editName, value: Number(editValue), sector: editSector, ownership: editOwnership, country: editCountry }
          : c
      )
    );
    setEditingCompany(null);
  };

  const cancelEdit = () => {
    setEditingCompany(null);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Admin Panel</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-2">Add Holding</h3>
          <form onSubmit={addHolding} className="space-y-2">
            <input className="w-full px-3 py-2 border rounded" placeholder="Name" value={hName} onChange={(e)=>setHName(e.target.value)} />
            <input className="w-full px-3 py-2 border rounded" placeholder="Value" type="number" value={hValue} onChange={(e)=>setHValue(e.target.value)} />
            <input className="w-full px-3 py-2 border rounded" placeholder="Allocation (e.g. 5%)" value={hAllocation} onChange={(e)=>setHAllocation(e.target.value)} />
            <select className="w-full px-3 py-2 border rounded" value={hType} onChange={(e)=>setHType(e.target.value)}>
              <option>Equity</option>
              <option>Fixed Income</option>
              <option>Real Estate</option>
              <option>Cryptocurrencies</option>
              <option>Cash</option>
            </select>
            <button className="px-4 py-2 bg-blue-600 text-white rounded">Add Holding</button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-2">Add Asset Allocation</h3>
          <form onSubmit={addAllocation} className="space-y-2">
            <input className="w-full px-3 py-2 border rounded" placeholder="Name" value={aName} onChange={(e)=>setAName(e.target.value)} />
            <input className="w-full px-3 py-2 border rounded" placeholder="Value" type="number" value={aValue} onChange={(e)=>setAValue(e.target.value)} />
            <input className="w-full px-3 py-2 border rounded" placeholder="Color" value={aColor} onChange={(e)=>setAColor(e.target.value)} />
            <button className="px-4 py-2 bg-green-600 text-white rounded">Add Allocation</button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-2">Add Company</h3>
          <form onSubmit={addCompany} className="space-y-2">
            <input className="w-full px-3 py-2 border rounded" placeholder="Company Name" value={cName} onChange={(e)=>setCName(e.target.value)} />
            <input className="w-full px-3 py-2 border rounded" placeholder="Value" type="number" value={cValue} onChange={(e)=>setCValue(e.target.value)} />
            <input className="w-full px-3 py-2 border rounded" placeholder="Sector" value={cSector} onChange={(e)=>setCSector(e.target.value)} />
            <input className="w-full px-3 py-2 border rounded" placeholder="Ownership" value={cOwnership} onChange={(e)=>setCOwnership(e.target.value)} />
            <input className="w-full px-3 py-2 border rounded" placeholder="Country" value={cCountry} onChange={(e)=>setCCountry(e.target.value)} />
            <button className="px-4 py-2 bg-purple-600 text-white rounded">Add Company</button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h4 className="font-semibold mb-2">Recent Holdings</h4>
          <ul className="space-y-2 text-sm">
            {holdings.slice(0,6).map((h, i) => (
              <li key={i} className="border p-2 rounded">{h.name} — {h.type} — ${h.value.toLocaleString ? h.value.toLocaleString() : h.value} — {h.allocation}</li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h4 className="font-semibold mb-2">Asset Allocation</h4>
          <ul className="space-y-2 text-sm">
            {assetAllocation.slice(0,6).map((a, i) => (
              <li key={i} className="border p-2 rounded">{a.name} — {a.value.toLocaleString ? a.value.toLocaleString() : a.value}</li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h4 className="font-semibold mb-2">Recent Companies</h4>
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
              {equitiesCompanies.slice(0,6).map((c, i) => (
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
      </div>

      <div className="mt-4">
        <button
          className="px-4 py-2 bg-red-500 text-white rounded"
          onClick={() => {
            // clear Nur app keys and reload so initial values are restored
            try {
              ['nur:performanceData','nur:assetAllocation','nur:holdings','nur:globalMarketData','nur:equitiesData','nur:equitiesCompanies','nur:marketSegments'].forEach(k => localStorage.removeItem(k));
            } catch (e) {}
            window.location.reload();
          }}
        >
          Reset Stored Data
        </button>
      </div>
    </div>
  );
}
