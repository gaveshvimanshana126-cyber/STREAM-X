import React, { useState, useMemo } from 'react';
import MovieCard from './MovieCard.jsx';
import { Filter, ChevronDown } from 'lucide-react';

export default function MovieGrid({ movies = [], onSelectMovie, onOpenWhatsAppDl, activeType = 'all' }) {
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [displayCount, setDisplayCount] = useState(36);

  // Filter & Sort logic
  const filteredMovies = useMemo(() => {
    return (movies || [])
      .filter(movie => {
        if (!movie) return false;
        if (activeType && activeType !== 'all' && movie.type !== activeType) return false;
        if (selectedGenre !== 'all' && (!movie.genre || !movie.genre.toLowerCase().includes(selectedGenre.toLowerCase()))) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0);
        if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
        return (b.addedAt || b.year || 0) - (a.addedAt || a.year || 0);
      });
  }, [movies, activeType, selectedGenre, sortBy]);

  const visibleMovies = filteredMovies.slice(0, displayCount);

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4">
      {/* Section Title matching index (45).html screenshot: | MOVIES */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-1.5 h-6 bg-red-600 rounded-sm"></div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider font-mono">
            MOVIES
            <span className="ml-2 text-xs font-sans text-gray-400 font-normal">
              ({filteredMovies.length} titles)
            </span>
          </h2>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-neutral-900 border border-white/10 text-gray-300 text-[11px] font-bold rounded-xl px-3 py-1.5 pr-7 focus:outline-none focus:border-red-500 cursor-pointer"
            >
              <option value="latest">Sort: Latest</option>
              <option value="rating">Sort: Top Rated</option>
              <option value="title">Sort: Title (A-Z)</option>
            </select>
            <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Grid Display: Exactly 3 Columns on Mobile matching index (45).html screenshot */}
      {visibleMovies.length > 0 ? (
        <>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-4">
            {visibleMovies.map((movie) => (
              <MovieCard
                key={movie.id || movie.tmdbId}
                movie={movie}
                onSelect={onSelectMovie}
                onOpenWhatsAppDl={onOpenWhatsAppDl}
              />
            ))}
          </div>

          {/* Load More Button */}
          {displayCount < filteredMovies.length && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => setDisplayCount(prev => prev + 36)}
                className="px-6 py-2.5 rounded-full bg-neutral-900 hover:bg-red-600 border border-white/10 hover:border-red-500 text-white font-bold text-xs shadow-xl transition-all cursor-pointer"
              >
                Load More Movies ({filteredMovies.length - displayCount} remaining)
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 bg-neutral-900/40 rounded-3xl border border-white/10">
          <Filter className="w-10 h-10 text-gray-600 mx-auto mb-2" />
          <h3 className="text-base font-bold text-white mb-1">No movies found</h3>
          <p className="text-xs text-gray-400">Try adjusting your filters or search keywords.</p>
        </div>
      )}
    </section>
  );
}
