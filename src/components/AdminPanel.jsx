import React, { useState, useEffect } from 'react';
import { X, Plus, Save, Phone, Film, Download, Trash2, Check, Edit3, Link2, Tv, RefreshCw, LogOut, ArrowLeft, Search, User, Image, Subtitles, Bell, ThumbsUp, BarChart2, MessageCircle, Layers, Crown, Sparkles, Youtube, ShieldAlert } from 'lucide-react';
import { rtdbGet, rtdbSet, rtdbPush, rtdbRemove } from '../services/firebase';
import { searchTmdbMulti, fetchMovieTmdbDetails, TMDB_IMG } from '../services/tmdb';

export default function AdminPanel({ movies, onRefreshMovies, onClose, onLogout }) {
  const [editingMovieId, setEditingMovieId] = useState(null);
  const [adminSearch, setAdminSearch] = useState('');
  const [activeTab, setActiveTab] = useState('movies'); // 'movies' | 'bot' | 'requests' | 'notifs' | 'analytics'
  const [requestsList, setRequestsList] = useState([]);
  const [analytics, setAnalytics] = useState({ totalVisitors: 0, viewsDaily: {}, downloadsDaily: {} });
  const [notifMsg, setNotifMsg] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // TMDb Live Auto-Fill Search State (from index (43).html)
  const [tmdbQuery, setTmdbQuery] = useState('');
  const [tmdbSearchResults, setTmdbSearchResults] = useState([]);
  const [isTmdbSearching, setIsTmdbSearching] = useState(false);
  const [tmdbStatusMsg, setTmdbStatusMsg] = useState('');

  // WhatsApp Bot Settings State
  const [waNumber, setWaNumber] = useState(localStorage.getItem('cf_wa_num') || '+94771234567');
  const [waSavedSuccess, setWaSavedSuccess] = useState(false);

  // Complete Form State (Matching index (43).html)
  const [movieForm, setMovieForm] = useState({
    tmdbId: '',
    title: '',
    year: new Date().getFullYear().toString(),
    type: 'movie',
    seriesStatus: 'ongoing', // 'ongoing' | 'complete'
    quality: 'WEB-RIP',
    rating: '7.5',
    genre: 'Action, Drama',
    runtime: '2h 15m',
    country: 'USA',
    describedBy: 'CINEFLIX',
    director: '',
    stars: '',
    cast: '',
    poster: '',
    backdrop: '',
    description: '',
    trailer: '',
    screenshots: '',
    isVip: false,
    showSubNotice: true,
    isAdult: false,
    streamUrl: '',
    streamUrl2: '',
    streamUrl3: '',
    subBy: 'Cineflix Sub',
    subUrl: '',
    dlSubUrl: '',
    collection: '',
    collectionOrder: ''
  });

  // Dynamic Unlimited Download Links State
  const [downloadsList, setDownloadsList] = useState([
    { res: '720p', size: '1.46GB', quality: 'WEB-RIP', srv1: '', pd720: '', tgLink: '' },
    { res: '1080p', size: '2.12GB', quality: 'WEB-RIP', srv1: '', pd1080: '', tgLink: '' }
  ]);

  // Dynamic Unlimited Seasons & Episodes State (For TV Series from index (43).html)
  const [seasonsList, setSeasonsList] = useState([
    {
      season: 1,
      seasonName: 'Season 1',
      episodes: [
        { ep: 1, title: 'Episode 1', airDate: '', runtime: '24m', srv1: '', srv2: '', pd720: '', pd1080: '', tgLink: '', subUrl: '' }
      ]
    }
  ]);

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
      const d = new Date();
      const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

      const todayVis = data.visitorsDaily?.[today] || 0;
      const todayDl = data.downloadsDaily?.[today] || 0;
      const todayVw = data.viewsDaily?.[today] || 0;
      const totVis = data.totalVisitors || 0;
      const totDl = data.totalDownloads || Object.values(data.downloadsDaily || {}).reduce((a, b) => a + b, 0);

      setAnalytics({
        totalVisitors: totVis,
        todayVisitors: todayVis,
        totalDownloads: totDl,
        todayDownloads: todayDl,
        todayViews: todayVw
      });
    } catch (e) { }
  };

  // TMDb Auto-Fill Search Handler (from index (43).html)
  const handleSearchTMDB = async () => {
    if (!tmdbQuery.trim()) return;
    setIsTmdbSearching(true);
    setTmdbStatusMsg('Searching TMDb database...');
    try {
      const results = await searchTmdbMulti(tmdbQuery.trim());
      setTmdbSearchResults(results);
      if (results.length === 0) {
        setTmdbStatusMsg('No results found on TMDb.');
      } else {
        setTmdbStatusMsg(`Found ${results.length} TMDb items. Click any item to auto-fill the form!`);
      }
    } catch (err) {
      setTmdbStatusMsg('Error searching TMDb.');
    } finally {
      setIsTmdbSearching(false);
    }
  };

  // Auto-Fill Form from TMDb Item Click (from index (43).html)
  const handleSelectTmdbItem = async (item) => {
    setTmdbStatusMsg(`Loading full details for ${item.title || item.name}...`);
    try {
      const isTv = item.media_type === 'tv' || item.first_air_date;
      const details = await fetchMovieTmdbDetails({
        tmdbId: item.id,
        type: isTv ? 'tv' : 'movie',
        title: item.title || item.name,
        year: (item.release_date || item.first_air_date || '').substring(0, 4)
      });

      if (details) {
        setMovieForm(prev => ({
          ...prev,
          tmdbId: item.id,
          title: item.title || item.name,
          year: (item.release_date || item.first_air_date || new Date().getFullYear()).toString().substring(0, 4),
          type: isTv ? 'tv' : 'movie',
          rating: item.vote_average ? item.vote_average.toFixed(1) : '7.5',
          genre: details.genres || item.genre_ids?.join(', ') || 'Action, Drama',
          runtime: details.runtime || '2h 15m',
          country: details.country || 'USA',
          director: details.director || '',
          stars: details.stars || '',
          cast: details.stars || '',
          poster: details.poster || (item.poster_path ? `${TMDB_IMG}w500${item.poster_path}` : ''),
          backdrop: details.backdrop || (item.backdrop_path ? `${TMDB_IMG}w1280${item.backdrop_path}` : ''),
          description: item.overview || details.overview || '',
          screenshots: Array.isArray(details.stillsList) ? details.stillsList.join('\n') : ''
        }));

        setTmdbStatusMsg('✓ Form auto-filled successfully from TMDb!');
        setTmdbSearchResults([]);
      }
    } catch (e) {
      setTmdbStatusMsg('Error auto-filling from TMDb.');
    }
  };

  const handleEditMovieClick = (movie) => {
    setEditingMovieId(movie.id);

    setMovieForm({
      tmdbId: movie.tmdbId || '',
      title: movie.title || '',
      year: movie.year || new Date().getFullYear().toString(),
      type: movie.type || 'movie',
      seriesStatus: movie.seriesStatus || 'ongoing',
      quality: movie.quality || 'WEB-RIP',
      rating: movie.rating || '7.5',
      genre: movie.genre || 'Action, Drama',
      runtime: movie.runtime || '2h 15m',
      country: movie.country || 'USA',
      describedBy: movie.describedBy || 'CINEFLIX',
      director: movie.director || '',
      stars: movie.stars || '',
      cast: movie.cast || '',
      poster: movie.poster || '',
      backdrop: movie.backdrop || '',
      description: movie.description || '',
      trailer: movie.trailer || '',
      screenshots: Array.isArray(movie.stills) ? movie.stills.join('\n') : (movie.screenshots || ''),
      isVip: !!movie.isVip,
      showSubNotice: movie.showSubNotice !== false,
      isAdult: !!movie.isAdult,
      streamUrl: movie.streamUrl || '',
      streamUrl2: movie.streamUrl2 || '',
      streamUrl3: movie.streamUrl3 || '',
      subBy: movie.subBy || 'Cineflix Sub',
      subUrl: movie.subUrl || '',
      dlSubUrl: movie.dlSubUrl || '',
      collection: movie.collection || '',
      collectionOrder: movie.collectionOrder || ''
    });

    if (movie.downloads && Array.isArray(movie.downloads) && movie.downloads.length > 0) {
      setDownloadsList(movie.downloads.map(d => ({
        res: d.res || '720p',
        size: d.size || '1.46GB',
        quality: d.quality || movie.quality || 'WEB-RIP',
        srv1: d.srv1 || d.url || '',
        pd720: d.pd720 || d.srv2 || '',
        pd1080: d.pd1080 || d.srv2 || '',
        tgLink: d.tgLink || ''
      })));
    }

    if (movie.seasons && Array.isArray(movie.seasons) && movie.seasons.length > 0) {
      setSeasonsList(movie.seasons);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetForm = () => {
    setEditingMovieId(null);
    setMovieForm({
      tmdbId: '',
      title: '',
      year: new Date().getFullYear().toString(),
      type: 'movie',
      seriesStatus: 'ongoing',
      quality: 'WEB-RIP',
      rating: '7.5',
      genre: 'Action, Drama',
      runtime: '2h 15m',
      country: 'USA',
      describedBy: 'CINEFLIX',
      director: '',
      stars: '',
      cast: '',
      poster: '',
      backdrop: '',
      description: '',
      trailer: '',
      screenshots: '',
      isVip: false,
      showSubNotice: true,
      isAdult: false,
      streamUrl: '',
      streamUrl2: '',
      streamUrl3: '',
      subBy: 'Cineflix Sub',
      subUrl: '',
      dlSubUrl: '',
      collection: '',
      collectionOrder: ''
    });
    setDownloadsList([
      { res: '720p', size: '1.46GB', quality: 'WEB-RIP', srv1: '', pd720: '', tgLink: '' },
      { res: '1080p', size: '2.12GB', quality: 'WEB-RIP', srv1: '', pd1080: '', tgLink: '' }
    ]);
    setSeasonsList([
      {
        season: 1,
        seasonName: 'Season 1',
        episodes: [
          { ep: 1, title: 'Episode 1', airDate: '', runtime: '24m', srv1: '', srv2: '', pd720: '', pd1080: '', tgLink: '', subUrl: '' }
        ]
      }
    ]);
  };

  // Handlers for Unlimited Dynamic Download Links
  const handleAddDownloadLink = () => {
    setDownloadsList([
      ...downloadsList,
      { res: '480p', size: '700MB', quality: movieForm.quality || 'WEB-RIP', srv1: '', pd720: '', tgLink: '' }
    ]);
  };

  const handleRemoveDownloadLink = (index) => {
    if (downloadsList.length <= 1) return alert('අවම වශයෙන් එක් Download Link එකක් තැබිය යුතුය.');
    setDownloadsList(downloadsList.filter((_, i) => i !== index));
  };

  const handleUpdateDownloadLink = (index, field, value) => {
    const updated = [...downloadsList];
    updated[index][field] = value;
    setDownloadsList(updated);
  };

  // Handlers for Unlimited Seasons & Episodes (from index (43).html)
  const handleAddSeason = () => {
    const nextSeasonNum = seasonsList.length + 1;
    setSeasonsList([
      ...seasonsList,
      {
        season: nextSeasonNum,
        seasonName: `Season ${nextSeasonNum}`,
        episodes: [
          { ep: 1, title: 'Episode 1', airDate: '', runtime: '24m', srv1: '', srv2: '', pd720: '', pd1080: '', tgLink: '', subUrl: '' }
        ]
      }
    ]);
  };

  const handleAddEpisode = (seasonIdx) => {
    const updated = [...seasonsList];
    const nextEpNum = updated[seasonIdx].episodes.length + 1;
    updated[seasonIdx].episodes.push({
      ep: nextEpNum,
      title: `Episode ${nextEpNum}`,
      airDate: '',
      runtime: '24m',
      srv1: '',
      srv2: '',
      pd720: '',
      pd1080: '',
      tgLink: '',
      subUrl: ''
    });
    setSeasonsList(updated);
  };

  const handleRemoveEpisode = (seasonIdx, epIdx) => {
    const updated = [...seasonsList];
    if (updated[seasonIdx].episodes.length <= 1) return alert('අවම වශයෙන් එක් Episode එකක් තිබිය යුතුය.');
    updated[seasonIdx].episodes = updated[seasonIdx].episodes.filter((_, i) => i !== epIdx);
    setSeasonsList(updated);
  };

  const handleUpdateEpisode = (seasonIdx, epIdx, field, value) => {
    const updated = [...seasonsList];
    updated[seasonIdx].episodes[epIdx][field] = value;
    setSeasonsList(updated);
  };

  const handleSaveMovieForm = async (e) => {
    e.preventDefault();
    if (!movieForm.title) return alert('Movie title is required!');

    const stillsArray = movieForm.screenshots
      ? movieForm.screenshots.split('\n').map(s => s.trim()).filter(Boolean)
      : [movieForm.backdrop, movieForm.poster].filter(Boolean);

    const movieObj = {
      tmdbId: movieForm.tmdbId,
      title: movieForm.title,
      year: movieForm.year,
      type: movieForm.type,
      seriesStatus: movieForm.seriesStatus,
      rating: movieForm.rating,
      quality: movieForm.quality,
      genre: movieForm.genre,
      runtime: movieForm.runtime,
      country: movieForm.country,
      describedBy: movieForm.describedBy,
      director: movieForm.director,
      stars: movieForm.stars,
      cast: movieForm.cast,
      stills: stillsArray,
      screenshots: movieForm.screenshots,
      poster: movieForm.poster,
      backdrop: movieForm.backdrop,
      description: movieForm.description,
      trailer: movieForm.trailer,
      isVip: movieForm.isVip,
      showSubNotice: movieForm.showSubNotice,
      isAdult: movieForm.isAdult,
      streamUrl: movieForm.streamUrl,
      streamUrl2: movieForm.streamUrl2,
      streamUrl3: movieForm.streamUrl3,
      downloads: downloadsList,
      seasons: movieForm.type === 'tv' ? seasonsList : [],
      subBy: movieForm.subBy,
      subUrl: movieForm.subUrl,
      dlSubUrl: movieForm.dlSubUrl,
      collection: movieForm.collection,
      collectionOrder: movieForm.collectionOrder,
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
            <h1 className="text-xl font-black tracking-wider uppercase text-white font-['Bebas_Neue']">CINEFLIX ADMIN DASHBOARD</h1>
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
            <Film className="w-4 h-4" /> Movie & Series Catalog ({movies.length})
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

        {/* Tab 1: Movie & TV Series Form & Catalog */}
        {activeTab === 'movies' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Column */}
            <div className="lg:col-span-2 bg-neutral-900 border border-white/10 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-bold text-white text-sm">
                  {editingMovieId ? '✏️ Edit Movie / TV Series Details' : '➕ Add New Movie or TV Series'}
                </h3>
                {editingMovieId && (
                  <button onClick={handleResetForm} className="text-xs text-red-500 font-bold hover:underline">
                    Cancel Edit
                  </button>
                )}
              </div>

              {/* TMDB LIVE AUTO-FILL SEARCH CARD (Matching index (43).html) */}
              <div className="p-4 bg-red-950/20 border border-red-500/30 rounded-2xl space-y-3">
                <div className="flex items-center space-x-2 text-red-500 font-extrabold text-xs tracking-wider uppercase font-['Bebas_Neue'] text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>🎬 TMDB API — AUTO FILL DETAILS</span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Movie or TV Show name (e.g. Dhamaka / High School DxD)..."
                    value={tmdbQuery}
                    onChange={(e) => setTmdbQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchTMDB()}
                    className="flex-1 bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                  <button
                    type="button"
                    onClick={handleSearchTMDB}
                    disabled={isTmdbSearching}
                    className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>{isTmdbSearching ? 'Searching...' : 'Search'}</span>
                  </button>
                </div>

                {tmdbStatusMsg && (
                  <p className="text-[11px] text-gray-400 font-bold">{tmdbStatusMsg}</p>
                )}

                {/* TMDb Search Results Dropdown List */}
                {tmdbSearchResults.length > 0 && (
                  <div className="max-h-56 overflow-y-auto space-y-2 pr-1 pt-1">
                    {tmdbSearchResults.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => handleSelectTmdbItem(m)}
                        className="p-2.5 bg-black/60 hover:bg-red-950/40 border border-white/10 hover:border-red-500/50 rounded-xl flex items-center space-x-3 cursor-pointer transition"
                      >
                        <img
                          src={m.poster_path ? `${TMDB_IMG}w92${m.poster_path}` : 'https://via.placeholder.com/40x60'}
                          alt={m.title || m.name}
                          className="w-10 h-14 object-cover rounded bg-gray-900 border border-gray-800"
                        />
                        <div className="min-w-0 flex-1">
                          <h5 className="text-xs font-bold text-white truncate">{m.title || m.name}</h5>
                          <span className="text-[10px] text-gray-400">
                            {(m.release_date || m.first_air_date || '').substring(0, 4)} • {(m.media_type || 'movie').toUpperCase()}
                          </span>
                        </div>
                        <span className="px-2.5 py-1 bg-red-600 text-white text-[9px] font-black rounded-lg uppercase">Auto Fill</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {savedSuccess && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" /> Item saved successfully to Database!
                </div>
              )}

              <form onSubmit={handleSaveMovieForm} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dhamaka / High School DxD"
                      value={movieForm.title}
                      onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600 font-bold"
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
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600 font-bold text-red-400 cursor-pointer"
                    >
                      <option value="movie">Movie</option>
                      <option value="tv">TV Series / Anime</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Quality Badge</label>
                    <select
                      value={movieForm.quality}
                      onChange={(e) => setMovieForm({ ...movieForm, quality: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600 cursor-pointer"
                    >
                      <option value="WEB-RIP">WEB-RIP</option>
                      <option value="WEB-DL">WEB-DL</option>
                      <option value="BLURAY">BLURAY</option>
                      <option value="HD-RIP">HD-RIP</option>
                      <option value="CAM">CAM</option>
                      <option value="CAMCOPY">CAMCOPY</option>
                      <option value="ORIGINAL WEB">ORIGINAL WEB</option>
                      <option value="4K">4K</option>
                    </select>
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Genres (Comma separated)</label>
                    <input
                      type="text"
                      placeholder="Action, Drama, Thriller"
                      value={movieForm.genre}
                      onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Runtime</label>
                    <input
                      type="text"
                      placeholder="2h 15m"
                      value={movieForm.runtime}
                      onChange={(e) => setMovieForm({ ...movieForm, runtime: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Described By (Admin)</label>
                    <select
                      value={movieForm.describedBy}
                      onChange={(e) => setMovieForm({ ...movieForm, describedBy: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600 cursor-pointer"
                    >
                      <option value="CINEFLIX">CINEFLIX</option>
                      <option value="P.KAVEESHA">P.KAVEESHA</option>
                      <option value="GAVESH VIMANSHANA">GAVESH VIMANSHANA</option>
                    </select>
                  </div>
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Director</label>
                    <input
                      type="text"
                      placeholder="Director Name"
                      value={movieForm.director}
                      onChange={(e) => setMovieForm({ ...movieForm, director: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Stars / Cast</label>
                    <input
                      type="text"
                      placeholder="Actor 1, Actor 2, Actor 3"
                      value={movieForm.stars}
                      onChange={(e) => setMovieForm({ ...movieForm, stars: e.target.value, cast: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Country</label>
                    <input
                      type="text"
                      placeholder="USA / India"
                      value={movieForm.country}
                      onChange={(e) => setMovieForm({ ...movieForm, country: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Trailer URL (YouTube)</label>
                    <input
                      type="text"
                      placeholder="https://youtube.com/watch?v=..."
                      value={movieForm.trailer}
                      onChange={(e) => setMovieForm({ ...movieForm, trailer: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Movie Stills Screenshots (One URL per line)</label>
                    <textarea
                      rows={2}
                      placeholder="https://...img1.jpg&#10;https://...img2.jpg"
                      value={movieForm.screenshots}
                      onChange={(e) => setMovieForm({ ...movieForm, screenshots: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                {/* VIP & ADULT CONTENT TOGGLES FROM INDEX (43).HTML */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <label className="p-3 bg-amber-950/20 border border-amber-500/40 rounded-xl flex items-center justify-between cursor-pointer">
                    <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
                      <Crown className="w-4 h-4" />
                      <span>VIP Premium Content</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={movieForm.isVip}
                      onChange={(e) => setMovieForm({ ...movieForm, isVip: e.target.checked })}
                      className="w-4 h-4 accent-amber-400 cursor-pointer"
                    />
                  </label>

                  <label className="p-3 bg-red-950/20 border border-red-500/40 rounded-xl flex items-center justify-between cursor-pointer">
                    <div className="flex items-center space-x-2 text-red-400 font-bold text-xs">
                      <ShieldAlert className="w-4 h-4" />
                      <span>18+ Restricted Content</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={movieForm.isAdult}
                      onChange={(e) => setMovieForm({ ...movieForm, isAdult: e.target.checked })}
                      className="w-4 h-4 accent-red-600 cursor-pointer"
                    />
                  </label>
                </div>

                {/* STREAM PLAYERS SERVERS 1, 2, 3 FROM INDEX (43).HTML */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Stream Server 1 (Main HD)</label>
                    <input
                      type="text"
                      placeholder="https://...mp4"
                      value={movieForm.streamUrl}
                      onChange={(e) => setMovieForm({ ...movieForm, streamUrl: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Stream Server 2 (Backup)</label>
                    <input
                      type="text"
                      placeholder="https://...mp4"
                      value={movieForm.streamUrl2}
                      onChange={(e) => setMovieForm({ ...movieForm, streamUrl2: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Stream Server 3 (Advanced CC)</label>
                    <input
                      type="text"
                      placeholder="https://...mp4"
                      value={movieForm.streamUrl3}
                      onChange={(e) => setMovieForm({ ...movieForm, streamUrl3: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                {/* SUBTITLE SECTIONS FROM INDEX (43).HTML */}
                <div className="p-4 bg-black/40 border border-yellow-500/30 rounded-2xl space-y-3">
                  <div className="flex items-center space-x-2 text-yellow-400 font-bold text-xs uppercase tracking-wider">
                    <Subtitles className="w-4 h-4" />
                    <span>Subtitle Configuration (Stream & Download Subtitle)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Subtitle By</label>
                      <input
                        type="text"
                        placeholder="Piratelk.com / Paisub.com"
                        value={movieForm.subBy}
                        onChange={(e) => setMovieForm({ ...movieForm, subBy: e.target.value })}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-yellow-400 uppercase">Stream Subtitle (.SRT - Player Auto Load)</label>
                      <input
                        type="text"
                        placeholder="https://...file.srt"
                        value={movieForm.subUrl}
                        onChange={(e) => setMovieForm({ ...movieForm, subUrl: e.target.value })}
                        className="w-full bg-black/50 border border-yellow-500/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-yellow-400 uppercase">Download Subtitle (.SRT or .ZIP Link)</label>
                      <input
                        type="text"
                        placeholder="https://...subtitle.zip"
                        value={movieForm.dlSubUrl}
                        onChange={(e) => setMovieForm({ ...movieForm, dlSubUrl: e.target.value })}
                        className="w-full bg-black/50 border border-yellow-500/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                      />
                    </div>
                  </div>
                </div>

                {/* DYNAMIC UNLIMITED DOWNLOAD LINKS MANAGER */}
                <div className="p-4 bg-black/40 border border-white/10 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-red-500 uppercase tracking-wider flex items-center gap-1.5 font-['Bebas_Neue'] text-sm">
                      <Download className="w-4 h-4" /> Download Links / Qualities Manager ({downloadsList.length})
                    </h4>
                    <button
                      type="button"
                      onClick={handleAddDownloadLink}
                      className="px-3 py-1.5 bg-red-600/30 border border-red-500/50 hover:bg-red-600 text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Quality Link
                    </button>
                  </div>

                  {downloadsList.map((dl, idx) => (
                    <div key={idx} className="p-3 bg-neutral-900 border border-white/5 rounded-xl space-y-2 relative group">
                      <div className="flex items-center justify-between border-b border-white/5 pb-1">
                        <span className="text-[10px] font-extrabold text-gray-400">Quality Link #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveDownloadLink(idx)}
                          className="text-red-500 hover:text-red-400 text-[10px] font-bold"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="Resolution (e.g. 720p / 1080p / 4K)"
                          value={dl.res}
                          onChange={(e) => handleUpdateDownloadLink(idx, 'res', e.target.value)}
                          className="bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-red-500 font-bold"
                        />
                        <input
                          type="text"
                          placeholder="Size (e.g. 1.46GB)"
                          value={dl.size}
                          onChange={(e) => handleUpdateDownloadLink(idx, 'size', e.target.value)}
                          className="bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
                        />
                        <input
                          type="text"
                          placeholder="Direct Server Download URL"
                          value={dl.srv1 || dl.pd720 || dl.pd1080 || ''}
                          onChange={(e) => handleUpdateDownloadLink(idx, 'srv1', e.target.value)}
                          className="bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* DYNAMIC UNLIMITED SEASONS & EPISODES MANAGER (FOR TV SERIES FROM INDEX (43).HTML) */}
                {movieForm.type === 'tv' && (
                  <div className="p-4 bg-black/40 border border-emerald-500/30 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Tv className="w-4 h-4 text-emerald-400" />
                        <h4 className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider font-['Bebas_Neue'] text-sm">
                          TV Series Seasons & Episodes Manager ({seasonsList.length} Seasons)
                        </h4>
                      </div>

                      <select
                        value={movieForm.seriesStatus}
                        onChange={(e) => setMovieForm({ ...movieForm, seriesStatus: e.target.value })}
                        className="bg-black/60 border border-emerald-500/40 rounded-lg px-3 py-1 text-xs text-emerald-400 font-bold cursor-pointer"
                      >
                        <option value="ongoing">Ongoing (Shows S{seasonsList.length} EP Badge)</option>
                        <option value="complete">Complete (Shows Complete Badge)</option>
                      </select>

                      <button
                        type="button"
                        onClick={handleAddSeason}
                        className="px-3 py-1.5 bg-emerald-600/30 border border-emerald-500/50 hover:bg-emerald-600 text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Season
                      </button>
                    </div>

                    {seasonsList.map((season, sIdx) => (
                      <div key={sIdx} className="p-3 bg-neutral-900 border border-emerald-500/20 rounded-xl space-y-3">
                        <div className="flex items-center justify-between border-b border-white/5 pb-1">
                          <input
                            type="text"
                            value={season.seasonName}
                            onChange={(e) => {
                              const updated = [...seasonsList];
                              updated[sIdx].seasonName = e.target.value;
                              setSeasonsList(updated);
                            }}
                            className="bg-black/60 border border-white/10 rounded-lg px-2 py-1 text-xs font-bold text-emerald-400"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddEpisode(sIdx)}
                            className="px-2.5 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold cursor-pointer"
                          >
                            + Add Episode
                          </button>
                        </div>

                        <div className="space-y-2">
                          {season.episodes.map((ep, eIdx) => (
                            <div key={eIdx} className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-black/40 p-2 rounded-lg items-center">
                              <input
                                type="text"
                                placeholder="Episode Title"
                                value={ep.title}
                                onChange={(e) => handleUpdateEpisode(sIdx, eIdx, 'title', e.target.value)}
                                className="bg-black/60 border border-white/10 rounded px-2 py-1 text-[11px] text-white"
                              />
                              <input
                                type="text"
                                placeholder="Runtime (24m)"
                                value={ep.runtime}
                                onChange={(e) => handleUpdateEpisode(sIdx, eIdx, 'runtime', e.target.value)}
                                className="bg-black/60 border border-white/10 rounded px-2 py-1 text-[11px] text-white"
                              />
                              <input
                                type="text"
                                placeholder="Direct Download Link"
                                value={ep.srv1}
                                onChange={(e) => handleUpdateEpisode(sIdx, eIdx, 'srv1', e.target.value)}
                                className="bg-black/60 border border-white/10 rounded px-2 py-1 text-[11px] text-white"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveEpisode(sIdx, eIdx)}
                                className="text-red-500 text-[10px] font-bold hover:underline justify-self-end cursor-pointer"
                              >
                                Delete Ep
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Overview Description</label>
                  <textarea
                    rows={3}
                    placeholder="Enter movie / series plot synopsis..."
                    value={movieForm.description}
                    onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-600"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider font-['Bebas_Neue'] text-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingMovieId ? 'Update Item in Database' : 'Save Item to Database'}</span>
                </button>
              </form>
            </div>

            {/* Catalog List Column */}
            <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 space-y-4 flex flex-col h-[880px]">
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
                      <span className="text-[10px] text-gray-400">{m.year} • {m.type === 'tv' ? 'TV Series' : 'Movie'}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditMovieClick(m)}
                        className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition cursor-pointer"
                        title="Edit"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteMovie(m.id)}
                        className="p-1.5 bg-red-600/20 hover:bg-red-600 rounded-lg text-red-400 hover:text-white transition cursor-pointer"
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
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer"
              >
                Send Broadcast Notification
              </button>
            </form>
          </div>
        )}

        {/* Tab 4: Real-time Analytics Dashboard matching user request */}
        {activeTab === 'analytics' && (
          <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2 text-red-500 font-extrabold text-sm uppercase font-['Bebas_Neue'] tracking-wider">
                <BarChart2 className="w-5 h-5" />
                <span>LIVE ANALYTICS & DASHBOARD STATS</span>
              </div>
              <button onClick={loadAnalyticsData} className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs text-gray-300 font-bold flex items-center gap-1.5 transition cursor-pointer">
                <RefreshCw className="w-3.5 h-3.5" /> Refresh Stats
              </button>
            </div>

            {/* Main 4 Real-time Analytical Cards requested by user */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* 1. Today Visitors */}
              <div className="p-5 bg-gradient-to-br from-emerald-950/40 via-neutral-900 to-neutral-900 border border-emerald-500/40 rounded-2xl text-center space-y-1 shadow-xl">
                <span className="text-3xl font-black text-emerald-400 font-mono block">{analytics.todayVisitors}</span>
                <p className="text-[10px] font-extrabold text-gray-300 uppercase tracking-wider">Today Visitors</p>
              </div>

              {/* 2. All Visitors */}
              <div className="p-5 bg-gradient-to-br from-sky-950/40 via-neutral-900 to-neutral-900 border border-sky-500/40 rounded-2xl text-center space-y-1 shadow-xl">
                <span className="text-3xl font-black text-sky-400 font-mono block">{analytics.totalVisitors}</span>
                <p className="text-[10px] font-extrabold text-gray-300 uppercase tracking-wider">All Visitors</p>
              </div>

              {/* 3. Today Downloads */}
              <div className="p-5 bg-gradient-to-br from-red-950/40 via-neutral-900 to-neutral-900 border border-red-500/40 rounded-2xl text-center space-y-1 shadow-xl">
                <span className="text-3xl font-black text-red-500 font-mono block">{analytics.todayDownloads}</span>
                <p className="text-[10px] font-extrabold text-gray-300 uppercase tracking-wider">Today Downloads</p>
              </div>

              {/* 4. All Downloads */}
              <div className="p-5 bg-gradient-to-br from-amber-950/40 via-neutral-900 to-neutral-900 border border-amber-500/40 rounded-2xl text-center space-y-1 shadow-xl">
                <span className="text-3xl font-black text-amber-400 font-mono block">{analytics.totalDownloads}</span>
                <p className="text-[10px] font-extrabold text-gray-300 uppercase tracking-wider">All Downloads</p>
              </div>
            </div>

            {/* Secondary Catalog & Views Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-black/50 border border-white/5 rounded-2xl text-center space-y-1">
                <span className="text-2xl font-black text-purple-400 font-mono block">{analytics.todayViews}</span>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Today Page Views</p>
              </div>
              <div className="p-4 bg-black/50 border border-white/5 rounded-2xl text-center space-y-1">
                <span className="text-2xl font-black text-white font-mono block">{movies.filter(m => m.type !== 'tv').length}</span>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Movies Count</p>
              </div>
              <div className="p-4 bg-black/50 border border-white/5 rounded-2xl text-center space-y-1">
                <span className="text-2xl font-black text-emerald-400 font-mono block">{movies.filter(m => m.type === 'tv').length}</span>
                <p className="text-[10px] font-bold text-gray-400 uppercase">TV Series Count</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
