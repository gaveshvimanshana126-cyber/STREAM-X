import React, { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, Clock, Film } from 'lucide-react';
import { getUpcomingMoviesFromTmdb } from '../services/tmdb';

export default function UpcomingMoviesPage({ isOpen, onClose }) {
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    fetchUpcoming();
  }, [isOpen]);

  const fetchUpcoming = async () => {
    setLoading(true);
    try {
      const data = await getUpcomingMoviesFromTmdb();
      setUpcoming(data);
    } catch (e) {
      setUpcoming([]);
    } finally {
      setLoading(false);
    }
  };

  const getDaysLeft = (releaseDate) => {
    const today = new Date();
    const rel = new Date(releaseDate);
    const diff = Math.ceil((rel - today) / (1000 * 60 * 60 * 24));
    if (diff <= 0) return 'TODAY';
    return `${diff} DAYS LEFT`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] bg-neutral-950 text-white overflow-y-auto animate-fade-in p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
          <button onClick={onClose} className="flex items-center gap-2 text-xs font-extrabold text-gray-400 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" /> BACK TO HOME
          </button>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-red-600" />
            <h1 className="text-2xl font-black tracking-wider uppercase">Upcoming Movies</h1>
            <span className="px-2.5 py-0.5 bg-red-600/20 text-red-400 border border-red-600/40 rounded-full text-xs font-bold">
              {upcoming.length} Releases
            </span>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-24 text-xs font-bold text-gray-500 tracking-widest animate-pulse">
            LOADING UPCOMING RELEASES FROM TMDB...
          </div>
        ) : upcoming.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {upcoming.map(m => (
              <div key={m.id} className="group relative aspect-[2/3] bg-neutral-900 rounded-xl overflow-hidden border border-white/10 shadow-xl">
                <img
                  src={`https://image.tmdb.org/t/p/w500${m.poster_path}`}
                  alt={m.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                {/* Days Left Badge */}
                <div className="absolute top-2 right-2 px-2 py-1 bg-red-600 text-white text-[9px] font-extrabold rounded-md shadow-md flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{getDaysLeft(m.release_date)}</span>
                </div>

                <div className="absolute bottom-3 left-3 right-3">
                  <span className="text-[10px] font-bold text-gray-400 block mb-0.5">{m.release_date}</span>
                  <h3 className="text-sm font-black text-white line-clamp-1">{m.title}</h3>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 text-xs text-gray-500">Upcoming Movies නොමැත.</div>
        )}
      </div>
    </div>
  );
}
