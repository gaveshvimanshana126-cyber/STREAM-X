import React, { useState, useEffect } from 'react';
import { X, Plus, Save, Phone, Film, Download, Trash2, Check, Edit3, Link2, Tv, RefreshCw, LogOut, ArrowLeft, Search, User, Image, Subtitles, Bell, ThumbsUp, BarChart2, MessageCircle } from 'lucide-react';
import { rtdbGet, rtdbSet, rtdbPush, rtdbRemove } from '../services/firebase';

export default function AdminPanel({ movies, onRefreshMovies, onClose, onLogout }) {
  const [editingMovieId, setEditingMovieId] = useState(null);
  const [adminSearch, setAdminSearch] = useState('');
  const [activeTab, setActiveTab] = useState('movies'); // 'movies' | 'bot' | 'requests' | 'notifs' | 'analytics'
  const [requestsList, setRequestsList] = useState([]);
  const [analytics, setAnalytics] = useState({ totalVisitors: 0, viewsDaily: {}, downloadsDaily: {} });
  const [notifMsg, setNotifMsg] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // WhatsApp Bot Settings State
  const [waNumber, setWaNumber] = useState(localStorage.getItem('cf_wa_num') || '+94771234567');
  const [waSavedSuccess, setWaSavedSuccess] = useState(false);

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
    loadWaNumberSetting();
  }, []);

  const loadWaNumberSetting = async () => {
    try {
      const val = await rtdbGet('settings/waNumber');
      if (val) {
        setWaNumber(val);
        localStorage.setItem('cf_wa_num', val);
      }
    } catch (e) { }
  };

  const handleSaveWaNumber = async (e) => {
    e.preventDefault();
    try {
      const cleanNum = waNumber.trim();
      await rtdbSet('settings/waNumber', cleanNum);
      localStorage.setItem('cf_wa_num', cleanNum);
      setWaSavedSuccess(true);
      setTimeout(() => setWaSavedSuccess(false), 3000);
    } catch (err) {
      alert('Error saving WhatsApp number: ' + err.message);
    }
  };

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
    if (!movieForm.title) return alert('Movie title is required!');

    const stillsArray = movieForm.stills
      ? movieForm.stills.split(',').map(s => s.trim()).filter(Boolean)
      : [movieForm.backdrop, movieForm.poster].filter(Boolean);

    const downloadsArray = [
      {
        res: '720p',
        size: '1.46GB',
        quality: movieForm.quality,
        srv1: movieForm.pd720 || '',
        srv2: movieForm.pd720 || '',
        pd720: movieForm.pd720 || '',
        tgLink: movieForm.tgLink || 'https://t.me/Cineflix_cloud_Bot',
        url: '#'
      },
      {
        res: '1080p',
        size: '2.12GB',
        quality: movieForm.quality,
        srv1: movieForm.pd1080 || '',
        srv2: movieForm.pd1080 || '',
        pd1080: movieForm.pd1080 || '',
        tgLink: movieForm.tgLink || 'https://t.me/Cineflix_cloud_Bot',
        url: '#'
      }
    ];

    const movieObj = {
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
      stills: stillsArray,
      poster: movieForm.poster,
      backdrop: movieForm.backdrop,
      description: movieForm.description,
      streamUrl: movieForm.streamUrl,
      streamUrl2: movieForm.streamUrl2,
      downloads: downloadsArray,
      subUrl: movieForm.subUrl,
      addedAt: Date.now()
    };

    try {
      if (editingMovieId) {
        await rtdbSet(`movies/${editingMovieId}`, { id: editingMovieId, ...movieObj });
      } else {
        await rtdbPush('movies', movieObj);
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      handleResetForm();
      if (onRefreshMovies) onRefreshMovies();
    } catch (e) {
      alert('Error saving movie: ' + e.message);
    }
  };

  const handleDeleteMovie = async (movieId) => {
    if (!window.confirm('මෙම චිත්‍රපටය Database එකෙන් ඉවත් කිරීමට අවශ්‍යද?')) return;
    try {
      await rtdbRemove(`movies/${movieId}`);
      if (onRefreshMovies) onRefreshMovies();
    } catch (e) {
      alert('Error deleting movie: ' + e.message);
    }
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
        <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('movies')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'movies' ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            <Film className="w-4 h-4" /> Movie Catalog ({movies.length})
          </button>

          <button
            onClick={() => setActiveTab('bot')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'bot' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            <MessageCircle className="w-4 h-4" /> WhatsApp Bot Settings
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'requests' ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            <ThumbsUp className="w-4 h-4" /> Requests ({requestsList.length})
          </button>

          <button
            onClick={() => setActiveTab('notifs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'notifs' ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            <Bell className="w-4 h-4" /> Broadcast
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'analytics' ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            <BarChart2 className="w-4 h-4" /> Analytics
          </button>
        </div>

        {/* Tab: WhatsApp Bot Phone Number Settings */}
        {activeTab === 'bot' && (
          <div className="bg-neutral-900 border border-emerald-500/30 rounded-2xl p-6 space-y-4 max-w-xl">
            <div className="flex items-center space-x-3 text-emerald-400">
              <MessageCircle className="w-6 h-6" />
              <h3 className="font-bold text-white text-base">WhatsApp Bot Phone Number Settings</h3>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Website එකේ "WhatsApp Bot" button එක ඔබන විට පරිශීලකයින්ගේ මැසේජ් එක කෙලින්ම යන WhatsApp දුරකථන අංකය මෙතැනට ඇතුළත් කරන්න.
            </p>

            {waSavedSuccess && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" /> WhatsApp Bot අංකය සාර්ථකව Save විය!
              </div>
            )}

            <form onSubmit={handleSaveWaNumber} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300 uppercase">WhatsApp Bot Number (With Country Code)</label>
                <input
                  type="text"
                  required
                  placeholder="+94771234567"
                  value={waNumber}
                  onChange={(e) => setWaNumber(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>SAVE WHATSAPP BOT NUMBER</span>
              </button>
            </form>
          </div>
        )}

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

              <form onSubmit={handleSaveMovieForm} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Movie Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dhamaka"
                      value={movieForm.title}
                      onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Year</label>
                    <input
                      type="text"
                      placeholder="2026"
                      value={movieForm.year}
                      onChange={(e) => setMovieForm({ ...movieForm, year: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Type</label>
                    <select
                      value={movieForm.type}
                      onChange={(e) => setMovieForm({ ...movieForm, type: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
                    >
                      <option value="movie">Movie</option>
                      <option value="tv">TV Series</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Quality Badge</label>
                    <input
                      type="text"
                      placeholder="WEB-DL / 1080P"
                      value={movieForm.quality}
                      onChange={(e) => setMovieForm({ ...movieForm, quality: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">IMDb Rating</label>
                    <input
                      type="text"
                      placeholder="7.5"
                      value={movieForm.rating}
                      onChange={(e) => setMovieForm({ ...movieForm, rating: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Genres (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="Action, Thriller, Drama"
                    value={movieForm.genre}
                    onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Poster URL</label>
                    <input
                      type="text"
                      placeholder="https://image.tmdb.org/t/p/w342/..."
                      value={movieForm.poster}
                      onChange={(e) => setMovieForm({ ...movieForm, poster: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Backdrop URL</label>
                    <input
                      type="text"
                      placeholder="https://image.tmdb.org/t/p/w780/..."
                      value={movieForm.backdrop}
                      onChange={(e) => setMovieForm({ ...movieForm, backdrop: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Pixeldrain 720p URL</label>
                    <input
                      type="text"
                      placeholder="https://pixeldrain.com/u/..."
                      value={movieForm.pd720}
                      onChange={(e) => setMovieForm({ ...movieForm, pd720: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Pixeldrain 1080p URL</label>
                    <input
                      type="text"
                      placeholder="https://pixeldrain.com/u/..."
                      value={movieForm.pd1080}
                      onChange={(e) => setMovieForm({ ...movieForm, pd1080: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Stream Player URL (Server 1)</label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={movieForm.streamUrl}
                      onChange={(e) => setMovieForm({ ...movieForm, streamUrl: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Sinhala Subtitle (.SRT) URL</label>
                    <input
                      type="text"
                      placeholder="https://.../sub.srt"
                      value={movieForm.subUrl}
                      onChange={(e) => setMovieForm({ ...movieForm, subUrl: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Overview Description</label>
                  <textarea
                    rows={3}
                    placeholder="Enter movie plot synopsis..."
                    value={movieForm.description}
                    onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-600"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingMovieId ? 'Update Movie in Database' : 'Save Movie to Database'}</span>
                </button>
              </form>
            </div>

            {/* Catalog List Column */}
            <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 space-y-4 flex flex-col h-[680px]">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-sm">Catalog List</h3>
                <span className="text-xs text-gray-400">{filteredMovies.length} items</span>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Catalog search..."
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {filteredMovies.map((m) => (
                  <div key={m.id} className="p-3 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between hover:border-white/20 transition">
                    <div className="min-w-0 flex-1 pr-2">
                      <h4 className="text-xs font-bold text-white truncate">{m.title}</h4>
                      <span className="text-[10px] text-gray-400">{m.year}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditMovieClick(m)}
                        className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition"
                        title="Edit"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteMovie(m.id)}
                        className="p-1.5 bg-red-600/20 hover:bg-red-600 rounded-lg text-red-400 hover:text-white transition"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Requests */}
        {activeTab === 'requests' && (
          <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-sm">User Movie Requests ({requestsList.length})</h3>

            {requestsList.length === 0 ? (
              <p className="text-xs text-gray-500">No requests found yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {requestsList.map((req) => (
                  <div key={req.key} className="p-4 bg-black/40 border border-white/5 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white">{req.title}</h4>
                      <span className="text-[10px] text-emerald-400 font-bold">👍 {req.votes || 1} Votes</span>
                    </div>
                    <p className="text-[10px] text-gray-400">Type: {req.mediaType || 'movie'} • Requested: {new Date(req.time || Date.now()).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Broadcast Notifications */}
        {activeTab === 'notifs' && (
          <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 space-y-4 max-w-xl">
            <h3 className="font-bold text-white text-sm">Broadcast Notification to All Users</h3>
            <form onSubmit={handleBroadcastNotif} className="space-y-3">
              <textarea
                rows={3}
                required
                placeholder="Enter notification message..."
                value={notifMsg}
                onChange={(e) => setNotifMsg(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-600"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-lg transition"
              >
                Send Broadcast Notification
              </button>
            </form>
          </div>
        )}

        {/* Tab 4: Analytics */}
        {activeTab === 'analytics' && (
          <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-sm">Website Visitor Analytics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-black/40 border border-white/5 rounded-xl text-center space-y-1">
                <span className="text-2xl font-black text-red-500 font-mono">{analytics.totalVisitors || 0}</span>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Total Visitors</p>
              </div>
              <div className="p-4 bg-black/40 border border-white/5 rounded-xl text-center space-y-1">
                <span className="text-2xl font-black text-emerald-400 font-mono">{Object.keys(analytics.downloadsDaily || {}).length}</span>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Daily Downloads</p>
              </div>
              <div className="p-4 bg-black/40 border border-white/5 rounded-xl text-center space-y-1">
                <span className="text-2xl font-black text-amber-400 font-mono">{movies.length}</span>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Total Movies</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
