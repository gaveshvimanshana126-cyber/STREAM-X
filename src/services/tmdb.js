// TMDB API v3 Service
export const TMDB_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2ZWJkMDRhMTVhNzY0YWVmYmJjNzEyMGY5YTFmN2ZjYyIsIm5iZiI6MTc3NDA1OTkzNi43MjMsInN1YiI6IjY5YmUwMWEwMDI2ZjU1MjkwZmE1ZGVlYyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.RcaHm0ztmGjBYFjJ5VFs6bnTtXrj95oK1dlPXj4cGdg';
export const TMDB_BASE = 'https://api.themoviedb.org/3';
export const TMDB_IMG = 'https://image.tmdb.org/t/p/';

const headers = {
  Authorization: `Bearer ${TMDB_TOKEN}`,
  'Content-Type': 'application/json'
};

export const tmdbFetch = async (endpoint) => {
  const res = await fetch(`${TMDB_BASE}${endpoint}`, { headers });
  if (!res.ok) throw new Error(`TMDB error ${res.status}`);
  return await res.json();
};

export const searchTmdbMulti = async (query) => {
  if (!query || !query.trim()) return [];
  const data = await tmdbFetch(`/search/multi?query=${encodeURIComponent(query)}&language=en-US`);
  return (data.results || []).filter(x => x.media_type === 'movie' || x.media_type === 'tv');
};

export const getUpcomingMoviesFromTmdb = async () => {
  const [p1, p2] = await Promise.all([
    tmdbFetch(`/movie/upcoming?language=en-US&page=1`),
    tmdbFetch(`/movie/upcoming?language=en-US&page=2`)
  ]);
  const results = [...(p1.results || []), ...(p2.results || [])];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return results
    .filter(r => r.release_date && r.poster_path && new Date(r.release_date) > today)
    .sort((a, b) => new Date(a.release_date) - new Date(b.release_date));
};

export const getTmdbMovieDetails = async (tmdbId, type = 'movie') => {
  return await tmdbFetch(`/${type}/${tmdbId}?language=en-US&append_to_response=credits,images,videos&include_image_language=en,null`);
};

export const getTmdbPersonDetails = async (name) => {
  const search = await tmdbFetch(`/search/person?query=${encodeURIComponent(name)}&language=en-US`);
  const person = search.results?.[0];
  if (!person) return null;

  const credits = await tmdbFetch(`/person/${person.id}/combined_credits?language=en-US`);
  return { person, credits };
};
