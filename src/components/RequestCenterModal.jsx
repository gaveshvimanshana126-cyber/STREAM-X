import React, { useState, useEffect } from 'react';
import { X, Search, ThumbsUp, Plus, CheckCircle2, Film, Tv, AlertCircle } from 'lucide-react';
import { rtdbGet, rtdbPush, rtdbSet } from '../services/firebase';
import { searchTmdbMulti } from '../services/tmdb';

export default function RequestCenterModal({ isOpen, onClose, onToast }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchVal, setSearchVal] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Confirm Modal state
  const [confirmMovie, setConfirmMovie] = useState(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formErr, setFormErr] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    loadRequests();
  }, [isOpen]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await rtdbGet('requests') || {};
      const items = Object.entries(data).map(([key, val]) => ({
        key,
        ...val
      })).sort((a, b) => (b.votes || 0) - (a.votes || 0));

      setRequests(items);
    } catch (e) {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = async (val) => {
    setSearchVal(val);
    if (!val.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchTmdbMulti(val);
      setSearchResults(results.slice(0, 6));
    } catch (e) {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const openConfirm = (m, isVote = false, reqKey = null) => {
    setConfirmMovie({
      tmdbId: m.id || '',
      type: m.media_type || 'movie',
      title: m.title || m.name || m.movie || '',
      year: (m.release_date || m.first_air_date || m.year || '').substring(0, 4),
      poster: m.poster_path ? `https://image.tmdb.org/t/p/w92${m.poster_path}` : (m.poster || ''),
      isVote,
      reqKey
    });
    setFormErr('');
  };

  const submitRequestOrVote = async (e) => {
    e.preventDefault();
    if (!userName.trim()) {
      setFormErr('ඔබගේ නම ඇතුළත් කරන්න.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!userEmail || !emailRegex.test(userEmail)) {
      setFormErr('වලංගු Email ලිපිනයක් ඇතුළත් කරන්න.');
      return;
    }

    setSubmitting(true);
    const { title, tmdbId, type, year, poster, isVote, reqKey } = confirmMovie;

    try {
      if (isVote && reqKey) {
        // Check vote status
        const vKey = `req_vote_${reqKey}`;
        if (localStorage.getItem(vKey)) {
          if (onToast) onToast('ඔබ දැනටමත් vote කර ඇත!');
          setConfirmMovie(null);
          return;
        }

        const curVotes = await rtdbGet(`requests/${reqKey}/votes`) || 0;
        await rtdbSet(`requests/${reqKey}/votes`, curVotes + 1);

        localStorage.setItem(vKey, '1');
        await rtdbPush('notifications', {
          msg: `Vote for "${title}" by ${userName}`,
          type: 'vote',
          time: Date.now()
        });

        if (onToast) onToast('✓ Vote ඇතුළත් විය!');
      } else {
        // Check if already requested
        const existingData = await rtdbGet('requests') || {};
        let existingKey = null;
        Object.entries(existingData).forEach(([k, v]) => {
          if (v.movie?.toLowerCase() === title.toLowerCase()) existingKey = k;
        });

        if (existingKey) {
          const vKey = `req_vote_${existingKey}`;
          if (localStorage.getItem(vKey)) {
            if (onToast) onToast('ඔබ දැනටමත් vote කර ඇත!');
            setConfirmMovie(null);
            return;
          }

          const curVotes = (existingData[existingKey].votes || 0) + 1;
          await rtdbSet(`requests/${existingKey}/votes`, curVotes);
          localStorage.setItem(vKey, '1');
          await rtdbPush('notifications', {
            msg: `Vote for "${title}" by ${userName}`,
            type: 'vote',
            time: Date.now()
          });
          if (onToast) onToast('✓ දැනටමත් Request කර ඇත! Vote ඇතුළත් විය.');
        } else {
          // New Request
          const newReq = {
            movie: title,
            tmdbId: String(tmdbId),
            type: type || 'movie',
            year: year || '',
            poster: poster || '',
            user: userName,
            email: userEmail,
            votes: 1,
            time: Date.now(),
            status: 'pending'
          };

          const res = await rtdbPush('requests', newReq);
          if (res && res.name) {
            localStorage.setItem(`req_vote_${res.name}`, '1');
          }

          await rtdbPush('notifications', {
            msg: `Movie request: "${title}" by ${userName}`,
            type: 'request',
            time: Date.now()
          });

          if (onToast) onToast('✓ Request සාර්ථකව යවන ලදී!');
        }
      }

      setConfirmMovie(null);
      setSearchVal('');
      setSearchResults([]);
      loadRequests();
    } catch (e) {
      if (onToast) onToast(`Error: ${e.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl max-h-[85vh] bg-neutral-900 border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden flex flex-col">
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-full bg-white/5 hover:bg-white/10 transition">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <Film className="w-6 h-6 text-red-600" />
          <h2 className="text-xl font-extrabold text-white">Movie Request Center</h2>
        </div>

        {/* TMDB Search Input */}
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="TMDB මඟින් Movie / TV Series එකක් සොයන්න..."
            className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-600 transition"
          />
        </div>

        {/* TMDB Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="mb-4 bg-neutral-950 border border-white/10 rounded-xl p-2 max-h-48 overflow-y-auto space-y-1 divide-y divide-white/5">
            {searchResults.map(r => (
              <div
                key={r.id}
                onClick={() => openConfirm(r, false)}
                className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer transition"
              >
                {r.poster_path ? (
                  <img src={`https://image.tmdb.org/t/p/w92${r.poster_path}`} alt="" className="w-10 h-14 object-cover rounded-md" />
                ) : (
                  <div className="w-10 h-14 bg-white/10 rounded-md flex items-center justify-center text-xs">🎬</div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white truncate">{r.title || r.name}</div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="px-1.5 py-0.5 bg-red-600/20 text-red-400 font-extrabold rounded text-[10px]">
                      {r.media_type === 'tv' ? 'TV SHOW' : 'MOVIE'}
                    </span>
                    <span>{(r.release_date || r.first_air_date || '').substring(0, 4)}</span>
                  </div>
                </div>
                <Plus className="w-5 h-5 text-red-500" />
              </div>
            ))}
          </div>
        )}

        {/* Request List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {loading ? (
            <div className="text-center py-12 text-xs font-bold text-gray-500 tracking-widest animate-pulse">
              LOADING REQUESTS...
            </div>
          ) : requests.length > 0 ? (
            requests.map(r => {
              const votes = r.votes || 1;
              const hasVoted = !!localStorage.getItem(`req_vote_${r.key}`);
              const isDone = r.status === 'done';

              return (
                <div key={r.key} className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center gap-3">
                  {r.poster ? (
                    <img src={r.poster} alt="" className="w-14 h-20 object-cover rounded-lg shrink-0" />
                  ) : (
                    <div className="w-14 h-20 bg-white/10 rounded-lg flex items-center justify-center text-xl shrink-0">🎬</div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white leading-tight mb-1 truncate">{r.movie}</h4>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded">
                        {r.type === 'tv' ? 'TV SHOW' : 'MOVIE'}
                      </span>
                      <span className="text-xs font-bold text-blue-400 flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3 fill-current" />
                        {votes} Votes
                      </span>
                      {isDone && (
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded">
                          ✓ ADDED
                        </span>
                      )}
                    </div>

                    {!isDone ? (
                      <button
                        onClick={() => openConfirm(r, true, r.key)}
                        disabled={hasVoted}
                        className={`w-full py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                          hasVoted ? 'bg-white/10 text-gray-400' : 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/30'
                        }`}
                      >
                        {hasVoted ? '✓ VOTED' : '+ ADD MY VOTE'}
                      </button>
                    ) : (
                      <div className="text-[11px] font-bold text-emerald-400 text-center py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                        ✓ Available on Cineflix!
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-xs text-gray-500">Request කිසිවක් නොමැත. ප්‍රථම Request එක ඉදිරිපත් කරන්න!</div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmMovie && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 animate-fade-in">
          <div className="relative w-full max-w-sm bg-neutral-900 border border-white/10 rounded-2xl p-5 shadow-2xl">
            <button onClick={() => setConfirmMovie(null)} className="absolute top-3 right-3 text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-bold text-gray-400 mb-1">
              {confirmMovie.isVote ? 'You are voting for:' : 'You are requesting:'}
            </h3>
            <div className="text-base font-extrabold text-white mb-4 line-clamp-1">{confirmMovie.title}</div>

            {formErr && (
              <div className="mb-3 p-2 bg-red-950/60 border border-red-500/40 rounded-lg text-red-300 text-xs font-medium">
                ⚠️ {formErr}
              </div>
            )}

            <form onSubmit={submitRequestOrVote} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Your Name</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="ඔබගේ නම"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Your Email</label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/30 transition cursor-pointer"
              >
                {submitting ? 'Sending...' : confirmMovie.isVote ? 'Confirm Vote' : 'Confirm Request'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
