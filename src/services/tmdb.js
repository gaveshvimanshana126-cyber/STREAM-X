const TMDB_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2ZWJkMDRhMTVhNzY0YWVmYmJjNzEyMGY5YTFmN2ZjYyIsIm5iZiI6MTc3NDA1OTkzNi43MjMsInN1YiI6IjY5YmUwMWEwMDI2ZjU1MjkwZmE1ZGVlYyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.RcaHm0ztmGjBYFjJ5VFs6bnTtXrj95oK1dlPXj4cGdg';
const TMDB_BASE = 'https://api.themoviedb.org/3';
export const TMDB_IMG = 'https://image.tmdb.org/t/p/';

export async function tmdbFetch(endpoint) {
  try {
    const res = await fetch(`${TMDB_BASE}${endpoint}`, {
      headers: { Authorization: `Bearer ${TMDB_TOKEN}` }
    });
    return await res.json();
  } catch (err) {
    console.warn('TMDb API fetch error:', err);
    return null;
  }
}

export async function searchTmdbMulti(query) {
  if (!query || !query.trim()) return [];
  try {
    const data = await tmdbFetch(`/search/multi?query=${encodeURIComponent(query.trim())}&language=en-US`);
    return data?.results || [];
  } catch (err) {
    console.warn('searchTmdbMulti error:', err);
    return [];
  }
}

export async function getUpcomingMoviesFromTmdb() {
  try {
    const data = await tmdbFetch('/movie/upcoming?language=en-US&page=1');
    return (data?.results || []).map(m => ({
      id: m.id,
      title: m.title,
      overview: m.overview,
      releaseDate: m.release_date,
      poster: m.poster_path ? `${TMDB_IMG}w342${m.poster_path}` : null,
      backdrop: m.backdrop_path ? `${TMDB_IMG}w780${m.backdrop_path}` : null,
      rating: m.vote_average ? m.vote_average.toFixed(1) : 'N/A'
    }));
  } catch (err) {
    console.warn('getUpcomingMoviesFromTmdb error:', err);
    return [];
  }
}

export async function getTmdbPersonDetails(personName) {
  if (!personName || !personName.trim()) return null;
  try {
    const searchData = await tmdbFetch(`/search/person?query=${encodeURIComponent(personName.trim())}&language=en-US`);
    if (searchData?.results?.length > 0) {
      const p = searchData.results[0];
      return {
        id: p.id,
        name: p.name,
        avatar: p.profile_path ? `${TMDB_IMG}w185${p.profile_path}` : null,
        knownFor: p.known_for_department || 'Acting'
      };
    }
    return null;
  } catch (err) {
    console.warn('getTmdbPersonDetails error:', err);
    return null;
  }
}

export async function fetchMovieTmdbDetails(movie) {
  if (!movie) return null;

  try {
    const type = (movie.type === 'tv' || movie.type === 'series' || movie.type === 'tv-series') ? 'tv' : 'movie';
    let tmdbId = movie.tmdbId;

    // Search TMDb by title if tmdbId is missing
    if (!tmdbId && movie.title) {
      const searchData = await tmdbFetch(`/search/${type}?query=${encodeURIComponent(movie.title)}&language=en-US`);
      if (searchData?.results?.length > 0) {
        let best = searchData.results[0];
        if (movie.year) {
          const yearMatch = searchData.results.find(r => (r.release_date || r.first_air_date || '').startsWith(String(movie.year)));
          if (yearMatch) best = yearMatch;
        }
        tmdbId = best.id;
      }
    }

    if (!tmdbId) return null;

    // Fetch full credits & images from TMDb
    const data = await tmdbFetch(`/${type}/${tmdbId}?append_to_response=credits,images,videos&language=en-US`);
    if (!data) return null;

    const castList = (data.credits?.cast || []).slice(0, 12).map(c => ({
      name: c.name,
      role: c.character || 'Actor',
      avatar: c.profile_path ? `${TMDB_IMG}w185${c.profile_path}` : null,
      initials: c.name ? c.name.split(' ').map(x => x[0]).join('').substring(0, 2).toUpperCase() : '??'
    }));

    const stillsList = (data.images?.backdrops || []).slice(0, 10).map(img => `${TMDB_IMG}w780${img.file_path}`);

    const director = data.credits?.crew?.find(c => c.job === 'Director')?.name || movie.director || '';
    const stars = castList.slice(0, 3).map(c => c.name).join(', ') || movie.stars || '';
    const releaseDate = data.release_date || data.first_air_date || movie.releaseDate || '';

    return {
      tmdbId,
      castList,
      stillsList: stillsList.length > 0 ? stillsList : null,
      director,
      stars,
      releaseDate,
      backdrop: data.backdrop_path ? `${TMDB_IMG}w780${data.backdrop_path}` : null,
      poster: data.poster_path ? `${TMDB_IMG}w342${data.poster_path}` : null,
    };

  } catch (error) {
    console.warn('TMDb details fetch error:', error);
    return null;
  }
}
