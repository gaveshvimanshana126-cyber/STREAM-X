import React from 'react';
import { ArrowLeft, Grid, Film } from 'lucide-react';

export default function GenresPage({ isOpen, onClose, onSelectGenre, movies }) {
  const genresList = [
    { name: 'Action', emoji: '💥', color: 'from-red-600/80 to-amber-600/80' },
    { name: 'Adventure', emoji: '🤠', color: 'from-amber-600/80 to-emerald-600/80' },
    { name: 'Animation', emoji: '🎨', color: 'from-purple-600/80 to-pink-600/80' },
    { name: 'Comedy', emoji: '😂', color: 'from-yellow-600/80 to-orange-600/80' },
    { name: 'Crime', emoji: '🕵️‍♂️', color: 'from-slate-700/80 to-red-900/80' },
    { name: 'Drama', emoji: '🎭', color: 'from-blue-600/80 to-indigo-800/80' },
    { name: 'Fantasy', emoji: '🧙‍♂️', color: 'from-indigo-600/80 to-purple-800/80' },
    { name: 'Horror', emoji: '👻', color: 'from-red-950/90 to-black' },
    { name: 'Mystery', emoji: '🔮', color: 'from-violet-800/80 to-slate-900/80' },
    { name: 'Romance', emoji: '❤️', color: 'from-pink-600/80 to-rose-700/80' },
    { name: 'Sci-Fi', emoji: '🚀', color: 'from-cyan-600/80 to-blue-800/80' },
    { name: 'Thriller', emoji: '⚡', color: 'from-amber-700/80 to-red-900/80' },
    { name: '18+', emoji: '🔞', color: 'from-red-600 to-rose-900' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] bg-neutral-950 text-white overflow-y-auto animate-fade-in p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <button onClick={onClose} className="flex items-center gap-2 text-xs font-extrabold text-gray-400 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" /> BACK TO HOME
          </button>
          <div className="flex items-center gap-2">
            <Grid className="w-5 h-5 text-red-600" />
            <h1 className="text-2xl font-black tracking-wider uppercase">ALL GENRES</h1>
          </div>
        </div>

        {/* Genres Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {genresList.map(g => {
            const count = movies.filter(m => m.genre?.toLowerCase().includes(g.name.toLowerCase())).length;
            return (
              <div
                key={g.name}
                onClick={() => {
                  onSelectGenre(g.name);
                  onClose();
                }}
                className={`group relative h-28 rounded-2xl p-4 bg-gradient-to-br ${g.color} border border-white/10 shadow-xl cursor-pointer hover:scale-105 transition flex flex-col justify-between overflow-hidden`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl group-hover:scale-125 transition">{g.emoji}</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 bg-black/40 backdrop-blur-md rounded-full text-white">
                    {count} Titles
                  </span>
                </div>
                <h3 className="text-lg font-black tracking-wide text-white drop-shadow-md">{g.name}</h3>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
