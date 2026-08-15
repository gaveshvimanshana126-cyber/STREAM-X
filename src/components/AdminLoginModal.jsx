import React, { useState } from 'react';
import { X, Lock, User, ShieldCheck, KeyRound, AlertCircle } from 'lucide-react';

export default function AdminLoginModal({ onLoginSuccess, onClose }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Admin credentials explicitly requested by user
  const ADMIN_USER = 'cineflix2008';
  const ADMIN_PASS = 'cineflixth2008';

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    if (username.trim() === ADMIN_USER && password.trim() === ADMIN_PASS) {
      onLoginSuccess();
    } else {
      setError('නොහැකියි! Username හෝ Password වැරදියි.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-md glass-panel rounded-3xl p-6 border border-red-500/30 shadow-2xl bg-[#0f1118] space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-800 hover:bg-red-600 text-gray-400 hover:text-white transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-600/20 text-red-500 border border-red-500/30 mb-1 shadow-lg shadow-red-600/20">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black text-white font-['Poppins']">Admin Authentication</h3>
          <p className="text-xs text-gray-400">Cineflix Admin Control Panel</p>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
              Admin Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="Enter admin username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
              Admin Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all uppercase tracking-wider"
          >
            Login to Admin Panel
          </button>
        </form>

      </div>
    </div>
  );
}
