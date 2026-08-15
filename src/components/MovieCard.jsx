import React from 'react';
import { Star, Play } from 'lucide-react';

export default function MovieCard({ movie, onSelect, onOpenWhatsAppDl }) {
  return (
    <div
      onClick={() => onSelect(movie)}
      className="movie-card-index group relative rounded-xl overflow-hidden cursor-pointer bg-[#1A1A1A] border border-gray-800/80 flex flex-col h-full select-none"
    >
      {/* Poster Image with strict 2:3 Aspect Ratio and hover zoom */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-black">
        <img
          src={movie.poster || movie.backdrop || 'https://via.placeholder.com/300x450?text=No+Poster'}
          alt={movie.title}
          className="mc-img-zoom w-full h-full object-cover transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Bottom Dark Gradient Overlay matching index (45).html */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-90"></div>

        {/* Center Hover Play Circle Icon from index (45).html */}
        <div className="mc-play-circle mc-play-overlay">
          <Play className="w-4 h-4 fill-white text-white ml-0.5" />
        </div>

        {/* Top Badges: Quality on Top-Left, Gold Rating on Top-Right */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none z-10">
          {/* Top Left: Quality Badge */}
          <span className="px-2 py-0.5 rounded bg-[#E8262A] font-extrabold text-[10px] text-white uppercase tracking-wider shadow font-['Bebas_Neue']">
            {movie.quality || 'WEB-RIP'}
          </span>

          {/* Top Right: Gold Star IMDb Rating Badge */}
          <span className="px-1.5 py-0.5 rounded bg-[#F5C518] text-black font-extrabold text-[10px] flex items-center gap-1 shadow-md">
            <Star className="w-2.5 h-2.5 fill-black text-black" />
            {movie.rating || 'N/A'}
          </span>
        </div>
      </div>

      {/* Card Info Footer */}
      <div className="p-2 flex flex-col justify-between flex-1 space-y-1">
        <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold">
          <span>{movie.year || '2026'}</span>
          <span className="uppercase text-[9px] text-[#E8262A] font-extrabold">
            {movie.type || 'movie'}
          </span>
        </div>

        <h3
          className="text-[11.5px] font-extrabold text-white line-clamp-2 leading-tight group-hover:text-[#E8262A] transition-colors"
          title={movie.title}
        >
          {movie.title}
        </h3>
      </div>

    </div>
  );
}
