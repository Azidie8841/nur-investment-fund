import React, { useState } from 'react';

export default function UserProfilePanel({ user, profiles, setProfiles }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'user' });

  const isAdmin = user.role === 'admin';
  const canEdit = (profile) => isAdmin || profile.id === user.id;

  const startEdit = (profile) => {
    setEditing(profile.id);
    setForm({ name: profile.name, email: profile.email, role: profile.role });
  };

  const saveEdit = (id) => {
    setProfiles((prev) => prev.map((p) =>
      p.id === id ? { ...p, ...form } : p
    ));
    setEditing(null);
  };

  const cancelEdit = () => setEditing(null);

  const deleteProfile = (id) => {
    if (!window.confirm('Delete this user?')) return;
    setProfiles((prev) => prev.filter((p) => p.id !== id));
  };

  const addProfile = () => {
    if (!form.name || !form.email) return;
    setProfiles((prev) => [
      ...prev,
      { id: Date.now(), ...form }
    ]);
    setForm({ name: '', email: '', role: 'user' });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">User Profiles</h2>
      {isAdmin && (
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h3 className="font-semibold mb-2">Add User</h3>
          <div className="flex gap-2 mb-2">
            <input className="px-2 py-1 border rounded flex-1" placeholder="Name" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} />
            <input className="px-2 py-1 border rounded flex-1" placeholder="Email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} />
            <select className="px-2 py-1 border rounded" value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={addProfile}>Add</button>
          </div>
        </div>
      )}
      <div className="bg-white rounded-lg shadow p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Name</th>
              <th className="text-left py-2">Email</th>
              <th className="text-left py-2">Role</th>
              <th className="text-right py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((profile) => (
              <tr key={profile.id} className="border-b">
                <td className="py-2">
                  {editing === profile.id ? (
                    <input className="px-2 py-1 border rounded" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} />
                  ) : profile.name}
                </td>
                <td className="py-2">
                  {editing === profile.id ? (
                    <input className="px-2 py-1 border rounded" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} />
                  ) : profile.email}
                </td>
                <td className="py-2">
                  {editing === profile.id ? (
                    <select className="px-2 py-1 border rounded" value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))}>
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : profile.role}
                </td>
                <td className="py-2 text-right">
                  {editing === profile.id ? (
                    <>
                      <button className="px-2 py-1 bg-green-600 text-white rounded mr-1" onClick={()=>saveEdit(profile.id)}>Save</button>
                      <button className="px-2 py-1 bg-gray-400 text-white rounded" onClick={cancelEdit}>Cancel</button>
                    </>
                  ) : canEdit(profile) && (
                    <>
                      <button className="px-2 py-1 bg-blue-600 text-white rounded mr-1" onClick={()=>startEdit(profile)}>Edit</button>
                      {isAdmin && (
                        <button className="px-2 py-1 bg-red-500 text-white rounded" onClick={()=>deleteProfile(profile.id)}>Delete</button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
