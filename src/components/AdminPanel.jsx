import React, { useState, useEffect } from 'react';
import { X, Plus, Save, Phone, Film, Download, Trash2, Check, Edit3, Link2, Tv, RefreshCw, LogOut, ArrowLeft, Search, User, Image, Subtitles, Bell, ThumbsUp, BarChart2 } from 'lucide-react';
import { rtdbGet, rtdbSet, rtdbPush, rtdbRemove } from '../services/firebase';

export default function AdminPanel({ movies, onRefreshMovies, onClose, onLogout }) {
  const [editingMovieId, setEditingMovieId] = useState(null);
  const [adminSearch, setAdminSearch] = useState('');
  const [activeTab, setActiveTab] = useState('movies'); // 'movies' | 'requests' | 'notifs' | 'analytics'
  const [requestsList, setRequestsList] = useState([]);
  const [analytics, setAnalytics] = useState({ totalVisitors: 0, viewsDaily: {}, downloadsDaily: {} });
  const [notifMsg, setNotifMsg] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form State
  const [movieForm, setMovieForm] = useState({
    title: '',
    year: new Date().getFullYear().toString(),
    type: 'movie',
    rating: '7.5',
    quality: 'WEB-DL',
    genre: 'Action,Thriller',
    subBy: 'Cineflix Sub',
    runtime: '2h 18m',
    country: 'USA',
    director: '',
    stars: '',
    cast: '',
    stills: '',
    poster: '',
    backdrop: '',
    description: '',
    streamUrl: '',
    streamUrl2: '',
    pd720: '',
    pd1080: '',
    tgLink: '',
    subUrl: ''
  });

  useEffect(() => {
    loadRequestsData();
    loadAnalyticsData();
  }, []);

  const loadRequestsData = async () => {
    try {
      const data = await rtdbGet('requests') || {};
      const list = Object.entries(data).map(([key, val]) => ({ key, ...val })).sort((a, b) => (b.time || 0) - (a.time || 0));
      setRequestsList(list);
    } catch (e) { }
  };

  const loadAnalyticsData = async () => {
    try {
      const data = await rtdbGet('analytics') || {};
      setAnalytics(data);
    } catch (e) { }
  };

  const handleEditMovieClick = (movie) => {
    setEditingMovieId(movie.id);
    const dl720 = movie.downloads?.find(d => d.res === '720p') || movie.downloads?.[0] || {};
    const dl1080 = movie.downloads?.find(d => d.res === '1080p') || movie.downloads?.[1] || {};

    setMovieForm({
      title: movie.title || '',
      year: movie.year || new Date().getFullYear().toString(),
      type: movie.type || 'movie',
      rating: movie.rating || '7.5',
      quality: movie.quality || 'WEB-DL',
      genre: movie.genre || 'Action,Thriller',
      subBy: movie.subBy || 'Cineflix Sub',
      runtime: movie.runtime || '2h 18m',
      country: movie.country || 'USA',
      director: movie.director || '',
      stars: movie.stars || '',
      cast: movie.cast || '',
      stills: Array.isArray(movie.stills) ? movie.stills.join(', ') : (movie.stills || ''),
      poster: movie.poster || '',
      backdrop: movie.backdrop || '',
      description: movie.description || '',
      streamUrl: movie.streamUrl || '',
      streamUrl2: movie.streamUrl2 || '',
      pd720: dl720.pd720 || '',
      pd1080: dl1080.pd1080 || '',
      tgLink: dl720.tgLink || '',
      subUrl: movie.subUrl || ''
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetForm = () => {
    setEditingMovieId(null);
    setMovieForm({
      title: '',
      year: new Date().getFullYear().toString(),
      type: 'movie',
      rating: '7.5',
      quality: 'WEB-DL',
      genre: 'Action,Thriller',
      subBy: 'Cineflix Sub',
      runtime: '2h 18m',
      country: 'USA',
      director: '',
      stars: '',
      cast: '',
      stills: '',
      poster: '',
      backdrop: '',
      description: '',
      streamUrl: '',
      streamUrl2: '',
      pd720: '',
      pd1080: '',
      tgLink: '',
      subUrl: ''
    });
  };

  const handleSaveMovieForm = async (e) => {
    e.preventDefault();
    if (!movieForm.title) return;

    const stillsList = movieForm.stills
      ? movieForm.stills.split(',').map(s => s.trim()).filter(Boolean)
      : [movieForm.backdrop, movieForm.poster].filter(Boolean);

    const mId = editingMovieId || `-m${Date.now().toString(36)}`;

    const movieObj = {
      id: mId,
      addedAt: Date.now(),
      title: movieForm.title,
      year: movieForm.year,
      type: movieForm.type,
      rating: movieForm.rating,
      quality: movieForm.quality,
      genre: movieForm.genre,
      subBy: movieForm.subBy,
      runtime: movieForm.runtime,
      country: movieForm.country,
      director: movieForm.director,
      stars: movieForm.stars,
      cast: movieForm.cast,
      stills: stillsList,
      poster: movieForm.poster,
      backdrop: movieForm.backdrop || movieForm.poster,
      description: movieForm.description,
      streamUrl: movieForm.streamUrl,
      streamUrl2: movieForm.streamUrl2,
      subUrl: movieForm.subUrl,
      downloads: [
        { res: '720p', pd720: movieForm.pd720, tgLink: movieForm.tgLink },
        { res: '1080p', pd1080: movieForm.pd1080, tgLink: movieForm.tgLink }
      ]
    };

    try {
      await rtdbSet(`movies/${mId}`, movieObj);

      // Push notification broadcast
      await rtdbPush('notifications', {
        msg: editingMovieId ? `Admin updated "${movieForm.title}"` : `Admin added "${movieForm.title}"`,
        type: 'movie',
        time: Date.now()
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);

      handleResetForm();
      if (onRefreshMovies) onRefreshMovies();
    } catch (e) {
      alert('Save failed: ' + e.message);
    }
  };

  const handleDeleteMovie = async (mId) => {
    if (!window.confirm('මෙම චිත්‍රපටය Database එකෙන් සම්පූර්ණයෙන්ම Delete කරන්නද?')) return;
    try {
      await rtdbRemove(`movies/${mId}`);
      if (onRefreshMovies) onRefreshMovies();
    } catch (e) {
      alert('Delete failed');
    }
  };

  const handleMarkRequestDone = async (reqKey) => {
    try {
      await rtdbSet(`requests/${reqKey}/status`, 'done');
      loadRequestsData();
    } catch (e) { }
  };

  const handleDeleteRequest = async (reqKey) => {
    try {
      await rtdbRemove(`requests/${reqKey}`);
      loadRequestsData();
    } catch (e) { }
  };

  const handleBroadcastNotif = async (e) => {
    e.preventDefault();
    if (!notifMsg.trim()) return;

    try {
      await rtdbPush('notifications', {
        msg: notifMsg,
        type: 'movie',
        time: Date.now()
      });
      setNotifMsg('');
      alert('✓ Broadcast Notification එක සාර්ථකව යවන ලදී!');
    } catch (e) { }
  };

  const filteredMovies = movies.filter(m =>
    m.title?.toLowerCase().includes(adminSearch.toLowerCase()) ||
    m.year?.includes(adminSearch)
  );

  return (
    <div className="fixed inset-0 z-[100] bg-neutral-950 text-white overflow-y-auto animate-fade-in p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition text-gray-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-black tracking-wider uppercase text-white">ADMIN DASHBOARD</h1>
          </div>

          <button onClick={onLogout} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/20 text-red-400 border border-red-600/40 rounded-xl text-xs font-bold hover:bg-red-600 hover:text-white transition">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-2">
          <button
            onClick={() => setActiveTab('movies')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'movies' ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            <Film className="w-4 h-4" /> Movie Catalog ({movies.length})
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'requests' ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            <ThumbsUp className="w-4 h-4" /> Requests ({requestsList.length})
          </button>

          <button
            onClick={() => setActiveTab('notifs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'notifs' ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            <Bell className="w-4 h-4" /> Broadcast
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'analytics' ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            <BarChart2 className="w-4 h-4" /> Analytics
          </button>
        </div>

        {/* Tab 1: Movie Form & Catalog */}
        {activeTab === 'movies' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Column */}
            <div className="lg:col-span-2 bg-neutral-900 border border-white/10 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-bold text-white text-sm">
                  {editingMovieId ? '✏️ Edit Movie Details' : '➕ Add New Movie'}
                </h3>
                {editingMovieId && (
                  <button onClick={handleResetForm} className="text-xs text-red-500 font-bold hover:underline">
                    Cancel Edit
                  </button>
                )}
              </div>

              {savedSuccess && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" /> Movie saved successfully to Firebase!
                </div>
              )}

              <form onSubmit={handleSaveMovieForm} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 mb-1">Movie Title</label>
                    <input
                      type="text"
                      value={movieForm.title}
                      onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">Year</label>
                    <input
                      type="text"
                      value={movieForm.year}
                      onChange={(e) => setMovieForm({ ...movieForm, year: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-gray-400 mb-1">Type</label>
                    <select
                      value={movieForm.type}
                      onChange={(e) => setMovieForm({ ...movieForm, type: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-600"
                    >
                      <option value="movie">Movie</option>
                      <option value="tv">TV Series</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">Quality Badge</label>
                    <input
                      type="text"
                      value={movieForm.quality}
                      onChange={(e) => setMovieForm({ ...movieForm, quality: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">IMDb Rating</label>
                    <input
                      type="text"
                      value={movieForm.rating}
                      onChange={(e) => setMovieForm({ ...movieForm, rating: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Genres (Comma separated)</label>
                  <input
                    type="text"
                    value={movieForm.genre}
                    onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 mb-1">Poster URL</label>
                    <input
                      type="text"
                      value={movieForm.poster}
                      onChange={(e) => setMovieForm({ ...movieForm, poster: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">Backdrop URL</label>
                    <input
                      type="text"
                      value={movieForm.backdrop}
                      onChange={(e) => setMovieForm({ ...movieForm, backdrop: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 mb-1">Pixeldrain 720p URL</label>
                    <input
                      type="text"
                      value={movieForm.pd720}
                      onChange={(e) => setMovieForm({ ...movieForm, pd720: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">Pixeldrain 1080p URL</label>
                    <input
                      type="text"
                      value={movieForm.pd1080}
                      onChange={(e) => setMovieForm({ ...movieForm, pd1080: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 mb-1">Stream Player URL (Server 1)</label>
                    <input
                      type="text"
                      value={movieForm.streamUrl}
                      onChange={(e) => setMovieForm({ ...movieForm, streamUrl: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1">Sinhala Subtitle (.SRT) URL</label>
                    <input
                      type="text"
                      value={movieForm.subUrl}
                      onChange={(e) => setMovieForm({ ...movieForm, subUrl: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Overview Description</label>
                  <textarea
                    rows="3"
                    value={movieForm.description}
                    onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-red-600"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingMovieId ? 'UPDATE MOVIE' : 'SAVE MOVIE TO DATABASE'}</span>
                </button>
              </form>
            </div>

            {/* Catalog List Column */}
            <div className="bg-neutral-900 border border-white/10 rounded-2xl p-4 flex flex-col h-[650px]">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  placeholder="Catalog search..."
                  className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1 divide-y divide-white/5">
                {filteredMovies.map(m => (
                  <div key={m.id} className="pt-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <img src={m.poster} alt="" className="w-8 h-12 object-cover rounded shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{m.title}</div>
                        <div className="text-[10px] text-gray-400">{m.year}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => handleEditMovieClick(m)} className="p-1.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDeleteMovie(m.id)} className="p-1.5 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white rounded-lg">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Requests Management */}
        {activeTab === 'requests' && (
          <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">User Movie Requests</h3>

            <div className="space-y-3">
              {requestsList.map(r => (
                <div key={r.key} className="p-4 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">{r.movie}</h4>
                    <p className="text-xs text-gray-400">By: {r.user} ({r.email}) • {r.votes || 1} Votes</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {r.status !== 'done' ? (
                      <button onClick={() => handleMarkRequestDone(r.key)} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold">
                        ✓ Mark Added
                      </button>
                    ) : (
                      <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded">
                        Added
                      </span>
                    )}
                    <button onClick={() => handleDeleteRequest(r.key)} className="p-1.5 bg-red-600/20 text-red-400 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Notification Broadcast */}
        {activeTab === 'notifs' && (
          <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 space-y-4 max-w-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Broadcast Activity Feed Notice</h3>

            <form onSubmit={handleBroadcastNotif} className="space-y-3">
              <textarea
                rows="3"
                value={notifMsg}
                onChange={(e) => setNotifMsg(e.target.value)}
                placeholder="සියලුම පරිශීලකයින්ට පෙන්වීමට අවශ්‍ය නිවේදනය..."
                className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-600"
                required
              />

              <button type="submit" className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-lg">
                Broadcast Notice
              </button>
            </form>
          </div>
        )}

        {/* Tab 4: Analytics */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-6 bg-neutral-900 border border-white/10 rounded-2xl text-center space-y-2">
              <div className="text-3xl font-black text-red-500">{analytics.totalVisitors || 0}</div>
              <div className="text-xs font-bold text-gray-400 uppercase">Total Site Visitors</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
