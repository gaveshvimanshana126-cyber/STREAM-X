import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, Clock, Calendar, Download, MessageCircle, Play, Film, Globe, User, Subtitles, ExternalLink, ShieldCheck, Tv } from 'lucide-react';

export default function MovieDetailModal({ movie, onClose, onOpenWhatsAppDl }) {
  if (!movie) return null;

  const [activeTab, setActiveTab] = useState('downloads'); // 'downloads' | 'stream1' | 'stream2' | 'trailer'

  // Scroll to top when opening detail page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [movie]);

  const getYoutubeEmbed = (url) => {
    if (!url) return null;
    let videoId = '';
    if (url.includes('v=')) {
      videoId = url.split('v=')[1]?.split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  const trailerEmbedUrl = getYoutubeEmbed(movie.trailer);
  const stream1 = movie.streamUrl || movie.downloads?.[0]?.srv2;
  const stream2 = movie.streamUrl2 || movie.downloads?.[0]?.srv1;

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0A] overflow-y-auto w-full min-h-screen text-gray-100 animate-fadeIn">
      
      {/* Animated Film-Grain Background Overlay from index (45).html */}
      <div className="film-grain-overlay pointer-events-none"></div>

      {/* Sticky Full-Page Header Bar */}
      <div className="sticky top-0 z-40 bg-[#060404]/90 backdrop-blur-xl border-b border-gray-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xl">
        <button
          onClick={onClose}
          className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-900 hover:bg-[#E8262A] text-white text-xs font-bold transition-all border border-gray-700/60 shadow cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Movies</span>
        </button>

        <div className="font-['Bebas_Neue'] text-xl tracking-wider text-white">
          CINE<span className="text-[#E8262A]">FLIX</span>
        </div>
      </div>

      {/* Full Page Hero Section */}
      <div className="relative w-full h-[320px] sm:h-[480px] overflow-hidden bg-black">
        <img
          src={movie.backdrop || movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/70 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent w-full md:w-2/3"></div>

        {/* Hero Content Overlay */}
        <div className="absolute bottom-8 left-4 sm:left-12 right-4 flex items-end justify-between z-10">
          <div className="space-y-3 max-w-3xl">
            
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded bg-[#E8262A] font-extrabold text-xs text-white uppercase tracking-wider font-['Bebas_Neue']">
                {movie.quality || 'WEB-RIP'}
              </span>
              <span className="px-2.5 py-1 rounded bg-[#F5C518] text-black text-xs font-extrabold flex items-center gap-1 shadow">
                <Star className="w-3.5 h-3.5 fill-black text-black" />
                {movie.rating || 'N/A'}
              </span>
              <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold flex items-center gap-1">
                <Subtitles className="w-3.5 h-3.5" />
                {movie.subBy || 'Sinhala Sub'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight font-['Poppins'] drop-shadow-md">
              {movie.title} <span className="text-gray-400 font-normal">({movie.year})</span>
            </h1>

          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        
        {/* Metadata Grid matching index (45).html */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-[#111111] border border-gray-800 text-xs shadow-xl">
          <div>
            <span className="text-gray-400 block mb-1 font-semibold uppercase text-[10px] tracking-wider">Runtime</span>
            <span className="font-bold text-white flex items-center gap-1.5 text-sm">
              <Clock className="w-4 h-4 text-[#E8262A]" /> {movie.runtime || 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-gray-400 block mb-1 font-semibold uppercase text-[10px] tracking-wider">Country</span>
            <span className="font-bold text-white flex items-center gap-1.5 text-sm truncate">
              <Globe className="w-4 h-4 text-blue-500" /> {movie.country || 'Global'}
            </span>
          </div>
          <div>
            <span className="text-gray-400 block mb-1 font-semibold uppercase text-[10px] tracking-wider">Genre</span>
            <span className="font-bold text-white truncate block text-sm">
              {movie.genre || 'Action'}
            </span>
          </div>
          <div>
            <span className="text-gray-400 block mb-1 font-semibold uppercase text-[10px] tracking-wider">Cast / Director</span>
            <span className="font-bold text-white flex items-center gap-1.5 text-sm truncate">
              <User className="w-4 h-4 text-emerald-500" /> {movie.cast || movie.director || 'N/A'}
            </span>
          </div>
        </div>

        {/* Synopsis Section */}
        <div className="p-6 rounded-2xl bg-[#111111] border border-gray-800/90 shadow-xl space-y-3">
          <h3 className="text-xs font-bold text-[#E8262A] uppercase tracking-widest font-['Bebas_Neue'] text-sm">
            SYNOPSIS
          </h3>
          <p className="text-sm text-gray-300 leading-relaxed font-sans">
            {movie.description || 'ප්‍රධාන චරිතයේ ජීවිතය සම්බන්ධයෙන් සිදුවන කුතුහලය දනවන සිදුවීම් මාලාවක්. නොමිලේ නරඹන්න හෝ WhatsApp මගින් ඩවුන්ලෝඩ් කරගන්න.'}
          </p>
        </div>

        {/* WhatsApp & Stream Tabs Switcher */}
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-800 pb-4">
          <button
            onClick={() => setActiveTab('downloads')}
            className={`px-5 py-2.5 rounded-full font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'downloads'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-gray-900 text-gray-300 hover:bg-gray-800 border border-gray-800'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp & Direct Downloads</span>
          </button>

          {stream1 && (
            <button
              onClick={() => setActiveTab('stream1')}
              className={`px-5 py-2.5 rounded-full font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer ${
                activeTab === 'stream1'
                  ? 'bg-[#E8262A] text-white shadow-lg shadow-red-600/30'
                  : 'bg-gray-900 text-gray-300 hover:bg-gray-800 border border-gray-800'
              }`}
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Stream Player 1</span>
            </button>
          )}

          {stream2 && (
            <button
              onClick={() => setActiveTab('stream2')}
              className={`px-5 py-2.5 rounded-full font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer ${
                activeTab === 'stream2'
                  ? 'bg-[#E8262A] text-white shadow-lg shadow-red-600/30'
                  : 'bg-gray-900 text-gray-300 hover:bg-gray-800 border border-gray-800'
              }`}
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Stream Player 2</span>
            </button>
          )}

          {trailerEmbedUrl && (
            <button
              onClick={() => setActiveTab('trailer')}
              className={`px-5 py-2.5 rounded-full font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer ${
                activeTab === 'trailer'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-gray-900 text-gray-300 hover:bg-gray-800 border border-gray-800'
              }`}
            >
              <Film className="w-4 h-4" />
              <span>Watch Trailer</span>
            </button>
          )}
        </div>

        {/* Dynamic Tab Views */}

        {/* Tab 1: Video Players (Stream1 / Stream2 / Trailer) */}
        {(activeTab === 'stream1' || activeTab === 'stream2' || activeTab === 'trailer') && (
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-gray-800 shadow-2xl">
            {activeTab === 'stream1' && (
              <iframe
                src={stream1}
                className="w-full h-full border-0"
                allowFullScreen
                title="Stream Player 1"
              ></iframe>
            )}
            {activeTab === 'stream2' && (
              <iframe
                src={stream2}
                className="w-full h-full border-0"
                allowFullScreen
                title="Stream Player 2"
              ></iframe>
            )}
            {activeTab === 'trailer' && trailerEmbedUrl && (
              <iframe
                src={trailerEmbedUrl}
                className="w-full h-full border-0"
                allowFullScreen
                title="Official Trailer"
              ></iframe>
            )}
          </div>
        )}

        {/* Tab 2: WhatsApp & Direct Download Links */}
        {activeTab === 'downloads' && (
          <div className="space-y-6">
            
            {/* Main WhatsApp Bot Download Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-emerald-900/30 to-[#111111] border border-emerald-600/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 font-extrabold text-[10px] uppercase tracking-wider border border-emerald-500/30">
                  FAST WHATSAPP FILE DELIVERY
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white flex items-center justify-center md:justify-start gap-2">
                  <MessageCircle className="w-5 h-5 text-emerald-400" />
                  <span>Download via WhatsApp Bot</span>
                </h3>
                <p className="text-xs text-gray-300">
                  Direct MP4 video document delivered straight to your WhatsApp chat!
                </p>
              </div>

              <button
                onClick={() => onOpenWhatsAppDl(movie)}
                className="px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm flex items-center space-x-2 shadow-lg shadow-emerald-500/30 transition-all transform hover:scale-105 cursor-pointer whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4 fill-black" />
                <span>START WHATSAPP DOWNLOAD</span>
              </button>
            </div>

            {/* Sinhala Subtitles Download Card */}
            {movie.subUrl && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-yellow-950/40 via-yellow-900/20 to-[#111111] border border-yellow-500/30 shadow-xl flex items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                    <Subtitles className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-yellow-400">Sinhala Subtitle (.SRT)</h4>
                    <p className="text-xs text-gray-400">Translated by {movie.subBy || 'Cineflix Sub Team'}</p>
                  </div>
                </div>

                <a
                  href={movie.subUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs flex items-center space-x-2 transition-all shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Subtitle</span>
                </a>
              </div>
            )}

            {/* Available Direct Download Resolutions */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-['Bebas_Neue'] text-sm">
                AVAILABLE DIRECT DOWNLOAD MIRRORS
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 480p / 720p mirror */}
                <div className="p-4 rounded-xl bg-[#111111] border border-gray-800 hover:border-red-600/50 transition-all flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="px-2.5 py-1 rounded bg-red-600/20 text-red-400 font-black text-xs border border-red-500/30">
                      720p
                    </span>
                    <div>
                      <h5 className="text-xs font-bold text-white">HD Web-Rip MP4</h5>
                      <span className="text-[10px] text-gray-500">Fast Mirror Server 1</span>
                    </div>
                  </div>

                  <a
                    href={movie.downloads?.[0]?.srv1 || movie.downloads?.[0]?.pd720 || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-lg bg-gray-900 hover:bg-red-600 text-white font-bold text-xs flex items-center space-x-1.5 transition-all border border-gray-800"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Direct Link</span>
                  </a>
                </div>

                {/* 1080p mirror */}
                <div className="p-4 rounded-xl bg-[#111111] border border-gray-800 hover:border-red-600/50 transition-all flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="px-2.5 py-1 rounded bg-red-600/20 text-red-400 font-black text-xs border border-red-500/30">
                      1080p
                    </span>
                    <div>
                      <h5 className="text-xs font-bold text-white">Full HD 1080p MP4</h5>
                      <span className="text-[10px] text-gray-500">High-Speed Mirror Server 2</span>
                    </div>
                  </div>

                  <a
                    href={movie.downloads?.[0]?.srv2 || movie.downloads?.[0]?.pd1080 || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-lg bg-gray-900 hover:bg-red-600 text-white font-bold text-xs flex items-center space-x-1.5 transition-all border border-gray-800"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Direct Link</span>
                  </a>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
