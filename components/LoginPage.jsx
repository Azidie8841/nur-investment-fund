import React, { useState } from 'react';
import { Lock, User, Key } from 'lucide-react';

export default function LoginPage({ profiles, onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [seedPhrase, setSeedPhrase] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Valid seed phrases for voting access
  const validSeedPhrases = [
    'nur-investment-fund-2024',
    'voting-access-seed-phrase',
    'nur-family-governance'
  ];

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    // Validate username and password
    const user = profiles.find((p) => p.name.toLowerCase() === username.toLowerCase());
    
    if (!user) {
      setError('Username not found');
      return;
    }

    if (password !== user.id.toString()) {
      setError('Invalid password');
      return;
    }

    // Check seed phrase - required if user wants voting access
    if (seedPhrase && !validSeedPhrases.includes(seedPhrase.toLowerCase().trim())) {
      setError('Invalid seed phrase');
      return;
    }

    // Add seed phrase validation flag to user object
    const userWithAuth = {
      ...user,
      hasVotingAccess: validSeedPhrases.includes(seedPhrase.toLowerCase().trim())
    };

    onLogin(userWithAuth);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <form className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md" onSubmit={handleLogin}>
        <h2 className="text-3xl font-bold mb-2 text-center text-gray-800">Login</h2>
        <p className="text-center text-gray-600 mb-6">Nur Investment Fund Portal</p>

        {/* Username Field */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
          <div className="relative">
            <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>

        {/* Seed Phrase Field */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seed Phrase (Optional - Required for Voting Access)
          </label>
          <div className="relative">
            <Key className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              type="password"
              placeholder="Enter seed phrase for voting access"
              value={seedPhrase}
              onChange={e => setSeedPhrase(e.target.value)}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Leave empty if you don't need voting access</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Login Button */}
        <button
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold transition-colors mb-4"
          type="submit"
        >
          Login
        </button>

        {/* Demo Credentials */}
        <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-600">
          <p className="font-semibold mb-2">Demo Credentials:</p>
          <p className="mb-1"><strong>Username:</strong> Ahmad Nur</p>
          <p className="mb-2"><strong>Password:</strong> 1 (user ID)</p>
          <p className="text-gray-500 border-t pt-2 mt-2">Seed phrases available for voting access</p>
        </div>
      </form>
    </div>
  );
}
