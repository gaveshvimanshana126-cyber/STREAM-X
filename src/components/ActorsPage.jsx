import React, { useEffect, useState } from 'react';
import { ArrowLeft, User, Film } from 'lucide-react';
import { getTmdbPersonDetails } from '../services/tmdb';

export default function ActorsPage({ isOpen, onClose, actorName, movies, onOpenMovie }) {
  const [person, setPerson] = useState(null);
  const [actorMovies, setActorMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !actorName) return;
    loadActorData();
  }, [isOpen, actorName]);

  const loadActorData = async () => {
    setLoading(true);
    try {
      const data = await getTmdbPersonDetails(actorName);
      if (data) {
        setPerson(data.person);
        const tmdbIds = new Set((data.credits?.cast || []).map(x => String(x.id)));
        const matched = movies.filter(m => m.tmdbId && tmdbIds.has(String(m.tmdbId)));
        setActorMovies(matched);
      } else {
        setPerson({ name: actorName });
        setActorMovies([]);
      }
    } catch (e) {
      setPerson({ name: actorName });
      setActorMovies([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !actorName) return null;

  return (
    <div className="fixed inset-0 z-[95] bg-neutral-950 text-white overflow-y-auto animate-fade-in p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <button onClick={onClose} className="flex items-center gap-2 text-xs font-extrabold text-gray-400 hover:text-white transition">
          <ArrowLeft className="w-4 h-4" /> BACK TO MOVIE
        </button>

        {/* Actor Info Hero */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-neutral-900 border border-white/10 rounded-2xl p-6 shadow-2xl">
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-2 border-red-600 shadow-xl shrink-0">
            {person?.profile_path ? (
              <img src={`https://image.tmdb.org/t/p/w185${person.profile_path}`} alt={actorName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-white/10 flex items-center justify-center text-3xl font-extrabold text-gray-400">
                {actorName.split(' ').map(x => x[0]).join('').substring(0, 2)}
              </div>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <span className="px-2.5 py-0.5 bg-red-600/20 text-red-400 border border-red-600/40 rounded-full text-[10px] font-bold uppercase">
              {person?.known_for_department || 'ACTOR'}
            </span>
            <h1 className="text-3xl font-black text-white">{actorName}</h1>
            <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">{person?.biography || 'No biography available.'}</p>
          </div>
        </div>

        {/* Actor's Movies Grid */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Film className="w-5 h-5 text-red-600" /> Movies on Cineflix featuring {actorName}
          </h2>

          {loading ? (
            <div className="text-center py-12 text-xs font-bold text-gray-500 tracking-widest animate-pulse">
              SEARCHING CATALOG FOR ACTOR MOVIES...
            </div>
          ) : actorMovies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {actorMovies.map(m => (
                <div
                  key={m.id}
                  onClick={() => { onOpenMovie(m); onClose(); }}
                  className="group relative aspect-[2/3] bg-neutral-900 rounded-xl overflow-hidden cursor-pointer border border-white/10 hover:border-red-600 transition"
                >
                  <img src={m.poster} alt={m.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="text-[10px] text-gray-400 block">{m.year}</span>
                    <h3 className="text-sm font-bold text-white line-clamp-1">{m.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-xs text-gray-500">
              {actorName} රඟපෑ චිත්‍රපට කිසිවක් දැනට අපගේ Database එකෙහි සොයාගත නොහැකි විය.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
