import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, Clock, Calendar, Download, MessageCircle, Play, Film, Globe, User, Subtitles, ExternalLink, Eye, MessageSquare, Send, Share2, Bookmark, Check, Tv, Youtube, X } from 'lucide-react';
import { fetchMovieTmdbDetails } from '../services/tmdb.js';
import { rtdbSet } from '../services/firebase.js';

export default function MovieDetailModal({ movie, onClose, onOpenWhatsAppDl, onOpenSubDl, onOpenMovieDl, onSelectEpisode }) {
  if (!movie) return null;

  const [activeStream, setActiveStream] = useState(false);
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [tmdbData, setTmdbData] = useState(null);
  const [selectedSeasonIdx, setSelectedSeasonIdx] = useState(0);
  const [realViews, setRealViews] = useState(movie.views || 1);

  const [comments, setComments] = useState(movie.commentsList || [
    { id: 1, name: 'Kasun Perera', text: 'Maru movie eka! Sinhala sub ekata sthuthiy!', date: '2 hours ago', adminReply: 'ස්තූතියි! Enjoy watching!' }
  ]);
  const [newComment, setNewComment] = useState({ name: '', email: '', text: '' });
  const [commentSubmitted, setCommentSubmitted] = useState(false);

  // Increment Real Visitor Views in Firebase RTDB on open
  useEffect(() => {
    if (movie && movie.id) {
      const newCount = (movie.views || 0) + 1;
      setRealViews(newCount);
      rtdbSet(`movies/${movie.id}/views`, newCount).catch(() => {});
    }
  }, [movie.id]);

  const isTvSeries = movie.type === 'tv' || movie.type === 'series' || (movie.seasons && movie.seasons.length > 0);

  // Sync Clean Address Bar URL for Movies (/movie/slug) vs TV Series (/tv+seris/slug)
  useEffect(() => {
    if (movie) {
      const slug = movie.title ? movie.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : movie.id;
      const targetPath = isTvSeries ? `/tv+seris/${slug}` : `/movie/${slug}`;
      window.history.pushState({ movieId: movie.id }, '', targetPath);
    }
  }, [movie, isTvSeries]);

  // Fetch real TMDb cast, profile images, trailer, and stills on open
  useEffect(() => {
    let isMounted = true;
    fetchMovieTmdbDetails(movie).then((data) => {
      if (isMounted && data) {
        setTmdbData(data);
      }
    });
    return () => { isMounted = false; };
  }, [movie]);

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.name || !newComment.text) return;

    const commentObj = {
      id: Date.now(),
      name: newComment.name,
      text: newComment.text,
      date: 'Just now'
    };

    setComments([commentObj, ...comments]);
    setNewComment({ name: '', email: '', text: '' });
    setCommentSubmitted(true);
    setTimeout(() => setCommentSubmitted(false), 3000);
  };

  const handleShareMovie = () => {
    if (navigator.share) {
      navigator.share({
        title: movie.title,
        text: `Watch & Download ${movie.title} with Sinhala Subtitles on Cineflix!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Movie link copied to clipboard!');
    }
  };

  // Open Direct WhatsApp Chat with pre-filled dynamic message when clicking quality WhatsApp Bot button
  const handleDirectWaChat = (m, quality = '720p') => {
    const waNumber = localStorage.getItem('cf_wa_num') || '+94771234567';
    const cleanNumber = waNumber.replace(/[^0-9]/g, '');
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const dynamicCode = `${m.id}-${randomSuffix}`;
    const text = encodeURIComponent(`Hi Cineflix! I want to download ${m.title} (${m.year || ''}) ${quality} via WhatsApp. Movie Code: ${dynamicCode}`);
    window.open(`https://api.whatsapp.com/send?phone=${cleanNumber}&text=${text}`, '_blank');
  };

  // Real TMDb Cast list with actor profile photos & character roles
  const castArray = tmdbData?.castList || movie.castList || (movie.cast ? movie.cast.split(',').map(c => ({
    name: c.trim(),
    role: 'Actor',
    avatar: null,
    initials: c.trim().substring(0, 2).toUpperCase()
  })) : []);

  // Real TMDb Movie Stills screenshots
  const stillsArray = tmdbData?.stillsList || movie.stills || movie.screenshots || [
    movie.backdrop,
    movie.poster
  ].filter(Boolean);

  // Generate Default Seasons & Episodes for TV Series if missing
  const seasonsList = (movie.seasons && movie.seasons.length > 0) ? movie.seasons : [
    {
      season: 1,
      seasonName: 'Season 1',
      episodes: Array.from({ length: 12 }, (_, i) => ({
        ep: i + 1,
        title: `Episode ${i + 1}`,
        airDate: movie.year || '2023',
        runtime: '24m',
        description: `${movie.title} Season 1 Episode ${i + 1} with Sinhala Subtitles.`,
        srv1: movie.streamUrl || movie.downloads?.[0]?.srv1 || '#',
        srv2: movie.streamUrl2 || movie.downloads?.[0]?.srv2 || '#',
        pd720: movie.downloads?.[0]?.pd720 || '#',
        pd1080: movie.downloads?.[0]?.pd1080 || '#'
      }))
    }
  ];

  const currentSeasonEpisodes = seasonsList[selectedSeasonIdx]?.episodes || [];

  const stream1 = movie.streamUrl || movie.downloads?.[0]?.srv1 || movie.downloads?.[0]?.srv2;
  const dl720 = movie.downloads?.find(d => d.res === '720p') || movie.downloads?.[0];
  const dl1080 = movie.downloads?.find(d => d.res === '1080p') || movie.downloads?.[1] || dl720;

  const trailerUrl = movie.trailer || tmdbData?.trailerUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ';
  const getEmbedUrl = (url) => {
    if (!url) return 'https://www.youtube.com/embed/dQw4w9WgXcQ';
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }
    if (url.includes('youtu.be/')) {
      return url.replace('youtu.be/', 'youtube.com/embed/');
    }
    return url;
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] overflow-y-auto w-full text-gray-100 font-['Nunito',sans-serif] animate-fadeIn select-none relative z-10">
      
      {/* Animated Film-Grain Overlay from index (45).html */}
      <div className="film-grain-overlay pointer-events-none"></div>

      {/* Sticky Top Bar matching index (45).html screenshot */}
      <div className="sticky top-0 z-40 bg-[#060404]/90 backdrop-blur-xl border-b border-gray-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xl">
        <button
          onClick={onClose}
          className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-900/90 hover:bg-[#E8262A] text-white text-xs font-bold transition-all border border-gray-700/60 shadow cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="font-['Bebas_Neue'] text-2xl tracking-wider text-white">
          CINE<span className="text-[#E8262A]">FLIX</span>
        </div>
      </div>

      {/* Main Full Page Body Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-8 relative z-10">
        
        {/* SUBTLE ANIMATED AMBIENT COLOR GLOW IN BACKGROUND MATCHING SCREENSHOTS */}
        <div className="ambient-bg-glow"></div>

        {/* 1. HERO STREAM PLAYER CARD AT TOP WITH AMBIENT BORDER GLOW MATCHING SCREENSHOT 1 */}
        <div className="relative aspect-video w-full rounded-3xl overflow-hidden bg-black hero-player-glow shadow-2xl group z-10">
          {!activeStream ? (
            <div className="relative w-full h-full">
              <img
                src={tmdbData?.backdrop || movie.backdrop || movie.poster}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex flex-col items-center justify-center p-6 space-y-4 text-center">
                <button
                  onClick={() => setActiveStream(true)}
                  className="w-16 h-16 rounded-full bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center shadow-2xl transition-all transform hover:scale-110 cursor-pointer backdrop-blur-md border border-white/20"
                >
                  <Play className="w-7 h-7 fill-white ml-1" />
                </button>

                <h3 className="text-xl sm:text-2xl font-black text-white font-['Poppins'] tracking-wide">
                  {movie.title}
                </h3>

                <button
                  onClick={() => setActiveStream(true)}
                  className="px-6 py-2.5 rounded-xl bg-[#E8262A] hover:bg-red-700 text-white font-black text-xs shadow-lg shadow-red-600/40 uppercase tracking-wider transition-all transform hover:scale-105 cursor-pointer"
                >
                  WATCH ONLINE
                </button>
              </div>
            </div>
          ) : (
            <iframe
              src={stream1 || 'https://www.youtube.com/embed/dQw4w9WgXcQ'}
              className="w-full h-full border-0"
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
              title={`${movie.title} Online Stream`}
            ></iframe>
          )}
        </div>

        {/* 2. CENTERED FLOATING POSTER WITH BREATHING GLOW ANIMATION MATCHING SCREENSHOT 1 & 2 */}
        <div className="relative flex justify-center py-2 z-10">
          <div className="relative w-44 sm:w-52 aspect-[2/3] rounded-2xl overflow-hidden border-2 border-white/10 poster-glow group">
            <img
              src={tmdbData?.poster || movie.poster || movie.backdrop}
              alt={movie.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </div>

        {/* 3. BADGES ROW: WEB-RIP | ★ 7.7 | 18+ MATCHING SCREENSHOT 1 & 2 */}
        <div className="flex items-center justify-center space-x-2 z-10">
          <span className="px-3 py-1 rounded bg-[#E8262A] font-extrabold text-[11px] text-white uppercase tracking-wider font-['Bebas_Neue']">
            {movie.quality || 'WEB-RIP'}
          </span>
          <span className="px-3.5 py-1 rounded bg-[#F5C518] text-black font-extrabold text-[11px] flex items-center gap-1 shadow">
            <Star className="w-3.5 h-3.5 fill-black text-black" />
            {movie.rating || '7.7'}
          </span>
          <span className="px-3 py-1 rounded bg-red-950/80 border border-red-500/40 text-red-400 font-extrabold text-[10px]">
            18+
          </span>
        </div>

        {/* 4. TITLE WITH SINGLE GRADIENT UNDERLINE BAR */}
        <div className="text-center py-1 z-10">
          <h1 className="text-3xl sm:text-5xl font-black text-white font-['Poppins'] tracking-tight">
            {movie.title}
          </h1>
          <div className="w-14 h-1 bg-gradient-to-r from-[#E8262A] to-[#F5C518] mx-auto rounded-full mt-3 shadow-lg shadow-red-600/50"></div>
        </div>

        {/* 5. META CHIPS ROW: Year, Runtime, Genre, Watch Trailer, Watchlist, Share MATCHING SCREENSHOT 1 & 2 */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-gray-300 z-10">
          <span className="px-3 py-1.5 rounded-xl bg-gray-900/80 border border-gray-800 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-red-500" />
            <span>{movie.year || '2025'}</span>
          </span>

          <span className="px-3 py-1.5 rounded-xl bg-gray-900/80 border border-gray-800 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-red-500" />
            <span>{isTvSeries ? `${seasonsList.length} Seasons` : (movie.runtime || '1h 10m')}</span>
          </span>

          <span className="px-3.5 py-1.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-400 uppercase text-[10px] font-extrabold">
            {movie.genre || 'DRAMA, 18+'}
          </span>

          {/* WATCH TRAILER BUTTON MATCHING SCREENSHOT */}
          <button
            onClick={() => setShowTrailerModal(true)}
            className="px-4 py-1.5 rounded-xl bg-red-600/90 hover:bg-red-600 text-white font-extrabold text-xs flex items-center space-x-1.5 shadow-lg shadow-red-600/30 transition-all cursor-pointer uppercase tracking-wider"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>WATCH TRAILER</span>
          </button>

          {/* ADD TO WATCHLIST BUTTON MATCHING SCREENSHOT */}
          <button
            onClick={() => setIsWatchlisted(!isWatchlisted)}
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-extrabold flex items-center space-x-1.5 transition-all cursor-pointer ${
              isWatchlisted
                ? 'bg-amber-500 text-black border-amber-400'
                : 'bg-gray-900/80 hover:bg-gray-800 text-gray-300 border-gray-800'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{isWatchlisted ? 'ADDED' : 'ADD TO WATCHLIST'}</span>
          </button>

          {/* SHARE BUTTON MATCHING SCREENSHOT */}
          <button
            onClick={handleShareMovie}
            className="p-2 rounded-xl bg-gray-900/80 hover:bg-gray-800 border border-gray-800 text-gray-300 hover:text-white transition-all cursor-pointer"
            title="Share Movie"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 6. UNIFIED STATS BAR: VIEWS • DOWNLOADS • SUB DOWNLOADS MATCHING SCREENSHOT 1 & 2 */}
        <div className="flex items-center justify-center space-x-3 text-[11px] font-bold text-gray-400 bg-gray-900/60 border border-gray-800/80 py-2 px-5 rounded-full max-w-md mx-auto z-10 shadow-lg">
          <span className="flex items-center gap-1.5 text-sky-400">
            <Eye className="w-3.5 h-3.5" />
            <span>{realViews} Views</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <Download className="w-3.5 h-3.5" />
            <span>{movie.downloadsCount || 16} Downloads</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5 text-yellow-400">
            <Subtitles className="w-3.5 h-3.5" />
            <span>{movie.subDlCount || 2} Sub Downloads</span>
          </span>
        </div>

        {/* 7. SYNOPSIS OVERVIEW */}
        <div className="text-xs sm:text-sm text-gray-300/90 leading-relaxed text-center sm:text-left px-2 z-10">
          {movie.description || 'Swamy and Anand Chakravarthy are lookalikes. Swamy is a jobless guy, while Anand is the son of Nanda Gopal Chakravarthy. Under dicey circumstances Pranavi falls in love with both of them.'}
        </div>

        {/* 8. CREDIT CARDS: Description & Subtitle by */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 z-10">
          <div className="p-3.5 rounded-2xl bg-[#111111] border border-gray-800 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center flex-shrink-0">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">DESCRIPTION BY</span>
              <span className="text-xs font-bold text-white">{movie.describedBy || 'CINEFLIX'}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#111111] border border-gray-800 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 flex items-center justify-center flex-shrink-0">
              <Subtitles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">SUBTITLE BY</span>
              <span className="text-xs font-bold text-white">{movie.subBy || 'Paisub.com'}</span>
            </div>
          </div>
        </div>

        {/* 9. TOP CAST SECTION WITH COMPACT AVATARS AND AUTO-SCROLL */}
        {castArray.length > 0 && (
          <div className="space-y-3 pt-2 z-10">
            <h3 className="text-xs font-black text-red-500 uppercase tracking-widest font-['Bebas_Neue'] text-sm flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>TOP CAST</span>
            </h3>

            <div className="overflow-hidden py-2">
              <div className="auto-scroll-track flex space-x-4">
                {[...castArray, ...castArray].map((actor, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center space-y-1.5 flex-shrink-0 w-20 cursor-pointer">
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-800 bg-gray-900 shadow flex items-center justify-center">
                      {actor.avatar ? (
                        <img
                          src={actor.avatar}
                          alt={actor.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="text-xs font-bold text-red-500">{actor.initials || '??'}</span>
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-white truncate w-full">{actor.name}</span>
                    <span className="text-[9px] text-gray-400 truncate w-full">{actor.role || 'Actor'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 10. MOVIE STILLS AUTO-SCROLL SECTION */}
        {stillsArray.length > 0 && (
          <div className="space-y-3 pt-2 z-10">
            <h3 className="text-xs font-black text-red-500 uppercase tracking-widest font-['Bebas_Neue'] text-sm flex items-center gap-2">
              <Film className="w-4 h-4" />
              <span>MOVIE STILLS</span>
            </h3>

            <div className="overflow-hidden py-2">
              <div className="auto-scroll-track flex space-x-3">
                {[...stillsArray, ...stillsArray].map((imgUrl, idx) => (
                  <div key={idx} className="w-48 sm:w-60 h-28 sm:h-36 rounded-xl overflow-hidden border border-gray-800 flex-shrink-0 shadow-lg bg-gray-900 cursor-pointer">
                    <img
                      src={imgUrl}
                      alt={`Movie Still ${idx}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 11. CONDITIONAL RENDERING: SEASONS & EPISODES FOR TV SERIES vs QUALITY CARDS FOR MOVIES */}
        {isTvSeries ? (
          /* TV SERIES SEASONS & EPISODES ACCORDION matching Screenshot 2 */
          <div className="space-y-4 pt-4 border-t border-gray-800 z-10">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <h3 className="text-xs font-black text-red-500 uppercase tracking-widest font-['Bebas_Neue'] text-sm flex items-center gap-2">
                <Tv className="w-4 h-4" />
                <span>EPISODES</span>
              </h3>
              <span className="text-[10px] text-gray-500 font-bold uppercase">POWERED BY CINEFLIX</span>
            </div>

            {/* Season Tabs matching Screenshot 2 */}
            <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1">
              {seasonsList.map((season, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedSeasonIdx(idx)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    selectedSeasonIdx === idx
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                      : 'bg-[#111111] text-gray-400 border border-gray-800 hover:text-white'
                  }`}
                >
                  {season.seasonName || `Season ${season.season || idx + 1}`}
                </button>
              ))}
            </div>

            {/* Episode List matching Screenshot 2 */}
            <div className="space-y-2.5">
              {currentSeasonEpisodes.map((ep, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-[#111111] border border-gray-800/90 shadow-xl flex items-center justify-between hover:border-red-500/40 transition group"
                >
                  <div className="flex items-center space-x-3 min-w-0 pr-2">
                    <div className="relative w-24 h-16 rounded-xl overflow-hidden bg-gray-900 border border-gray-800 flex-shrink-0">
                      <img
                        src={ep.thumbnail || ep.still || movie.backdrop || movie.poster}
                        alt={ep.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/80 text-[8px] font-black text-red-400">
                        Ep {ep.ep || idx + 1}
                      </div>
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <h4 className="text-xs font-bold text-white truncate font-['Poppins']">
                        {ep.title || `Episode ${ep.ep || idx + 1}`}
                      </h4>
                      <p className="text-[10px] text-gray-400 font-semibold">
                        {ep.airDate || ep.date || movie.year} • {ep.runtime || '24m'}
                      </p>
                      {ep.description && (
                        <p className="text-[10px] text-gray-500 line-clamp-1">{ep.description}</p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectEpisode && onSelectEpisode(ep, seasonsList[selectedSeasonIdx]?.seasonName || `Season ${selectedSeasonIdx + 1}`)}
                    className="p-3 rounded-xl bg-gray-900 hover:bg-red-600 text-gray-300 hover:text-white border border-gray-800 transition-all flex-shrink-0 cursor-pointer shadow"
                    title="Download Episode"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* SINGLE MOVIE QUALITY CARDS FROM DATABASE */
          <div className="space-y-4 pt-4 z-10">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <h3 className="text-xs font-black text-red-500 uppercase tracking-widest font-['Bebas_Neue'] text-sm flex items-center gap-2">
                <Download className="w-4 h-4" />
                <span>SELECT QUALITY</span>
              </h3>
              <span className="text-[10px] text-gray-500 font-bold uppercase">POWERED BY CINEFLIX</span>
            </div>

            {/* Dynamic Download Cards from movie.downloads */}
            {((movie.downloads && Array.isArray(movie.downloads) && movie.downloads.length > 0)
              ? movie.downloads
              : [dl1080, dl720]
            ).filter(Boolean).map((dl, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-[#111111] border border-gray-800/90 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-14 h-12 rounded-xl bg-gradient-to-br from-red-950 to-red-900 border border-red-500/40 flex flex-col items-center justify-center text-center">
                      <span className="text-[8px] font-extrabold text-red-400 uppercase tracking-wider">{dl?.quality || 'HD'}</span>
                      <span className="text-xs font-black text-white font-['Bebas_Neue']">{dl?.res || '720P'}</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Direct Download <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 font-extrabold">DATABASE SERVER</span></h4>
                      <span className="text-[10px] text-gray-500 font-bold">{dl?.size || '1.46GB'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => (onOpenMovieDl ? onOpenMovieDl(movie, dl?.res || '720p', 'movie') : onOpenSubDl(movie))}
                    className="flex-1 py-3 rounded-xl bg-gray-900 hover:bg-red-600 text-gray-300 hover:text-white text-xs font-bold flex items-center justify-center space-x-2 transition-all border border-gray-800 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Direct Download ({dl?.res || 'HD'})</span>
                  </button>

                  <button
                    onClick={() => handleDirectWaChat(movie, dl?.res || '720p')}
                    className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center justify-center space-x-1.5 shadow cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Bot</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 11.5 DEDICATED DIRECT WHATSAPP PHONE DELIVERY BUTTON CARD MATCHING USER SCREENSHOT LOCATION */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-[#111111] to-[#111111] border border-emerald-500/40 shadow-xl space-y-3 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-400">Direct WhatsApp Phone Delivery</h4>
                <p className="text-[10px] text-gray-400">චිත්‍රපටය ඔබේ WhatsApp අංකයටම කෙලින්ම ගෙන්වා ගන්න</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => onOpenWhatsAppDl(movie, '720p')}
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer uppercase tracking-wider font-['Poppins']"
          >
            <MessageCircle className="w-4 h-4" />
            <span>📱 Send Movie to My WhatsApp Number</span>
          </button>
        </div>

        {/* 12. SUBTITLES SECTION (SHOW FOR MOVIES ONLY - HIDE FOR TV SERIES) */}
        {!isTvSeries && movie.subUrl && (
          <div className="space-y-3 pt-2 z-10">
            <h3 className="text-xs font-black text-red-500 uppercase tracking-widest font-['Bebas_Neue'] text-sm flex items-center gap-2">
              <Subtitles className="w-4 h-4" />
              <span>SUBTITLES</span>
            </h3>

            <div className="p-4 rounded-2xl bg-gradient-to-r from-yellow-950/40 via-[#111111] to-[#111111] border border-yellow-500/30 shadow-xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 flex items-center justify-center">
                  <Subtitles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-yellow-400">Sinhala Subtitle</h4>
                  <p className="text-[10px] text-gray-400">BY {movie.subBy || 'Paisub.com'}</p>
                </div>
              </div>

              <button
                onClick={() => (onOpenMovieDl ? onOpenMovieDl(movie, '720p', 'subtitle') : onOpenSubDl(movie))}
                className="px-6 py-2.5 rounded-xl bg-[#F5C518] hover:bg-yellow-400 text-black font-extrabold text-xs flex items-center space-x-2 transition-all shadow-md cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Subtitle</span>
              </button>
            </div>
          </div>
        )}

        {/* 13. COMMENTS SECTION */}
        <div className="space-y-4 pt-4 border-t border-gray-800 z-10">
          <h3 className="text-xs font-black text-red-500 uppercase tracking-widest font-['Bebas_Neue'] text-sm flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span>COMMENTS ({comments.length})</span>
          </h3>

          {/* Comment Form */}
          <form onSubmit={handleAddComment} className="p-4 rounded-2xl bg-[#111111] border border-gray-800/90 shadow-xl space-y-3">
            <input
              type="text"
              required
              placeholder="Your Name"
              value={newComment.name}
              onChange={(e) => setNewComment({ ...newComment, name: e.target.value })}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
            />
            <input
              type="email"
              placeholder="Your Email (optional)"
              value={newComment.email}
              onChange={(e) => setNewComment({ ...newComment, email: e.target.value })}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
            />
            <textarea
              rows={3}
              required
              placeholder="Write your thoughts..."
              value={newComment.text}
              onChange={(e) => setNewComment({ ...newComment, text: e.target.value })}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
            />

            <div className="flex items-center justify-between pt-1">
              {commentSubmitted && <span className="text-xs text-emerald-400 font-bold">Comment added successfully!</span>}
              <button
                type="submit"
                className="ml-auto p-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-lg transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-3">
            {comments.map((c) => (
              <div key={c.id} className="p-4 rounded-2xl bg-[#111111] border border-gray-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-full bg-red-600/20 text-red-400 flex items-center justify-center font-bold text-xs">
                      {c.name.charAt(0)}
                    </div>
                    <span className="text-xs font-bold text-white">{c.name}</span>
                  </div>
                  <span className="text-[10px] text-gray-500">{c.date}</span>
                </div>

                <p className="text-xs text-gray-300 pl-9">{c.text}</p>

                {c.adminReply && (
                  <div className="ml-9 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs space-y-1">
                    <span className="font-bold text-red-400 text-[10px] uppercase block">CINEFLIX ADMIN REPLY</span>
                    <p className="text-gray-200">{c.adminReply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 14. Footer Social Links matching screenshot */}
        <div className="pt-8 border-t border-gray-800 text-center space-y-4 z-10">
          <div className="flex items-center justify-center space-x-4">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white shadow hover:scale-110 transition-transform">
              f
            </a>
            <a href="https://t.me/Cineflix_cloud_Bot" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-sky-500 flex items-center justify-center text-white shadow hover:scale-110 transition-transform">
              <Send className="w-4 h-4" />
            </a>
            <a href="https://whatsapp.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow hover:scale-110 transition-transform">
              <MessageCircle className="w-4 h-4" />
            </a>
          </div>

          <p className="text-xs text-gray-500 font-bold">
            © 2026 Cineflix • All rights reserved
          </p>
        </div>

      </div>

      {/* YOUTUBE TRAILER MODAL OVERLAY MATCHING SCREENSHOT */}
      {showTrailerModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl aspect-video bg-black rounded-3xl overflow-hidden border border-red-500/40 shadow-2xl">
            <button
              onClick={() => setShowTrailerModal(false)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/80 text-white hover:bg-red-600 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <iframe
              src={getEmbedUrl(trailerUrl)}
              className="w-full h-full border-0"
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
              title={`${movie.title} Official Trailer`}
            ></iframe>
          </div>
        </div>
      )}

    </div>
  );
}
