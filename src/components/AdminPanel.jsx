import React, { useState } from 'react';
import { X, Plus, Save, Phone, Film, Download, Trash2, Check, Edit3, Link2, Tv, RefreshCw, LogOut, ArrowLeft, Search } from 'lucide-react';
import { getBotPhoneNumber, saveBotPhoneNumber } from '../data/moviesData.js';

export default function AdminPanel({ movies, onSaveMovies, onClose, onLogout }) {
  const [botPhone, setBotPhone] = useState(getBotPhoneNumber());
  const [phoneSaved, setPhoneSaved] = useState(false);
  const [editingMovieId, setEditingMovieId] = useState(null);
  const [adminSearch, setAdminSearch] = useState('');

  // Movie form state
  const [movieForm, setMovieForm] = useState({
    title: '',
    year: new Date().getFullYear().toString(),
    type: 'movie',
    rating: '7.5',
    quality: 'WEB-DL',
    genre: 'Action,Thriller',
    subBy: 'Cineflix Sub',
    runtime: '2h 00m',
    country: 'USA',
    cast: '',
    director: '',
    poster: '',
    backdrop: '',
    description: '',
    streamUrl: '',
    streamUrl2: '',
    srv1: '',
    srv2: '',
    pd480: '',
    pd720: '',
    pd1080: '',
    tgLink: '',
    subUrl: ''
  });

  const handleSavePhone = (e) => {
    e.preventDefault();
    saveBotPhoneNumber(botPhone);
    setPhoneSaved(true);
    setTimeout(() => setPhoneSaved(false), 2500);
  };

  const handleEditMovieClick = (movie) => {
    setEditingMovieId(movie.id);
    const dl720 = movie.downloads?.find(d => d.res === '720p') || movie.downloads?.[0];
    const dl1080 = movie.downloads?.find(d => d.res === '1080p') || movie.downloads?.[1];
    const dl480 = movie.downloads?.find(d => d.res === '480p');

    setMovieForm({
      title: movie.title || '',
      year: movie.year || new Date().getFullYear().toString(),
      type: movie.type || 'movie',
      rating: movie.rating || '7.5',
      quality: movie.quality || 'WEB-DL',
      genre: movie.genre || 'Action,Thriller',
      subBy: movie.subBy || 'Cineflix Sub',
      runtime: movie.runtime || '2h 00m',
      country: movie.country || 'USA',
      cast: movie.cast || '',
      director: movie.director || '',
      poster: movie.poster || '',
      backdrop: movie.backdrop || '',
      description: movie.description || '',
      streamUrl: movie.streamUrl || '',
      streamUrl2: movie.streamUrl2 || '',
      srv1: dl720?.srv1 || '',
      srv2: dl720?.srv2 || '',
      pd480: dl480?.srv2 || '',
      pd720: dl720?.srv2 || '',
      pd1080: dl1080?.srv2 || '',
      tgLink: dl720?.tgLink || '',
      subUrl: movie.subUrl || ''
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveMovieForm = (e) => {
    e.preventDefault();
    if (!movieForm.title) return;

    const movieObj = {
      id: editingMovieId || `-m${Date.now().toString(36)}`,
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
      cast: movieForm.cast,
      director: movieForm.director,
      poster: movieForm.poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500',
      backdrop: movieForm.backdrop || 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200',
      description: movieForm.description,
      streamUrl: movieForm.streamUrl,
      streamUrl2: movieForm.streamUrl2,
      subUrl: movieForm.subUrl,
      downloads: [
        {
          res: '720p',
          size: '699MB',
          srv1: movieForm.srv1,
          srv2: movieForm.srv2,
          pd720: movieForm.pd720,
          tgLink: movieForm.tgLink
        },
        {
          res: '1080p',
          size: '2.53GB',
          srv1: movieForm.srv1,
          srv2: movieForm.srv2,
          pd1080: movieForm.pd1080,
          tgLink: movieForm.tgLink
        }
      ]
    };

    let updatedMovies;
    if (editingMovieId) {
      updatedMovies = movies.map(m => m.id === editingMovieId ? movieObj : m);
    } else {
      updatedMovies = [movieObj, ...movies];
    }

    onSaveMovies(updatedMovies);
    setEditingMovieId(null);
    setMovieForm({
      title: '',
      year: new Date().getFullYear().toString(),
      type: 'movie',
      rating: '7.5',
      quality: 'WEB-DL',
      genre: 'Action,Thriller',
      subBy: 'Cineflix Sub',
      runtime: '2h 00m',
      country: 'USA',
      cast: '',
      director: '',
      poster: '',
      backdrop: '',
      description: '',
      streamUrl: '',
      streamUrl2: '',
      srv1: '',
      srv2: '',
      pd480: '',
      pd720: '',
      pd1080: '',
      tgLink: '',
      subUrl: ''
    });
  };

  const handleDeleteMovie = (id) => {
    if (window.confirm('Are you sure you want to delete this movie from the database?')) {
      const updated = movies.filter(m => m.id !== id);
      onSaveMovies(updated);
      if (editingMovieId === id) setEditingMovieId(null);
    }
  };

  const filteredMovies = movies.filter(m => 
    !adminSearch.trim() || m.title.toLowerCase().includes(adminSearch.toLowerCase().trim())
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0A] overflow-y-auto w-full min-h-screen text-gray-100 font-sans animate-fadeIn">
      
      {/* Sticky Full-Page Header Bar */}
      <div className="sticky top-0 z-40 bg-[#060404]/90 backdrop-blur-xl border-b border-gray-800/80 px-4 sm:px-8 py-4 flex items-center justify-between shadow-2xl">
        <div className="flex items-center space-x-4">
          <button
            onClick={onClose}
            className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-900 hover:bg-[#E8262A] text-white text-xs font-bold transition-all border border-gray-700/60 shadow cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Site</span>
          </button>

          <div className="space-y-0.5">
            <h1 className="text-xl sm:text-2xl font-black text-white font-['Bebas_Neue'] tracking-wider uppercase leading-none">
              CINE<span className="text-[#E8262A]">FLIX</span> ADMIN DASHBOARD
            </h1>
            <p className="text-[10px] text-gray-400 font-semibold hidden sm:block">
              Add & Edit Movies, Video Streams, Download Mirrors, Subtitles & WhatsApp Bot Phone Settings
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center space-x-2 px-4 py-2 rounded-full bg-red-950/60 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/40 text-xs font-bold transition-all cursor-pointer shadow"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>

      {/* Main Admin Dashboard Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        
        {/* Section 1: WhatsApp Bot Phone Number Settings */}
        <div className="p-6 rounded-2xl bg-[#111111] border border-gray-800 shadow-xl space-y-4">
          <div className="flex items-center space-x-3 border-b border-gray-800 pb-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">WhatsApp Bot Phone Number Settings</h3>
              <p className="text-xs text-gray-400">Specify the official WhatsApp Bot phone number for automatic download commands</p>
            </div>
          </div>

          <form onSubmit={handleSavePhone} className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              value={botPhone}
              onChange={(e) => setBotPhone(e.target.value)}
              placeholder="e.g. 94770000000"
              className="flex-1 w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 font-mono"
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg transition-all"
            >
              {phoneSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{phoneSaved ? 'Saved!' : 'Save Phone Number'}</span>
            </button>
          </form>
        </div>

        {/* Section 2: Add or Edit Movie Form */}
        <div className="p-6 rounded-2xl bg-[#111111] border border-gray-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-red-600/20 text-red-500 border border-red-500/30">
                {editingMovieId ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {editingMovieId ? `Editing Movie ID: ${editingMovieId}` : 'Add New Movie to Database'}
                </h3>
                <p className="text-xs text-gray-400">Fill in stream players, download links, and plot details below</p>
              </div>
            </div>

            {editingMovieId && (
              <button
                type="button"
                onClick={() => {
                  setEditingMovieId(null);
                  setMovieForm({
                    title: '', year: new Date().getFullYear().toString(), type: 'movie', rating: '7.5',
                    quality: 'WEB-DL', genre: 'Action,Thriller', subBy: 'Cineflix Sub', runtime: '2h 00m',
                    country: 'USA', cast: '', director: '', poster: '', backdrop: '', description: '',
                    streamUrl: '', streamUrl2: '', srv1: '', srv2: '', pd480: '', pd720: '', pd1080: '', tgLink: '', subUrl: ''
                  });
                }}
                className="px-4 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-300 text-xs font-bold border border-gray-800"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSaveMovieForm} className="space-y-4 text-xs">
            {/* Row 1: Title & Year */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-gray-400 mb-1 font-bold">Movie Title *</label>
                <input
                  type="text"
                  required
                  value={movieForm.title}
                  onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                  placeholder="e.g. Backrooms (2026)"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1 font-bold">Release Year</label>
                <input
                  type="text"
                  value={movieForm.year}
                  onChange={(e) => setMovieForm({ ...movieForm, year: e.target.value })}
                  placeholder="2026"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* Row 2: Type, Quality, Rating */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-400 mb-1 font-bold">Type</label>
                <select
                  value={movieForm.type}
                  onChange={(e) => setMovieForm({ ...movieForm, type: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500"
                >
                  <option value="movie">Movie</option>
                  <option value="series">TV Series</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-bold">Quality Tag</label>
                <input
                  type="text"
                  value={movieForm.quality}
                  onChange={(e) => setMovieForm({ ...movieForm, quality: e.target.value })}
                  placeholder="WEB-DL / WEB-RIP / BLURAY"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-bold">IMDb Rating</label>
                <input
                  type="text"
                  value={movieForm.rating}
                  onChange={(e) => setMovieForm({ ...movieForm, rating: e.target.value })}
                  placeholder="7.5"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* Row 3: Genres & SubBy */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 mb-1 font-bold">Genres (comma separated)</label>
                <input
                  type="text"
                  value={movieForm.genre}
                  onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })}
                  placeholder="Action, Thriller, Sci-Fi"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1 font-bold">Subtitle Translator Name</label>
                <input
                  type="text"
                  value={movieForm.subBy}
                  onChange={(e) => setMovieForm({ ...movieForm, subBy: e.target.value })}
                  placeholder="Cineflix Sub Team"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* Row 4: Poster & Backdrop URLs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 mb-1 font-bold">Poster Image URL (2:3 aspect)</label>
                <input
                  type="text"
                  value={movieForm.poster}
                  onChange={(e) => setMovieForm({ ...movieForm, poster: e.target.value })}
                  placeholder="https://image.tmdb.org/t/p/w500/..."
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1 font-bold">Backdrop Banner Image URL</label>
                <input
                  type="text"
                  value={movieForm.backdrop}
                  onChange={(e) => setMovieForm({ ...movieForm, backdrop: e.target.value })}
                  placeholder="https://image.tmdb.org/t/p/original/..."
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* Row 5: Stream & Subtitle Links */}
            <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-3">
              <h4 className="font-bold text-red-500 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5" /> STREAM & DOWNLOAD MIRROR LINKS
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Direct Download Mirror URL (srv2 / mp4 file)</label>
                  <input
                    type="text"
                    value={movieForm.srv2}
                    onChange={(e) => setMovieForm({ ...movieForm, srv2: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Stream Video Player 1 URL (iframe / embed URL)</label>
                  <input
                    type="text"
                    value={movieForm.streamUrl}
                    onChange={(e) => setMovieForm({ ...movieForm, streamUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Stream Video Player 2 URL</label>
                  <input
                    type="text"
                    value={movieForm.streamUrl2}
                    onChange={(e) => setMovieForm({ ...movieForm, streamUrl2: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Sinhala Subtitle File Link (.srt)</label>
                  <input
                    type="text"
                    value={movieForm.subUrl}
                    onChange={(e) => setMovieForm({ ...movieForm, subUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Row 6: Synopsis */}
            <div>
              <label className="block text-gray-400 mb-1 font-bold">Movie Plot Synopsis</label>
              <textarea
                rows={3}
                value={movieForm.description}
                onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })}
                placeholder="Movie plot overview in Sinhala or English..."
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs flex items-center justify-center space-x-2 shadow-xl shadow-red-600/40 transition-all cursor-pointer"
            >
              {editingMovieId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{editingMovieId ? 'Save Movie Changes' : 'Publish New Movie'}</span>
            </button>

          </form>
        </div>

        {/* Section 3: Movie Database Library (With Search & Edit Links) */}
        <div className="p-6 rounded-2xl bg-[#111111] border border-gray-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white uppercase font-['Bebas_Neue'] tracking-wider text-lg">
                MOVIE LIBRARY ({movies.length} TOTAL TITLES)
              </h3>
              <p className="text-xs text-gray-400">Click "Edit Links" on any movie to modify stream player or download URLs</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Filter movies..."
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-full pl-8 pr-4 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMovies.map((movie) => (
              <div
                key={movie.id}
                className="p-3 rounded-xl bg-gray-950 border border-gray-800/80 flex items-center space-x-3 hover:border-gray-700 transition-all"
              >
                <img
                  src={movie.poster || movie.backdrop}
                  alt={movie.title}
                  className="w-12 h-16 object-cover rounded-lg bg-gray-900 border border-gray-800 flex-shrink-0"
                />

                <div className="flex-1 min-width-0 space-y-1">
                  <h4 className="text-xs font-bold text-white truncate">{movie.title}</h4>
                  <div className="flex items-center space-x-2 text-[10px] text-gray-400">
                    <span>{movie.year}</span>
                    <span>•</span>
                    <span className="text-red-400 font-bold uppercase">{movie.quality || 'HD'}</span>
                  </div>

                  <div className="flex items-center space-x-2 pt-1">
                    <button
                      onClick={() => handleEditMovieClick(movie)}
                      className="px-2.5 py-1 rounded bg-gray-900 hover:bg-red-600 text-gray-200 hover:text-white text-[10px] font-bold border border-gray-800 flex items-center space-x-1 transition-all"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit Links</span>
                    </button>

                    <button
                      onClick={() => handleDeleteMovie(movie.id)}
                      className="p-1 rounded bg-red-950/60 hover:bg-red-600 text-red-400 hover:text-white text-[10px] border border-red-500/30 transition-all"
                      title="Delete Movie"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
