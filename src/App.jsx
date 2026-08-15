import React, { useState, useEffect, useMemo } from 'react';
import NoticeBanner from './components/NoticeBanner.jsx';
import Navbar from './components/Navbar.jsx';
import HeroSlider from './components/HeroSlider.jsx';
import CategoryFilter from './components/CategoryFilter.jsx';
import MovieGrid from './components/MovieGrid.jsx';
import MovieDetailModal from './components/MovieDetailModal.jsx';
import MovieDownloadFlowModal from './components/MovieDownloadFlowModal.jsx';
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
import WhatsAppDeliveryModal from './components/WhatsAppDeliveryModal.jsx';

import { getMovies } from './data/moviesData.js';
import { subscribeRtdb, trackVisitor, setAuthToken, rtdbGet } from './services/firebase.js';

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
  const [downloadFlowData, setDownloadFlowData] = useState(null);
  const [waDeliveryData, setWaDeliveryData] = useState(null); // { movie, quality }
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

  // Centralized Movie Selection with Clean URL PushState (/movie-slug)
  const handleSelectMovie = (movie) => {
    if (movie) {
      const slug = movie.title ? movie.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : movie.id;
      window.history.pushState({ movieId: movie.id }, '', '/' + slug);
      setSelectedMovie(movie);
      setDownloadFlowData(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.history.pushState({}, '', '/');
      setSelectedMovie(null);
      setDownloadFlowData(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Open 3-Step Download Flow (Movie or Subtitle)
  const handleOpenDownloadFlow = (movie, quality = '1080p', type = 'movie') => {
    setDownloadFlowData({ movie, quality, type });
    setSelectedMovie(null);
  };

  // Restore User Session & Initial Live DB Load
  useEffect(() => {
    trackVisitor();

    try {
      const savedUser = JSON.parse(sessionStorage.getItem('cf_user') || 'null');
      if (savedUser && savedUser.uid) {
        setCurrentUser(savedUser);
        if (savedUser.idToken) setAuthToken(savedUser.idToken);
      }
    } catch (e) { }

    // Direct initial RTDB Load for Instant Movies
    rtdbGet('movies').then(remoteData => {
      if (remoteData && typeof remoteData === 'object') {
        const movieArray = Object.entries(remoteData).map(([key, val]) => ({
          id: val.id || key,
          ...val
        })).filter(Boolean);
        if (movieArray.length > 0) setMovies(movieArray);
      }
    }).catch(() => {});

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
        const movieArray = Object.entries(remoteData).map(([key, val]) => ({
          id: val.id || key,
          ...val
        })).filter(Boolean);

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

      // Check Download Flow URL Pathnames (/subdetails/..., /loaddl/..., /dldetils/..., /dlmovie/...)
      if (pathname.startsWith('subdetails/') || pathname.startsWith('loaddl/') || pathname.startsWith('dldetils/') || pathname.startsWith('dlmovie/')) {
        const movieSlug = pathname.replace(/^(subdetails|loaddl|dldetils|dlmovie)\//, '');
        const found = movies.find(m => {
          const slug = m.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
          return slug === movieSlug || m.id?.toString() === movieSlug;
        });
        if (found) {
          setDownloadFlowData({
            movie: found,
            quality: '1080p',
            type: pathname.startsWith('subdetails/') ? 'subtitle' : 'movie'
          });
          setSelectedMovie(null);
          return;
        }
      }

      // Check Clean Movie URL Pathnames (/movie/slug) or TV Series URL Pathnames (/tv+seris/slug, /tv-series/slug)
      if (pathname.startsWith('movie/') || pathname.startsWith('tv+seris/') || pathname.startsWith('tv-series/') || pathname.startsWith('tv/')) {
        const itemSlug = pathname.replace(/^(movie|tv\+seris|tv-series|tv)\//, '');
        const found = movies.find(m => {
          const slug = m.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
          return slug === itemSlug || m.id?.toString() === itemSlug;
        });
        if (found) {
          setSelectedMovie(found);
          setDownloadFlowData(null);
          return;
        }
      }

      if (!pathname) {
        setSelectedMovie(null);
        setDownloadFlowData(null);
        return;
      }

      // Check Direct Movie Path fallback
      if (pathname && !pathname.includes('=')) {
        const found = movies.find(m => {
          const slug = m.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
          return slug === pathname || m.id?.toString() === pathname;
        });
        if (found) {
          setSelectedMovie(found);
          setDownloadFlowData(null);
        }
      }
    };

    handleUrlChange();
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, [movies, currentUser]);

  // Search Input change with Clean Query Parameter URL (/q=keyword)
  const handleSearchChange = (term) => {
    setSearchTerm(term);
    if (term.trim()) {
      window.history.pushState({}, '', `/q=${encodeURIComponent(term.trim())}`);
    } else {
      window.history.pushState({}, '', '/');
    }
  };

  // Filter Logic matching index (45).html
  const filteredMovies = useMemo(() => {
    return movies.filter(movie => {
      if (!movie) return false;

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

      {/* Top Notice Marquee Banner & Navigation Bar (Show ONLY on Homepage) */}
      {!downloadFlowData && !selectedMovie && (
        <>
          <NoticeBanner />
          <Navbar
            searchTerm={searchTerm}
            setSearchTerm={handleSearchChange}
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
        </>
      )}

      {/* Main Container */}
      <main className="pb-16">
        {downloadFlowData ? (
          /* 3-Step Movie & Subtitle Download Flow View */
          <MovieDownloadFlowModal
            movie={downloadFlowData.movie}
            selectedQuality={downloadFlowData.quality}
            downloadType={downloadFlowData.type}
            onClose={() => {
              setDownloadFlowData(null);
              window.history.pushState({}, '', '/');
            }}
            onOpenPixeldrain={(url) => setPixeldrainUrl(url)}
            onOpenWhatsApp={(m, quality = '720p') => {
              setWaDeliveryData({ movie: m, quality });
            }}
          />
        ) : selectedMovie ? (
          /* Movie Detail Full-Page View */
          <MovieDetailModal
            movie={selectedMovie}
            onClose={() => handleSelectMovie(null)}
            onOpenWhatsAppDl={(m, quality = '720p') => {
              setWaDeliveryData({ movie: m, quality });
            }}
            onOpenSubDl={(m) => handleOpenDownloadFlow(m, '720p', 'subtitle')}
            onOpenMovieDl={(m, quality, type) => handleOpenDownloadFlow(m, quality, type)}
            onSelectEpisode={(ep, seasonName) => setSelectedEpisode({ episode: ep, seasonName })}
          />
        ) : (
          <>
            {/* Hero Featured Slider */}
            {!searchTerm && selectedCategory === 'all_movies' && selectedYear === 'all' && (
              <HeroSlider
                movies={movies}
                onSelectMovie={handleSelectMovie}
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
            <MovieGrid
              movies={filteredMovies}
              onSelectMovie={handleSelectMovie}
            />
          </>
        )}
      </main>

      {/* Additional Page Modals */}
      <EpisodeDetailModal
        isOpen={!!selectedEpisode}
        onClose={() => setSelectedEpisode(null)}
        movie={selectedMovie}
        episode={selectedEpisode?.episode}
        seasonName={selectedEpisode?.seasonName}
        onOpenPixeldrain={(url) => setPixeldrainUrl(url)}
        onToast={triggerToast}
      />

      <PixeldrainDownloadModal
        isOpen={!!pixeldrainUrl}
        onClose={() => setPixeldrainUrl(null)}
        downloadUrl={pixeldrainUrl}
        movieId={selectedMovie?.id}
        onToast={triggerToast}
      />

      <RequestCenterModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onToast={triggerToast}
      />

      <NotificationPanel
        isOpen={showNotifsPanel}
        onClose={() => setShowNotifsPanel(false)}
        onOpenMovie={handleSelectMovie}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          triggerToast(`Welcome back, ${user.displayName}!`);
        }}
      />

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        currentUser={currentUser}
        onLogout={() => {
          setCurrentUser(null);
          sessionStorage.removeItem('cf_user');
          triggerToast('Logged out successfully.');
        }}
        onOpenMovie={handleSelectMovie}
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
        onSelectGenre={(genre) => {
          setSelectedCategory(genre);
          setShowGenresPage(false);
        }}
      />

      <ActorsPage
        isOpen={!!selectedActor}
        onClose={() => setSelectedActor(null)}
        actorName={selectedActor}
        movies={movies}
        onOpenMovie={handleSelectMovie}
      />

      <FullCastPage
        isOpen={showFullCastPage}
        onClose={() => setShowFullCastPage(false)}
        movies={movies}
        onSelectActor={(actorName) => {
          setShowFullCastPage(false);
          setSelectedActor(actorName);
        }}
      />

      {/* Admin Modals */}
      {showAdminLogin && (
        <AdminLoginModal
          onLoginSuccess={() => {
            setShowAdminLogin(false);
            setShowAdmin(true);
          }}
          onClose={() => setShowAdminLogin(false)}
        />
      )}

      {showAdmin && (
        <AdminPanel
          movies={movies}
          onRefreshMovies={() => {
            rtdbGet('movies').then(data => {
              if (data && typeof data === 'object') {
                const arr = Object.entries(data).map(([k, v]) => ({ id: v.id || k, ...v }));
                setMovies(arr);
              }
            });
          }}
          onClose={() => setShowAdmin(false)}
          onLogout={() => setShowAdmin(false)}
        />
      )}

      {waDeliveryData && (
        <WhatsAppDeliveryModal
          movie={waDeliveryData.movie}
          selectedQuality={waDeliveryData.quality || '720p'}
          onClose={() => setWaDeliveryData(null)}
        />
      )}

    </div>
  );
}
