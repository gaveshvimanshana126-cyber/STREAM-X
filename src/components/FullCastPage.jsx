import React, { useEffect, useState } from 'react';
import { ArrowLeft, Search, Users } from 'lucide-react';
import { tmdbFetch, TMDB_IMG } from '../services/tmdb';

export default function FullCastPage({ isOpen, onClose, movies, onSelectActor }) {
  const [actors, setActors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchVal, setSearchVal] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    loadAllActors();
  }, [isOpen]);

  const loadAllActors = async () => {
    setLoading(true);
    const moviesWithId = movies.filter(m => m.tmdbId).slice(0, 30);
    const actorMap = {};

    try {
      await Promise.all(moviesWithId.map(async m => {
        try {
          const type = (m.type === 'tv' || m.type === 'series') ? 'tv' : 'movie';
          const data = await tmdbFetch(`/${type}/${m.tmdbId}/credits?language=en-US`);
          (data.cast || []).slice(0, 10).forEach(c => {
            if (!c.id || !c.name || !c.profile_path) return;
            if (!actorMap[c.id]) {
              actorMap[c.id] = {
                id: c.id,
                name: c.name,
                img: TMDB_IMG + 'w185' + c.profile_path,
                moviesCount: 1
              };
            } else {
              actorMap[c.id].moviesCount++;
            }
          });
        } catch (e) { }
      }));

      const sorted = Object.values(actorMap).sort((a, b) => b.moviesCount - a.moviesCount || a.name.localeCompare(b.name));
      setActors(sorted);
    } catch (e) {
      setActors([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filtered = actors.filter(a => a.name.toLowerCase().includes(searchVal.toLowerCase()));

  return (
    <div className="fixed inset-0 z-[90] bg-neutral-950 text-white overflow-y-auto animate-fade-in p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <button onClick={onClose} className="flex items-center gap-2 text-xs font-extrabold text-gray-400 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" /> BACK TO HOME
          </button>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-red-600" />
            <h1 className="text-2xl font-black tracking-wider uppercase">ALL ACTORS & CAST</h1>
            <span className="px-2.5 py-0.5 bg-red-600/20 text-red-400 border border-red-600/40 rounded-full text-xs font-bold">
              {actors.length} Actors
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="නළුවෙකු හෝ නිළියක සොයන්න..."
            className="w-full bg-neutral-900 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-600 transition"
          />
        </div>

        {/* Actors Grid */}
        {loading ? (
          <div className="text-center py-24 text-xs font-bold text-gray-500 tracking-widest animate-pulse">
            BUILDING ACTOR CATALOG...
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {filtered.map(a => (
              <div
                key={a.id}
                onClick={() => { onSelectActor(a.name); onClose(); }}
                className="group p-3 bg-neutral-900 border border-white/10 hover:border-red-600 rounded-2xl text-center cursor-pointer transition shadow-lg hover:scale-105"
              >
                <div className="w-20 h-20 mx-auto rounded-full overflow-hidden mb-2 border border-white/10 group-hover:border-red-600 transition">
                  <img src={a.img} alt={a.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-xs font-bold text-white line-clamp-1 group-hover:text-red-400 transition">{a.name}</h3>
                <span className="text-[10px] text-gray-400 font-semibold">{a.moviesCount} Titles</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 text-xs text-gray-500">නළුවන් කිසිවෙකු සොයාගත නොහැකි විය.</div>
        )}
      </div>
    </div>
  );
}
