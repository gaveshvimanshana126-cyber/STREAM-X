import initialMovies from './initialMovies.json';

const STORAGE_KEY = 'cineflix_movies_db_v2';
const BOT_PHONE_KEY = 'cineflix_whatsapp_bot_number';

export const getMovies = () => {
  try {
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load local storage movies:', err);
  }
  return initialMovies;
};

export const saveMovies = (movies) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(movies));
  } catch (err) {
    console.error('Failed to save movies to local storage:', err);
  }
};

export const getBotPhoneNumber = () => {
  return localStorage.getItem(BOT_PHONE_KEY) || '94770000000'; // Default Sri Lankan format
};

export const saveBotPhoneNumber = (num) => {
  localStorage.setItem(BOT_PHONE_KEY, num);
};

export const generateWhatsAppCommand = (movie, qualityRes = '720p') => {
  // Format matching the exact command string shown in user screenshot:
  // .768291444589299400396492 Idhayam Murali 2026 480p
  const cleanTitle = movie.title.replace(/[^\w\s-]/gi, '').trim();
  const movieYear = movie.year || new Date().getFullYear();
  const shortId = movie.id ? movie.id.replace(/^-/, '').slice(0, 10) : 'movie';
  const numericPrefix = Math.floor(Math.random() * 8999999999999 + 1000000000000);
  
  return `.${numericPrefix}${shortId} ${cleanTitle} ${movieYear} ${qualityRes}`;
};
