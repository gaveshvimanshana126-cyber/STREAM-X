import React, { useState } from 'react';
import { X, Lock, Mail, User, ArrowRight } from 'lucide-react';
import { FIREBASE_API_KEY, ADMIN_EMAIL, setAuthToken, rtdbSet, rtdbGet } from '../services/firebase';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password) {
      setError('සියලුම තොරතුරු ඇතුළත් කරන්න.');
      return;
    }
    if (password.length < 6) {
      setError('Password එක අවම වශයෙන් characters 6ක් විය යුතුය.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true })
      });
      const data = await res.json();
      if (data.error) {
        setError(getAuthErrMsg(data.error.message));
        setLoading(false);
        return;
      }

      const idToken = data.idToken;
      setAuthToken(idToken);

      // Update Display Name
      await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:update?key=${FIREBASE_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, displayName: name, returnSecureToken: false })
      });

      const uid = data.localId;
      const userRecord = {
        uid,
        displayName: name,
        email,
        createdAt: new Date().toISOString(),
        isAdmin: email.toLowerCase() === ADMIN_EMAIL.toLowerCase(),
        idToken,
        refreshToken: data.refreshToken
      };

      await rtdbSet(`users/${uid}`, { displayName: name, email, createdAt: new Date().toISOString(), uid });
      sessionStorage.setItem('cf_user', JSON.stringify(userRecord));

      onLoginSuccess(userRecord);
      onClose();
    } catch (err) {
      setError('ජාලයේ දෝෂයක් සිදුවී ඇත.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Email සහ Password ඇතුළත් කරන්න.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true })
      });
      const data = await res.json();
      if (data.error) {
        setError(getAuthErrMsg(data.error.message));
        setLoading(false);
        return;
      }

      const idToken = data.idToken;
      setAuthToken(idToken);
      const uid = data.localId;

      const uData = await rtdbGet(`users/${uid}`) || {};

      const userRecord = {
        uid,
        email,
        displayName: uData.displayName || data.displayName || email.split('@')[0],
        photoURL: uData.photoURL || '',
        createdAt: uData.createdAt || new Date().toISOString(),
        isAdmin: email.toLowerCase() === ADMIN_EMAIL.toLowerCase(),
        idToken,
        refreshToken: data.refreshToken
      };

      sessionStorage.setItem('cf_user', JSON.stringify(userRecord));
      onLoginSuccess(userRecord);
      onClose();
    } catch (err) {
      setError('ජාලයේ දෝෂයක් සිදුවී ඇත.');
    } finally {
      setLoading(false);
    }
  };

  const getAuthErrMsg = (msg) => {
    if (msg.includes('EMAIL_EXISTS')) return 'මෙම Email ලිපිනය දැනටමත් භාවිතයේ ඇත.';
    if (msg.includes('INVALID_EMAIL')) return 'වලංගු නොවන Email ලිපිනයකි.';
    if (msg.includes('WEAK_PASSWORD')) return 'Password එක දුර්වල වැඩිය.';
    if (msg.includes('INVALID_PASSWORD') || msg.includes('INVALID_LOGIN_CREDENTIALS')) return 'Email හෝ Password වැරදිය.';
    if (msg.includes('USER_NOT_FOUND')) return 'ගිණුම සොයාගත නොහැකි විය.';
    return 'දෝෂයක් සිදුවී ඇත. නැවත උත්සාහ කරන්න.';
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-neutral-900 border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-full bg-white/5 hover:bg-white/10 transition">
          <X className="w-5 h-5" />
        </button>

        {/* Header Tabs */}
        <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl mb-6">
          <button
            onClick={() => { setTab('login'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              tab === 'login' ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'text-gray-400 hover:text-white'
            }`}
          >
            LOGIN
          </button>
          <button
            onClick={() => { setTab('register'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              tab === 'register' ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'text-gray-400 hover:text-white'
            }`}
          >
            CREATE ACCOUNT
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-red-300 text-xs font-medium">
            ⚠️ {error}
          </div>
        )}

        {/* Login Form */}
        {tab === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-600 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-600 transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 cursor-pointer"
            >
              <span>{loading ? 'Logging in...' : 'LOGIN TO CINEFLIX'}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">Your Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-600 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-600 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">Password (6+ characters)</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-600 transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 cursor-pointer"
            >
              <span>{loading ? 'Creating...' : 'CREATE MY ACCOUNT'}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
