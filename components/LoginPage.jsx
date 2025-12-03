import React, { useState } from 'react';

export default function LoginPage({ profiles, onLogin }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    const user = profiles.find((p) => p.email === email);
    if (user) {
      setError('');
      onLogin(user);
    } else {
      setError('User not found');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm" onSubmit={handleLogin}>
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <input
          className="w-full px-3 py-2 border rounded mb-4"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        {error && <div className="text-red-600 mb-2 text-sm">{error}</div>}
        <button
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold"
          type="submit"
        >
          Login
        </button>
      </form>
    </div>
  );
}
