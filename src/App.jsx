import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar.jsx';
import HeroSlider from './components/HeroSlider.jsx';
import CategoryFilter from './components/CategoryFilter.jsx';
import MovieGrid from './components/MovieGrid.jsx';
import MovieDetailModal from './components/MovieDetailModal.jsx';
import EpisodeDetailModal from './components/EpisodeDetailModal.jsx';
import PixeldrainDownloadModal from './components/PixeldrainDownloadModal.jsx';
import RequestCenterModal from './components/RequestCenterModal.jsx';
import NotificationPanel from './components/NotificationPanel.jsx';
import AuthModal from './components/AuthModal.jsx';
import ProfileModal from './components/ProfileModal.jsx';
import UpcomingMoviesPage from './components/UpcomingMoviesPage.jsx';
import AboutPage from './components/AboutPage.jsx';
import GenresPage from './components/GenresPage.jsx';
import ActorsPage from './components/ActorsPage.jsx';
import FullCastPage from './components/FullCastPage.jsx';
import AdminPanel from './components/AdminPanel.jsx';
import AdminLoginModal from './components/AdminLoginModal.jsx';
import LoadingScreen from './components/LoadingScreen.jsx';

import { getMovies } from './data/moviesData.js';
import { subscribeRtdb, trackVisitor, setAuthToken } from './services/firebase.js';

export default function App() {
  const [movies, setMovies] = useState(getMovies());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all_movies');
  const [selectedYear, setSelectedYear] = useState('all');

  // Loading Screen State
  const [isLoading, setIsLoading] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  // User Auth & Session
  const [currentUser, setCurrentUser] = useState(null);

  // Active Modals & Views State
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [pixeldrainUrl, setPixeldrainUrl] = useState(null);
  const [selectedActor, setSelectedActor] = useState(null);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotifsPanel, setShowNotifsPanel] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showUpcomingPage, setShowUpcomingPage] = useState(false);
  const [showAboutPage, setShowAboutPage] = useState(false);
  const [showGenresPage, setShowGenresPage] = useState(false);
  const [showFullCastPage, setShowFullCastPage] = useState(false);

  // Admin Panel State
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  // Toast Notification
  const [toastMsg, setToastMsg] = useState(null);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Restore User Session & Track Visitor
  useEffect(() => {
    trackVisitor();

    try {
      const savedUser = JSON.parse(sessionStorage.getItem('cf_user') || 'null');
      if (savedUser && savedUser.uid) {
        setCurrentUser(savedUser);
        if (savedUser.idToken) setAuthToken(savedUser.idToken);
      }
    } catch (e) { }

    // Initial Loading Screen Timer
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  // Firebase Realtime DB Live Sync for Movies
  useEffect(() => {
    const unsubscribe = subscribeRtdb('movies', (remoteData) => {
      if (remoteData && typeof remoteData === 'object') {
        const movieArray = Object.values(remoteData);
        if (movieArray.length > 0) {
          setMovies(movieArray);
        }
      }
    }, 15000);

    return () => unsubscribe();
  }, []);

  // Clean URL Routing Synchronizer
  useEffect(() => {
    const handleUrlChange = () => {
      const pathname = decodeURIComponent(window.location.pathname.replace(/^\/|\/$/g, ''));

      // Reset views
      setShowAdmin(false);
      setShowAdminLogin(false);

      if (pathname === 'admin' || pathname === 'admin-panel') {
        if (currentUser?.isAdmin) setShowAdmin(true);
        else setShowAdminLogin(true);
        return;
      }

      if (pathname === 'cirequest' || pathname === 'request') {
        setShowRequestModal(true);
        return;
      }

      if (pathname === 'upcoming') {
        setShowUpcomingPage(true);
        return;
      }

      if (pathname === 'genre') {
        setShowGenresPage(true);
        return;
      }

      if (pathname === 'about') {
        setShowAboutPage(true);
        return;
      }

      if (pathname === 'actersspagefull') {
        setShowFullCastPage(true);
        return;
      }

      // Check Direct Movie Path
      if (pathname && !pathname.includes('=')) {
        const found = movies.find(m => {
          const slug = m.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
          return slug === pathname || m.id?.toString() === pathname;
        });
        if (found) {
          setSelectedMovie(found);
        }
      }
    };

    handleUrlChange();
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, [movies, currentUser]);

  // Filter Logic matching index (45).html
  const filteredMovies = useMemo(() => {
    return movies.filter(movie => {
      // 1. Search Query Filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const titleMatch = movie.title?.toLowerCase().includes(query);
        const castMatch = movie.cast?.toLowerCase().includes(query) || movie.stars?.toLowerCase().includes(query);
        const directorMatch = movie.director?.toLowerCase().includes(query);
        if (!titleMatch && !castMatch && !directorMatch) return false;
      }

      // 2. Year Filter
      if (selectedYear !== 'all' && movie.year !== selectedYear) {
        return false;
      }

      // 3. Category / Genre Filter
      if (selectedCategory === 'all_movies') {
        return !movie.type || movie.type === 'movie';
      }
      if (selectedCategory === 'all_series') {
        return movie.type === 'tv' || movie.type === 'series' || movie.type === 'tv-series';
      }
      if (selectedCategory === 'trending') {
        return (movie.views || 0) > 10 || parseFloat(movie.rating || 0) >= 8.0;
      }

      // Genre specific matching
      if (movie.genre) {
        return movie.genre.toLowerCase().includes(selectedCategory.toLowerCase());
      }

      return true;
    });
  }, [movies, searchTerm, selectedCategory, selectedYear]);

  return (
    <div className="min-h-screen bg-[#090a0f] text-gray-100 selection:bg-red-600 selection:text-white font-sans">
      {/* Loading Screen */}
      {isLoading && <LoadingScreen isFadingOut={isFadingOut} />}

      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 right-4 z-[120] bg-neutral-900 border border-red-600/50 text-white px-4 py-3 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2 animate-bounce">
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenNotifs={() => setShowNotifsPanel(true)}
        onOpenRequests={() => setShowRequestModal(true)}
        onOpenUpcoming={() => setShowUpcomingPage(true)}
        onOpenGenres={() => setShowGenresPage(true)}
        onOpenAbout={() => setShowAboutPage(true)}
        onOpenAdmin={() => {
          if (currentUser?.isAdmin) setShowAdmin(true);
          else setShowAdminLogin(true);
        }}
        currentUser={currentUser}
      />

      {/* Hero Featured Slider */}
      {!searchTerm && selectedCategory === 'all_movies' && selectedYear === 'all' && (
        <HeroSlider
          movies={movies}
          onSelectMovie={(m) => setSelectedMovie(m)}
        />
      )}

      {/* Category & Year Filters */}
      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
        selectedYear={selectedYear}
        onSelectYear={(yr) => setSelectedYear(yr)}
      />

      {/* Movie Catalog Grid */}
      <main className="max-w-7xl mx-auto px-4 pb-16">
        <MovieGrid
          movies={filteredMovies}
          onSelectMovie={(m) => setSelectedMovie(m)}
        />
      </main>

      {/* Modals & Sub-pages */}
      {selectedMovie && (
        <MovieDetailModal
          movie={{ ...selectedMovie, allMovies: movies }}
          onClose={() => setSelectedMovie(null)}
          onOpenPixeldrain={(url) => setPixeldrainUrl(url)}
          onOpenEpisode={(m, ep, sName) => setSelectedEpisode({ movie: m, episode: ep, seasonName: sName })}
          onSelectMovie={(m) => setSelectedMovie(m)}
          onToast={triggerToast}
        />
      )}

      {selectedEpisode && (
        <EpisodeDetailModal
          isOpen={!!selectedEpisode}
          onClose={() => setSelectedEpisode(null)}
          movie={selectedEpisode.movie}
          episode={selectedEpisode.episode}
          seasonName={selectedEpisode.seasonName}
          onSelectEpisode={(ep, sName) => setSelectedEpisode({ ...selectedEpisode, episode: ep, seasonName: sName })}
          onOpenPixeldrain={(url) => setPixeldrainUrl(url)}
          onToast={triggerToast}
        />
      )}

      {pixeldrainUrl && (
        <PixeldrainDownloadModal
          isOpen={!!pixeldrainUrl}
          onClose={() => setPixeldrainUrl(null)}
          downloadUrl={pixeldrainUrl}
          onToast={triggerToast}
        />
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          triggerToast(`✓ Welcome back, ${user.displayName}!`);
        }}
      />

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={currentUser}
        onLogout={() => {
          setCurrentUser(null);
          sessionStorage.removeItem('cf_user');
          triggerToast('Logged out');
        }}
        movies={movies}
        onOpenMovie={(m) => setSelectedMovie(m)}
      />

      <NotificationPanel
        isOpen={showNotifsPanel}
        onClose={() => setShowNotifsPanel(false)}
        isAdmin={currentUser?.isAdmin}
        movies={movies}
        onOpenMovie={(m) => setSelectedMovie(m)}
      />

      <RequestCenterModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onToast={triggerToast}
      />

      <UpcomingMoviesPage
        isOpen={showUpcomingPage}
        onClose={() => setShowUpcomingPage(false)}
      />

      <AboutPage
        isOpen={showAboutPage}
        onClose={() => setShowAboutPage(false)}
      />

      <GenresPage
        isOpen={showGenresPage}
        onClose={() => setShowGenresPage(false)}
        onSelectGenre={(genre) => setSelectedCategory(genre)}
        movies={movies}
      />

      <ActorsPage
        isOpen={!!selectedActor}
        onClose={() => setSelectedActor(null)}
        actorName={selectedActor}
        movies={movies}
        onOpenMovie={(m) => setSelectedMovie(m)}
      />

      <FullCastPage
        isOpen={showFullCastPage}
        onClose={() => setShowFullCastPage(false)}
        movies={movies}
        onSelectActor={(actorName) => setSelectedActor(actorName)}
      />

      {/* Admin Logins & Panel */}
      {showAdminLogin && (
        <AdminLoginModal
          isOpen={showAdminLogin}
          onClose={() => setShowAdminLogin(false)}
          onLoginSuccess={() => {
            setShowAdminLogin(false);
            setShowAdmin(true);
          }}
        />
      )}

      {showAdmin && (
        <AdminPanel
          movies={movies}
          onRefreshMovies={() => {
            // Refreshed via live subscription
          }}
          onClose={() => setShowAdmin(false)}
          onLogout={() => {
            setShowAdmin(false);
            triggerToast('Admin logged out');
          }}
        />
      )}
    </div>
  );
}
