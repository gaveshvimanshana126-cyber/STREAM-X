import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar.jsx';
import HeroSlider from './components/HeroSlider.jsx';
import CategoryFilter from './components/CategoryFilter.jsx';
import MovieGrid from './components/MovieGrid.jsx';
import MovieDetailModal from './components/MovieDetailModal.jsx';
import SubtitleDownloadModal from './components/SubtitleDownloadModal.jsx';
import WhatsAppDownloadModal from './components/WhatsAppDownloadModal.jsx';
import RequestMovieModal from './components/RequestMovieModal.jsx';
import AdminLoginModal from './components/AdminLoginModal.jsx';
import AdminPanel from './components/AdminPanel.jsx';
import LoadingScreen from './components/LoadingScreen.jsx';
import { getMovies, saveMovies } from './data/moviesData.js';

export default function App() {
  const [movies, setMovies] = useState(getMovies());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all_movies');
  const [selectedYear, setSelectedYear] = useState('all');

  // Loading Screen State from index (45).html
  const [isLoading, setIsLoading] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Selected Movie State with Clean Pathname URL Sync
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [subDlMovie, setSubDlMovie] = useState(null);

  // Admin Auth State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  // Modals state
  const [whatsappDlMovie, setWhatsappDlMovie] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);

  useEffect(() => {
    // Initial loading timer matching index (45).html
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Parse Clean URL Pathname & Query Params (/admin, /subdetails/..., /q=..., /category=..., /year=..., or /movie-name)
  useEffect(() => {
    const handleUrlChange = () => {
      const pathname = decodeURIComponent(window.location.pathname.replace(/^\/|\/$/g, ''));
      
      // 0. Admin URL Trigger: /admin or /admin-panel
      if (pathname === 'admin' || pathname === 'admin-panel') {
        setSelectedMovie(null);
        setSubDlMovie(null);
        if (isAdminLoggedIn) {
          setShowAdmin(true);
        } else {
          setShowAdminLogin(true);
        }
        return;
      }

      // 1. Subtitle Download Flow Trigger: /subdetails/movie-slug or /subdlmovie/movie-slug
      if (pathname.startsWith('subdetails/') || pathname.startsWith('subdlmovie/')) {
        const movieSlug = pathname.replace(/^subdetails\/|^subdlmovie\//, '');
        const found = movies.find(m => {
          const slug = m.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
          return slug === movieSlug || m.id?.toString() === movieSlug;
        });
        if (found) {
          setSubDlMovie(found);
          setSelectedMovie(null);
        }
        return;
      }

      // 2. Search Query Sync: /q=keyword
      if (pathname.startsWith('q=')) {
        const query = pathname.replace('q=', '');
        setSearchTerm(query);
        setSelectedMovie(null);
        setSubDlMovie(null);
        return;
      }

      // 3. Category Pill Sync: /category=cat_name
      if (pathname.startsWith('category=')) {
        const catSlug = pathname.replace('category=', '');
        if (catSlug === 'tv-series' || catSlug === 'all_series') setSelectedCategory('all_series');
        else if (catSlug === 'movies' || catSlug === 'all_movies') setSelectedCategory('all_movies');
        else if (catSlug === '18-plus' || catSlug === '18+') setSelectedCategory('18+');
        else {
          const matchingCat = catSlug.charAt(0).toUpperCase() + catSlug.slice(1);
          setSelectedCategory(matchingCat);
        }
        setSelectedMovie(null);
        setSubDlMovie(null);
        return;
      }

      // 4. Year Selector Sync: /year=2026
      if (pathname.startsWith('year=')) {
        const yr = pathname.replace('year=', '');
        setSelectedYear(yr);
        setSelectedMovie(null);
        setSubDlMovie(null);
        return;
      }

      // 5. Direct Movie Page Sync: /movie-name
      if (pathname && !pathname.startsWith('q=') && !pathname.startsWith('category=') && !pathname.startsWith('year=')) {
        const found = movies.find(m => {
          const slug = m.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
          return slug === pathname || m.id?.toString() === pathname;
        });
        if (found) {
          setSelectedMovie(found);
          setSubDlMovie(null);
        } else {
          setSelectedMovie(null);
          setSubDlMovie(null);
        }
      } else {
        setSelectedMovie(null);
        setSubDlMovie(null);
      }
    };

    handleUrlChange();
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, [movies, isAdminLoggedIn]);

  const handleAdminTrigger = () => {
    window.history.pushState({}, '', '/admin');
    if (isAdminLoggedIn) {
      setShowAdmin(true);
    } else {
      setShowAdminLogin(true);
    }
  };

  // Handle Subtitle Download Flow Open
  const handleOpenSubDl = (movie) => {
    const slug = movie.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    window.history.pushState({}, '', `/subdetails/${slug}`);
    setSubDlMovie(movie);
    setSelectedMovie(null);
  };

  // Handle Category Selection with Live URL Sync (/category=name)
  const handleSelectCategory = (catId) => {
    setSelectedCategory(catId);
    let catSlug = catId.toLowerCase();
    if (catId === 'all_series') catSlug = 'tv-series';
    if (catId === 'all_movies') catSlug = 'movies';
    if (catId === '18+') catSlug = '18-plus';

    if (catId === 'all_movies') {
      window.history.pushState({}, '', '/');
    } else {
      window.history.pushState({}, '', `/category=${catSlug}`);
    }
  };

  // Handle Year Selection with Live URL Sync (/year=2026)
  const handleSelectYear = (yr) => {
    setSelectedYear(yr);
    if (yr === 'all') {
      window.history.pushState({}, '', '/');
    } else {
      window.history.pushState({}, '', `/year=${yr}`);
    }
  };

  // Handle Search Term Change with Live URL Sync (/q=query)
  const handleSearchChange = (term) => {
    setSearchTerm(term);
    if (term.trim()) {
      window.history.pushState({}, '', `/q=${encodeURIComponent(term.trim())}`);
    } else {
      window.history.pushState({}, '', '/');
    }
  };

  const handleSelectMovie = (movie) => {
    if (movie) {
      const slug = movie.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      window.history.pushState({}, '', `/${slug}`);
      setSelectedMovie(movie);
      window.scrollTo(0, 0);
    } else {
      window.history.pushState({}, '', '/');
      setSelectedMovie(null);
      window.scrollTo(0, 0);
    }
  };

  const handleSaveMovies = (newMoviesList) => {
    setMovies(newMoviesList);
    saveMovies(newMoviesList);
  };

  // Filter movies by search term, category pill, and year dropdown matching index (45).html
  const filteredMovies = useMemo(() => {
    return movies.filter((m) => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchTitle = m.title && m.title.toLowerCase().includes(q);
        const matchGenre = m.genre && m.genre.toLowerCase().includes(q);
        const matchCast = m.cast && m.cast.toLowerCase().includes(q);
        const matchYear = m.year && m.year.toString().includes(q);
        if (!matchTitle && !matchGenre && !matchCast && !matchYear) return false;
      }

      if (selectedCategory === 'all_movies' && m.type === 'series') return false;
      if (selectedCategory === 'all_series' && m.type !== 'series') return false;
      if (selectedCategory === 'trending' && (!m.rating || parseFloat(m.rating) < 7.0)) return false;
      if (
        selectedCategory !== 'all_movies' &&
        selectedCategory !== 'all_series' &&
        selectedCategory !== 'trending'
      ) {
        if (!m.genre || !m.genre.toLowerCase().includes(selectedCategory.toLowerCase())) return false;
      }

      if (selectedYear !== 'all' && m.year.toString() !== selectedYear) return false;

      return true;
    });
  }, [movies, searchTerm, selectedCategory, selectedYear]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-gray-100 selection:bg-[#E8262A] selection:text-white">
      
      {/* 0. Film Reel Initial Loading Screen matching index (45).html */}
      {isLoading && <LoadingScreen isFadingOut={isFadingOut} />}

      {/* 1. Top Floating Glass Navbar matching index (45).html */}
      <Navbar
        searchTerm={searchTerm}
        setSearchTerm={handleSearchChange}
        onOpenAdmin={handleAdminTrigger}
        onOpenRequest={() => setShowRequestModal(true)}
      />

      {/* Main Content Container */}
      <main className="flex-1 pb-16">
        
        {/* If Subtitle Download Flow is active, render 3-step Subtitle Download View */}
        {subDlMovie ? (
          <SubtitleDownloadModal
            movie={subDlMovie}
            onClose={() => {
              setSubDlMovie(null);
              window.history.pushState({}, '', '/');
            }}
          />
        ) : selectedMovie ? (
          /* If Movie is selected, render full-page Movie Details with clean URL (/movie-name) */
          <MovieDetailModal
            movie={selectedMovie}
            onClose={() => handleSelectMovie(null)}
            onOpenWhatsAppDl={(m) => setWhatsappDlMovie(m)}
            onOpenSubDl={(m) => handleOpenSubDl(m)}
          />
        ) : (
          <>
            {/* 2. Featured Hero Carousel matching index (45).html */}
            {!searchTerm && (
              <HeroSlider
                movies={movies}
                onSelectMovie={handleSelectMovie}
                onOpenWhatsAppDl={setWhatsappDlMovie}
              />
            )}

            {/* 3. Category Pills & Year Selector Bar */}
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={handleSelectCategory}
              selectedYear={selectedYear}
              onSelectYear={handleSelectYear}
            />

            {/* 4. Movie Catalog Grid */}
            <MovieGrid
              movies={filteredMovies}
              onSelectMovie={handleSelectMovie}
              onOpenWhatsAppDl={setWhatsappDlMovie}
              activeType="all"
            />
          </>
        )}

      </main>

      {/* Footer matching index (45).html */}
      <footer className="border-t border-gray-800/80 bg-[#060404] py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <div className="space-y-1 text-center sm:text-left">
            <p className="text-white font-bold text-base tracking-wider uppercase font-['Bebas_Neue']">
              CINE<span className="text-[#E8262A]">FLIX</span> LK
            </p>
            <p className="text-gray-400">ලංකාවේ #1 Sinhala Subtitle අඩවිය • Watch Movies & TV Series Online Free.</p>
          </div>

          <div className="flex items-center space-x-4">
            <button onClick={handleAdminTrigger} className="hover:text-white transition-colors">
              Admin Login
            </button>
          </div>
        </div>
      </footer>

      {/* WhatsApp Modal & Other Popups */}
      {whatsappDlMovie && (
        <WhatsAppDownloadModal
          movie={whatsappDlMovie}
          onClose={() => setWhatsappDlMovie(null)}
        />
      )}

      {showRequestModal && (
        <RequestMovieModal
          onClose={() => setShowRequestModal(false)}
        />
      )}

      {/* Admin Login Modal (Credentials: cineflix2008 / cineflixth2008) */}
      {showAdminLogin && (
        <AdminLoginModal
          onLoginSuccess={() => {
            setIsAdminLoggedIn(true);
            setShowAdminLogin(false);
            setShowAdmin(true);
          }}
          onClose={() => {
            setShowAdminLogin(false);
            window.history.pushState({}, '', '/');
          }}
        />
      )}

      {/* Admin Control Panel */}
      {showAdmin && (
        <AdminPanel
          movies={movies}
          onSaveMovies={handleSaveMovies}
          onLogout={() => {
            setIsAdminLoggedIn(false);
            setShowAdmin(false);
            window.history.pushState({}, '', '/');
          }}
          onClose={() => {
            setShowAdmin(false);
            window.history.pushState({}, '', '/');
          }}
        />
      )}

    </div>
  );
}
