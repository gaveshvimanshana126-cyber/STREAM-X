import React, { useState } from 'react';
import { ArrowLeft, Star, Clock, Calendar, Download, MessageCircle, Play, Film, Globe, User, Subtitles, ExternalLink, Eye, MessageSquare, Send, Share2, Bookmark, Check } from 'lucide-react';

export default function MovieDetailModal({ movie, onClose, onOpenWhatsAppDl, onOpenSubDl }) {
  if (!movie) return null;

  const [activeStream, setActiveStream] = useState(false);
  const [comments, setComments] = useState(movie.commentsList || [
    { id: 1, name: 'Kasun Perera', text: 'Maru film eka! Sinhala sub ekata sthuthiy!', date: '2 hours ago', adminReply: 'ස්තූතියි! Enjoy the movie!' }
  ]);
  const [newComment, setNewComment] = useState({ name: '', email: '', text: '' });
  const [commentSubmitted, setCommentSubmitted] = useState(false);

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

  const castArray = movie.castList || (movie.cast ? movie.cast.split(',').map(c => ({ name: c.trim(), role: 'Actor' })) : [
    { name: movie.cast || 'Ravi Teja', role: 'Main Lead' },
    { name: 'Sreeleela', role: 'Co-Star' },
    { name: 'Jayaram', role: 'Antagonist' }
  ]);

  const stillsArray = movie.stills || [
    movie.backdrop,
    movie.poster,
    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800',
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800'
  ];

  const stream1 = movie.streamUrl || movie.downloads?.[0]?.srv2;
  const dl720 = movie.downloads?.find(d => d.res === '720p') || movie.downloads?.[0];
  const dl1080 = movie.downloads?.find(d => d.res === '1080p') || movie.downloads?.[1] || dl720;

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0A] overflow-y-auto w-full min-h-screen text-gray-100 font-['Nunito',sans-serif] animate-fadeIn select-none">
      
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        
        {/* 1. Centered Floating Poster with Glow Circle matching screenshot */}
        <div className="relative flex justify-center py-4">
          <div className="relative w-44 sm:w-52 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10 group">
            <img
              src={movie.poster || movie.backdrop}
              alt={movie.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </div>

        {/* 2. Badges Row: Quality, Rating, Views matching screenshot */}
        <div className="flex items-center justify-center space-x-2">
          <span className="px-3 py-1 rounded bg-[#E8262A] font-extrabold text-[11px] text-white uppercase tracking-wider font-['Bebas_Neue']">
            {movie.quality || 'HD-RIP'}
          </span>
          <span className="px-3 py-1 rounded bg-[#F5C518] text-black font-extrabold text-[11px] flex items-center gap-1 shadow">
            <Star className="w-3.5 h-3.5 fill-black text-black" />
            {movie.rating || '4.2'}
          </span>
          <span className="px-3 py-1 rounded bg-gray-900 border border-gray-800 text-gray-300 font-bold text-[11px] flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-gray-400" />
            {movie.views || '125'}
          </span>
        </div>

        {/* 3. Title with red/gold gradient underline */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-5xl font-black text-white font-['Poppins'] tracking-tight">
            {movie.title}
          </h1>
          <div className="w-12 h-1 bg-gradient-to-r from-[#E8262A] to-[#F5C518] mx-auto rounded-full"></div>
        </div>

        {/* 4. Meta Line: Country flag, year, genre pill, runtime */}
        <div className="flex items-center justify-center space-x-3 text-xs font-bold text-gray-300">
          <span>🇺🇸 {movie.year || '2022'}</span>
          <span className="px-3 py-0.5 rounded-full bg-red-950/60 border border-red-500/40 text-red-400 uppercase text-[10px] font-extrabold">
            {movie.genre || 'Action'}
          </span>
          <span>{movie.runtime || '2h 18m'}</span>
        </div>

        {/* 5. Metadata Boxes Grid: Release Date, Director, Stars matching screenshot */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-[#111111] border border-gray-800/80 space-y-1">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">RELEASE DATE</span>
            <span className="text-xs font-bold text-white block truncate">{movie.releaseDate || 'December 23, 2022'}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#111111] border border-gray-800/80 space-y-1">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">DIRECTOR</span>
            <span className="text-xs font-bold text-white block truncate">{movie.director || 'Trinadha Rao Nakkina'}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#111111] border border-gray-800/80 space-y-1">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">STARS</span>
            <span className="text-xs font-bold text-white block truncate">{movie.stars || movie.cast || 'Ravi Teja, Sreeleela, Jayaram'}</span>
          </div>
        </div>

        {/* 6. Synopsis Overview */}
        <div className="text-xs sm:text-sm text-gray-300/90 leading-relaxed text-center sm:text-left px-2">
          {movie.description || 'Swamy and Anand Chakravarthy are lookalikes. Swamy is a jobless guy, while Anand is the son of Nanda Gopal Chakravarthy. Under dicey circumstances Pranavi falls in love with both of them.'}
        </div>

        {/* 7. Credit Cards: Description & Subtitle by matching screenshot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-[#111111] border border-gray-800 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center flex-shrink-0">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">DESCRIPTION BY</span>
              <span className="text-xs font-bold text-white">CINEFLIX</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#111111] border border-gray-800 flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 flex items-center justify-center flex-shrink-0">
              <Subtitles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">SUBTITLE BY</span>
              <span className="text-xs font-bold text-white">{movie.subBy || 'Cineflix.lk'}</span>
            </div>
          </div>
        </div>

        {/* 8. TOP CAST Section matching screenshot */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-black text-red-500 uppercase tracking-widest font-['Bebas_Neue'] text-sm flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>TOP CAST</span>
          </h3>

          <div className="flex space-x-4 overflow-x-auto no-scrollbar py-2">
            {castArray.map((actor, idx) => (
              <div key={idx} className="flex flex-col items-center text-center space-y-1.5 flex-shrink-0 w-20">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-800 bg-gray-900 shadow">
                  <img
                    src={actor.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&fit=crop&crop=faces`}
                    alt={actor.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-[11px] font-bold text-white truncate w-full">{actor.name}</span>
                <span className="text-[9px] text-gray-500 truncate w-full">{actor.role || 'Cast'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 9. MOVIE STILLS Marquee Section matching screenshot */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-black text-red-500 uppercase tracking-widest font-['Bebas_Neue'] text-sm flex items-center gap-2">
            <Film className="w-4 h-4" />
            <span>MOVIE STILLS</span>
          </h3>

          <div className="flex space-x-3 overflow-x-auto no-scrollbar py-2">
            {stillsArray.map((imgUrl, idx) => (
              <div key={idx} className="w-48 sm:w-60 h-28 sm:h-36 rounded-xl overflow-hidden border border-gray-800 flex-shrink-0 shadow-lg">
                <img
                  src={imgUrl}
                  alt={`Movie Still ${idx}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 10. CUSTOM STREAM PLAYER matching screenshot */}
        <div className="space-y-3 pt-2">
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-gray-800 shadow-2xl group">
            {!activeStream ? (
              <div className="relative w-full h-full">
                <img
                  src={movie.backdrop || movie.poster}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center space-y-3">
                  <button
                    onClick={() => setActiveStream(true)}
                    className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-2xl transition-all transform hover:scale-110 cursor-pointer"
                  >
                    <Play className="w-7 h-7 fill-white ml-1" />
                  </button>
                  <span className="text-xs font-bold text-white tracking-wider">
                    {movie.title}: Stream In HD
                  </span>
                </div>
              </div>
            ) : (
              <iframe
                src={stream1 || 'https://www.youtube.com/embed/dQw4w9WgXcQ'}
                className="w-full h-full border-0"
                allowFullScreen
                title="Stream Player"
              ></iframe>
            )}
          </div>
        </div>

        {/* 11. SELECT QUALITY (DOWNLOAD CARDS) matching screenshot */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-2">
            <h3 className="text-xs font-black text-red-500 uppercase tracking-widest font-['Bebas_Neue'] text-sm flex items-center gap-2">
              <Download className="w-4 h-4" />
              <span>SELECT QUALITY</span>
            </h3>
            <span className="text-[10px] text-gray-500 font-bold uppercase">POWERED BY CINEFLIX</span>
          </div>

          {/* 1080P Card */}
          <div className="p-4 rounded-2xl bg-[#111111] border border-gray-800/90 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-14 h-12 rounded-xl bg-gradient-to-br from-red-950 to-red-900 border border-red-500/40 flex flex-col items-center justify-center text-center">
                  <span className="text-[8px] font-extrabold text-red-400 uppercase tracking-wider">FHD</span>
                  <span className="text-xs font-black text-white font-['Bebas_Neue']">1080P</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Direct Download <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 font-extrabold">HD</span> <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 font-extrabold">SERVER</span></h4>
                  <span className="text-[10px] text-gray-500 font-bold">{dl1080?.size || '1.85GB'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={dl1080?.srv2 || dl1080?.srv1 || '#'}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-3 rounded-xl bg-gray-900 hover:bg-red-600 text-gray-300 hover:text-white text-xs font-bold flex items-center justify-center transition-all border border-gray-800"
              >
                <Download className="w-4 h-4" />
              </a>

              <button
                onClick={() => onOpenWhatsAppDl(movie)}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center justify-center space-x-1.5 shadow"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Bot</span>
              </button>
            </div>
          </div>

          {/* 720P Card */}
          <div className="p-4 rounded-2xl bg-[#111111] border border-gray-800/90 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-14 h-12 rounded-xl bg-gradient-to-br from-red-950 to-red-900 border border-red-500/40 flex flex-col items-center justify-center text-center">
                  <span className="text-[8px] font-extrabold text-red-400 uppercase tracking-wider">HD</span>
                  <span className="text-xs font-black text-white font-['Bebas_Neue']">720P</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Direct Download <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 font-extrabold">HD</span> <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 font-extrabold">SERVER</span></h4>
                  <span className="text-[10px] text-gray-500 font-bold">{dl720?.size || '1.46GB'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={dl720?.srv1 || dl720?.srv2 || '#'}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-3 rounded-xl bg-gray-900 hover:bg-red-600 text-gray-300 hover:text-white text-xs font-bold flex items-center justify-center transition-all border border-gray-800"
              >
                <Download className="w-4 h-4" />
              </a>

              <button
                onClick={() => onOpenWhatsAppDl(movie)}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center justify-center space-x-1.5 shadow"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Bot</span>
              </button>
            </div>
          </div>
        </div>

        {/* 12. SUBTITLES SECTION matching screenshot */}
        <div className="space-y-3 pt-2">
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
                <p className="text-[10px] text-gray-400">BY {movie.subBy || 'CINEFLIX.LK'}</p>
              </div>
            </div>

            <button
              onClick={() => onOpenSubDl(movie)}
              className="px-6 py-2.5 rounded-xl bg-[#F5C518] hover:bg-yellow-400 text-black font-extrabold text-xs flex items-center space-x-2 transition-all shadow-md cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Subtitle</span>
            </button>
          </div>
        </div>

        {/* 13. COMMENTS SECTION matching screenshot */}
        <div className="space-y-4 pt-4 border-t border-gray-800">
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
        <div className="pt-8 border-t border-gray-800 text-center space-y-4">
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

    </div>
  );
}
