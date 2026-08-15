import React, { useEffect, useState } from 'react';
import { X, Bell, Film, ThumbsUp, MessageSquare, Trash2, CheckCircle2, Clock } from 'lucide-react';
import { rtdbGet, rtdbRemove } from '../services/firebase';

export default function NotificationPanel({ isOpen, onClose, isAdmin, onOpenMovie, movies }) {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    fetchNotifications();
  }, [isOpen]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await rtdbGet('notifications') || {};
      const items = Object.entries(data).map(([key, val]) => ({
        key,
        ...val
      })).sort((a, b) => (b.time || 0) - (a.time || 0)).slice(0, 40);

      setNotifs(items);
      localStorage.setItem('cineflix_notifs_unread', '0');
      localStorage.setItem('cineflix_notifs_seen_count', String(items.length));
    } catch (e) {
      setNotifs([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteNotif = async (key) => {
    try {
      await rtdbRemove(`notifications/${key}`);
      setNotifs(prev => prev.filter(n => n.key !== key));
    } catch (e) { }
  };

  const timeAgo = (ts) => {
    if (!ts) return '';
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-neutral-950">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-red-500" />
            <h3 className="font-extrabold text-white text-base tracking-wide">Activity Feed</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/5 p-2">
          {loading ? (
            <div className="text-center py-12 text-xs font-bold text-gray-500 tracking-widest animate-pulse">
              LOADING FEED...
            </div>
          ) : notifs.length > 0 ? (
            notifs.map(n => {
              const isRequest = n.type === 'request';
              const isVote = n.type === 'vote';
              const isMovie = n.type === 'movie';

              const titleMatch = (n.msg || '').match(/"([^"]+)"/);
              const movieTitle = titleMatch ? titleMatch[1] : '';
              const targetMovie = movies.find(m => m.title?.toLowerCase() === movieTitle.toLowerCase());

              return (
                <div
                  key={n.key}
                  onClick={() => {
                    if (targetMovie) {
                      onOpenMovie(targetMovie);
                      onClose();
                    }
                  }}
                  className="p-3 rounded-xl hover:bg-white/5 transition flex items-start gap-3 cursor-pointer group"
                >
                  {/* Icon Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                    isRequest ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' :
                    isVote ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                    'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {isRequest ? <Film className="w-5 h-5" /> : isVote ? <ThumbsUp className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-200 font-medium leading-relaxed">{n.msg}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                        isRequest ? 'bg-indigo-500/20 text-indigo-400' :
                        isVote ? 'bg-purple-500/20 text-purple-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {n.type || 'INFO'}
                      </span>
                      <span className="text-[10px] text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {timeAgo(n.time)}
                      </span>
                    </div>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteNotif(n.key); }}
                      className="p-1 text-gray-500 hover:text-red-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-xs text-gray-500">නවතම ක්‍රියාකාරකම් කිසිවක් නොමැත.</div>
          )}
        </div>
      </div>
    </div>
  );
}
