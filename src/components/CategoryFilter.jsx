import React from 'react';

const CATEGORIES = [
  { id: 'all_movies', label: 'Movies' },
  { id: 'all_series', label: 'TV Series' },
  { id: 'trending', label: 'Trending' },
  { id: 'Action', label: 'Action' },
  { id: 'Romance', label: 'Romance' },
  { id: 'Comedy', label: 'Comedy' },
  { id: 'Horror', label: 'Horror' },
  { id: 'Thriller', label: 'Thriller' },
  { id: 'Drama', label: 'Drama' },
  { id: 'Crime', label: 'Crime' },
  { id: 'Sci-Fi', label: 'Sci-Fi' },
  { id: 'Fantasy', label: 'Fantasy' },
  { id: 'Adventure', label: 'Adventure' },
  { id: 'Mystery', label: 'Mystery' },
  { id: 'Biography', label: 'Biography' },
  { id: 'History', label: 'History' },
  { id: 'Sport', label: 'Sport' },
  { id: 'War', label: 'War' },
  { id: 'Music', label: 'Music' },
  { id: 'Family', label: 'Family' },
  { id: 'Documentary', label: 'Documentary' },
  { id: '18+', label: '18+' }
];

const YEARS = ['all', '2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018'];

export default function CategoryFilter({
  selectedCategory,
  onSelectCategory,
  selectedYear,
  onSelectYear
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-2 space-y-3">
      {/* Category Pills Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          const is18Plus = cat.id === '18+';

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                isActive
                  ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/40 transform scale-105'
                  : is18Plus
                  ? 'bg-red-950/60 border-red-500/50 text-red-400 hover:bg-red-600 hover:text-white'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-300 hover:text-white'
              }`}
            >
              {is18Plus && <span className="w-2 h-2 rounded-full bg-red-500 inline-block mr-1.5 animate-ping"></span>}
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Year Selector Dropdown */}
      <div className="flex items-center space-x-3">
        <div className="relative">
          <select
            value={selectedYear}
            onChange={(e) => onSelectYear(e.target.value)}
            className="appearance-none bg-neutral-900 border border-white/10 text-gray-300 text-xs font-bold rounded-full px-4 py-1.5 pr-8 focus:outline-none focus:border-red-500 cursor-pointer"
          >
            <option value="all">All Years</option>
            {YEARS.filter(y => y !== 'all').map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none border-l-4 border-r-4 border-t-4 border-transparent border-t-red-500 w-0 h-0"></div>
        </div>

        {selectedYear !== 'all' && (
          <button
            onClick={() => onSelectYear('all')}
            className="text-xs font-bold text-red-500 hover:text-red-400 underline cursor-pointer"
          >
            Clear Year
          </button>
        )}
      </div>
    </div>
  );
}
