import React, { useState, useEffect } from 'react';
import { Play, Star } from 'lucide-react';

export default function HeroSlider({ movies, onSelectMovie, onOpenWhatsAppDl }) {
  const featuredMovies = movies.slice(0, 5);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (featuredMovies.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [featuredMovies.length]);

  if (featuredMovies.length === 0) return null;

  const current = featuredMovies[currentIndex];

  return (
    <div className="relative w-full h-[480px] sm:h-[580px] overflow-hidden bg-black mb-6">
      
      {/* Background Slides with smooth transition */}
      {featuredMovies.map((movie, idx) => (
        <div
          key={movie.id || idx}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentIndex ? 'opacity-100 z-0' : 'opacity-0 -z-10'
          }`}
        >
          <img
            src={movie.backdrop || movie.poster}
            alt={movie.title}
            className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-10000 ease-out"
          />
          {/* Gradient Overlay matching index (45).html */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/90 via-[#0A0A0A]/60 to-transparent w-full md:w-3/4"></div>
        </div>
      ))}

      {/* Content Container aligned to the side matching index (45).html */}
      <div className="relative w-full h-full px-5 sm:px-10 lg:px-16 flex items-end pb-10 sm:pb-14 z-10">
        <div key={currentIndex} className="max-w-xl space-y-3">
          
          {/* Badge line: MOVIE • POPULAR */}
          <div className="animate-hero-badge flex items-center space-x-2">
            <span className="text-[#E8262A] font-extrabold text-xs tracking-widest uppercase font-['Bebas_Neue'] text-[13px]">
              {current.type === 'series' ? 'TV SERIES • POPULAR' : 'MOVIE • POPULAR'}
            </span>
          </div>

          {/* Title */}
          <h1 className="animate-hero-title text-3xl sm:text-5xl font-black text-white font-['Poppins'] tracking-tight leading-none drop-shadow-md">
            {current.title}
          </h1>

          {/* Meta Info */}
          <div className="animate-hero-meta flex items-center space-x-2.5 text-xs font-bold text-gray-300">
            <span>{current.year || '2026'}</span>
            <span className="text-[#E8262A] font-black">•</span>
            <span className="uppercase text-red-400 font-extrabold">{current.quality || 'WEB-RIP'}</span>
            {current.rating && (
              <>
                <span className="text-[#E8262A] font-black">•</span>
                <span className="flex items-center gap-1 text-yellow-400 font-black">
                  <Star className="w-3.5 h-3.5 fill-yellow-400" />
                  {current.rating}
                </span>
              </>
            )}
          </div>

          {/* Description */}
          <p className="animate-hero-desc text-xs sm:text-sm text-gray-300/90 line-clamp-2 leading-relaxed font-sans max-w-lg">
            {current.description || 'No description available for this title.'}
          </p>

          {/* Solid Red Watch Now Button matching index (45).html screenshot */}
          <div className="animate-hero-btn pt-2">
            <button
              onClick={() => onSelectMovie(current)}
              className="px-8 py-3 rounded-full bg-[#E8262A] hover:bg-[#B01E21] text-white font-extrabold text-sm flex items-center space-x-2.5 shadow-xl shadow-red-600/40 transition-all transform hover:scale-105 cursor-pointer active:scale-95"
            >
              <Play className="w-4 h-4 fill-white text-white" />
              <span>Watch Now</span>
            </button>
          </div>

        </div>
      </div>

      {/* Hero Slide Dots on Bottom Right */}
      <div className="absolute bottom-6 right-6 sm:right-12 flex items-center space-x-2 z-20">
        {featuredMovies.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              currentIndex === idx ? 'w-6 bg-[#E8262A]' : 'w-1.5 bg-white/30 hover:bg-white'
            }`}
          />
        ))}
      </div>

    </div>
  );
}
