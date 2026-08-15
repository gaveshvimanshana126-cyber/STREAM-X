import React, { useState } from 'react';
import { Search, Calendar, Bookmark, Bell, Grid, X, Settings, Send, ExternalLink } from 'lucide-react';

const CINEFLIX_LOGO_URL = 'https://raw.githubusercontent.com/gaveshvimanshna633-a11y/STREAM-X/refs/heads/main/file_000000000d6c720bba300c66d140d268.png';

export default function Navbar({
  searchTerm,
  setSearchTerm,
  onOpenAdmin,
  onOpenRequest,
  bookmarkedCount = 0
}) {
  const [showSearch, setShowSearch] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  return (
    <nav className="fixed top-2 left-2 right-2 sm:top-2.5 sm:left-2.5 sm:right-2.5 z-50 h-14 sm:h-16 px-2.5 sm:px-3.5 rounded-2xl glass-panel border border-white/10 flex items-center justify-between shadow-2xl transition-all bg-[rgba(20,10,10,0.85)] backdrop-blur-md">
      
      {/* Official Cineflix Logo Image Section */}
      <div
        className="flex items-center space-x-2 sm:space-x-2.5 cursor-pointer select-none flex-shrink-0"
        onClick={() => { setSearchTerm(''); window.history.pushState({}, '', '/'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
      >
        {/* Official Image Logo replacing 'C' */}
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden bg-red-600 flex items-center justify-center p-0.5 shadow-lg shadow-red-600/40 border border-red-500/50">
          <img
            src={CINEFLIX_LOGO_URL}
            alt="Cineflix Logo"
            className="w-full h-full object-cover rounded-full"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentNode.innerText = 'C';
              e.target.parentNode.className += " font-black font-['Bebas_Neue'] text-lg text-white";
            }}
          />
        </div>

        <div>
          <span className="text-lg sm:text-xl font-black text-white tracking-widest font-['Bebas_Neue'] uppercase leading-none block">
            CINE<span className="text-red-500">FLIX</span>
          </span>
          <span className="hidden xs:block text-[7px] sm:text-[8px] font-bold text-gray-400 tracking-[2px] sm:tracking-[3px] uppercase block -mt-0.5">
            CINEMA WITHOUT LIMITS
          </span>
        </div>
      </div>

      {/* Right Navigation Controls & Right-Aligned Search Bar */}
      <div className="flex items-center space-x-1 sm:space-x-2 relative ml-auto flex-shrink-0">
        
        {/* Search Bar Right-Aligned (Desktop) */}
        <div className="hidden md:flex relative w-44 lg:w-60 mr-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search movies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-900/90 border border-gray-800 rounded-full pl-8 pr-7 py-1 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => { setSearchTerm(''); window.history.pushState({}, '', '/'); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Mobile Search Toggle Button */}
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="md:hidden w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-all"
          title="Search"
        >
          <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        {/* Request Movie Icon */}
        <button
          onClick={onOpenRequest}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-all"
          title="Request Movie"
        >
          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        {/* Bookmarks Icon */}
        <div className="relative">
          <button
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-all"
            title="Saved Bookmarks"
          >
            <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          {bookmarkedCount > 0 && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-red-600 text-white font-black text-[8px] sm:text-[9px] flex items-center justify-center border border-gray-950">
              {bookmarkedCount}
            </span>
          )}
        </div>

        {/* Notifications Icon with 9+ badge */}
        <div className="relative">
          <button
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-all"
            title="Notifications"
          >
            <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <span className="absolute -top-1 -right-1 min-w-3.5 h-3.5 sm:h-4 px-1 rounded-full bg-red-600 text-white font-black text-[8px] sm:text-[9px] flex items-center justify-center border border-gray-950 shadow">
            9+
          </span>
        </div>

        {/* Quick Access Grid Menu Button */}
        <div className="relative">
          <button
            onClick={() => setShowQuickMenu(!showQuickMenu)}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white flex items-center justify-center transition-all border border-white/10"
            title="Quick Access Menu"
          >
            <Grid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Quick Panel Popup */}
          {showQuickMenu && (
            <div className="absolute top-11 sm:top-12 right-0 w-56 glass-panel rounded-2xl p-2 border border-gray-700 shadow-2xl space-y-1 z-50 bg-[#120a0a]">
              <button
                onClick={() => { setShowQuickMenu(false); onOpenAdmin(); }}
                className="w-full p-2.5 rounded-xl hover:bg-white/10 flex items-center space-x-3 text-xs font-bold text-gray-200 text-left transition-all"
              >
                <Settings className="w-4 h-4 text-red-500" />
                <span>Admin Control Panel</span>
              </button>

              <button
                onClick={() => { setShowQuickMenu(false); onOpenRequest(); }}
                className="w-full p-2.5 rounded-xl hover:bg-white/10 flex items-center space-x-3 text-xs font-bold text-gray-200 text-left transition-all"
              >
                <Calendar className="w-4 h-4 text-blue-400" />
                <span>Request Movie</span>
              </button>

              <a
                href="https://t.me/Cineflix_cloud_Bot"
                target="_blank"
                rel="noreferrer"
                className="w-full p-2.5 rounded-xl hover:bg-white/10 flex items-center space-x-3 text-xs font-bold text-blue-400 text-left transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Telegram Bot</span>
                <ExternalLink className="w-3 h-3 ml-auto opacity-70" />
              </a>
            </div>
          )}
        </div>

      </div>

      {/* Mobile Search Overlay */}
      {showSearch && (
        <div className="absolute top-16 left-0 right-0 p-3 bg-[#0d0e14] border-b border-gray-800 flex items-center space-x-2 md:hidden">
          <input
            type="text"
            placeholder="Search movies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-red-500"
          />
          <button onClick={() => setShowSearch(false)} className="p-2 text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

    </nav>
  );
}
