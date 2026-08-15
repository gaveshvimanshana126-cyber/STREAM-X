import React, { useState, useEffect } from 'react';
import { X, LogOut, Camera, Bookmark, Eye, MessageSquare, Flame, Shield, Star } from 'lucide-react';
import { rtdbGet, rtdbSet, uploadToImgBB } from '../services/firebase';

export default function ProfileModal({ isOpen, onClose, user, onLogout, movies, onOpenMovie }) {
  const [activeTab, setActiveTab] = useState('watchlist'); // 'watchlist' | 'seen' | 'comments'
  const [recentlySeen, setRecentlySeen] = useState([]);
  const [userComments, setUserComments] = useState([]);
  const [watchlistMovies, setWatchlistMovies] = useState([]);
  const [streak, setStreak] = useState({ count: 0, lastDate: '', longest: 0 });
  const [isUploading, setIsUploading] = useState(false);
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');

  useEffect(() => {
    if (!isOpen || !user?.uid) return;

    setPhotoURL(user.photoURL || '');
    updateWatchStreak();
    loadProfileData();
  }, [isOpen, user]);

  const updateWatchStreak = async () => {
    if (!user?.uid) return;

    const todayStr = () => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const dateStrOffset = (days) => {
      const d = new Date();
      d.setDate(d.getDate() + days);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    try {
      const today = todayStr();
      const s = await rtdbGet(`users/${user.uid}/streak`) || { count: 0, lastDate: '', longest: 0 };

      if (s.lastDate === today) {
        setStreak(s);
        return;
      }

      const continued = s.lastDate === dateStrOffset(-1);
      const newCount = continued ? (s.count || 0) + 1 : 1;
      const updated = { count: newCount, lastDate: today, longest: Math.max(s.longest || 0, newCount) };

      await rtdbSet(`users/${user.uid}/streak`, updated);
      setStreak(updated);
    } catch (e) { }
  };

  const loadProfileData = async () => {
    if (!user?.uid) return;

    try {
      // 1. Watchlist (localStorage)
      const wlIds = JSON.parse(localStorage.getItem('cineflix_watchlist') || '[]');
      const wl = movies.filter(m => wlIds.includes(m.id));
      setWatchlistMovies(wl);

      // 2. Recently Seen
      const seenData = await rtdbGet(`users/${user.uid}/recentlySeen`) || {};
      const seenList = Object.values(seenData).sort((a, b) => (b.seenAt || 0) - (a.seenAt || 0));
      setRecentlySeen(seenList);

      // 3. User Comments
      const commData = await rtdbGet(`users/${user.uid}/comments`) || {};
      const commList = Object.values(commData).sort((a, b) => (b.ts || 0) - (a.ts || 0));
      setUserComments(commList);
    } catch (e) { }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('කරුණාකර රූප ගොනුවක් (Image file) තෝරන්න.');
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadToImgBB(file);
      await rtdbSet(`users/${user.uid}/photoURL`, url);
      setPhotoURL(url);
      user.photoURL = url;
      sessionStorage.setItem('cf_user', JSON.stringify(user));
    } catch (err) {
      alert('Photo Upload එක අසාර්ථක විය.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen || !user) return null;

  const initial = (user.displayName || 'U').charAt(0).toUpperCase();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl max-h-[90vh] bg-neutral-900 border border-white/10 rounded-2xl p-6 shadow-2xl overflow-y-auto flex flex-col">
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-full bg-white/5 hover:bg-white/10 transition">
          <X className="w-5 h-5" />
        </button>

        {/* User Header Info */}
        <div className="flex items-center gap-4 border-b border-white/10 pb-6 mb-6">
          <div className="relative">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-extrabold overflow-hidden border-2 ${
              user.isAdmin ? 'border-amber-400 bg-amber-500/20 text-amber-300' : 'border-red-600 bg-red-600/20 text-red-400'
            }`}>
              {photoURL ? (
                <img src={photoURL} alt={user.displayName} className="w-full h-full object-cover" />
              ) : (
                initial
              )}
            </div>

            <label className="absolute bottom-0 right-0 p-1.5 bg-neutral-800 border border-white/20 rounded-full text-white cursor-pointer hover:bg-neutral-700 transition">
              <Camera className="w-3.5 h-3.5" />
              <input type="file" accept="image/*" onChange={handlePhotoChange} disabled={isUploading} className="hidden" />
            </label>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h2 className="text-xl font-black text-white truncate">{user.displayName || 'User'}</h2>
              {user.isAdmin ? (
                <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/40 text-amber-400 rounded-full text-[10px] font-bold flex items-center gap-1">
                  <Shield className="w-3 h-3" /> ADMIN
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-red-600/20 border border-red-600/40 text-red-400 rounded-full text-[10px] font-bold flex items-center gap-1">
                  <Star className="w-3 h-3" /> MEMBER
                </span>
              )}
            </div>

            <p className="text-xs text-gray-400 mb-2 truncate">{user.email}</p>

            {/* Streak Counter */}
            {streak.count >= 2 && (
              <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full text-xs font-bold animate-pulse">
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>{streak.count} Day Streak!</span>
              </div>
            )}
          </div>

          <button
            onClick={() => { onLogout(); onClose(); }}
            className="p-2.5 bg-red-600/10 border border-red-600/30 text-red-400 hover:bg-red-600 hover:text-white rounded-xl transition flex items-center gap-1 text-xs font-bold cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-center">
            <Bookmark className="w-4 h-4 text-red-500 mx-auto mb-1" />
            <div className="text-lg font-black text-white">{watchlistMovies.length}</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase">Saved</div>
          </div>
          <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-center">
            <Eye className="w-4 h-4 text-blue-400 mx-auto mb-1" />
            <div className="text-lg font-black text-white">{recentlySeen.length}</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase">Watched</div>
          </div>
          <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-center">
            <MessageSquare className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <div className="text-lg font-black text-white">{userComments.length}</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase">Comments</div>
          </div>
        </div>

        {/* Tabs Header */}
        <div className="flex items-center gap-2 border-b border-white/10 mb-4">
          <button
            onClick={() => setActiveTab('watchlist')}
            className={`py-2 px-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'watchlist' ? 'border-red-600 text-white' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            WATCHLIST ({watchlistMovies.length})
          </button>
          <button
            onClick={() => setActiveTab('seen')}
            className={`py-2 px-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'seen' ? 'border-red-600 text-white' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            RECENTLY WATCHED ({recentlySeen.length})
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`py-2 px-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'comments' ? 'border-red-600 text-white' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            COMMENTS ({userComments.length})
          </button>
        </div>

        {/* Tabs Content */}
        <div className="flex-1 overflow-y-auto min-h-[160px]">
          {activeTab === 'watchlist' && (
            watchlistMovies.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {watchlistMovies.map(m => (
                  <div
                    key={m.id}
                    onClick={() => { onOpenMovie(m); onClose(); }}
                    className="group relative aspect-[2/3] rounded-xl overflow-hidden cursor-pointer border border-white/10 hover:border-red-600 transition"
                  >
                    <img src={m.poster} alt={m.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                    <span className="absolute bottom-2 left-2 right-2 text-[10px] font-bold text-white truncate">{m.title}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500 text-xs">Watchlist එක හිස්ව පවතී.</div>
            )
          )}

          {activeTab === 'seen' && (
            recentlySeen.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {recentlySeen.map(item => {
                  const m = movies.find(x => x.id === item.id) || item;
                  return (
                    <div
                      key={item.id}
                      onClick={() => { if (m.title) onOpenMovie(m); onClose(); }}
                      className="group relative aspect-[2/3] rounded-xl overflow-hidden cursor-pointer border border-white/10 hover:border-red-600 transition"
                    >
                      <img src={m.poster} alt={m.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                      <span className="absolute bottom-2 left-2 right-2 text-[10px] font-bold text-white truncate">{m.title}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500 text-xs">නරඹන ලද චිත්‍රපට නොමැත.</div>
            )
          )}

          {activeTab === 'comments' && (
            userComments.length > 0 ? (
              <div className="space-y-3">
                {userComments.map((c, i) => (
                  <div key={i} className="p-3 bg-white/5 border border-white/5 rounded-xl text-xs">
                    <div className="font-bold text-red-400 mb-1">🎬 {c.movieTitle || 'Movie'}</div>
                    <div className="text-gray-200 mb-1">{c.text}</div>
                    <div className="text-[10px] text-gray-500">{c.date}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500 text-xs">අදහස් (Comments) කිසිවක් නොමැත.</div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
