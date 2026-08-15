import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Download, FileText, Play, Star, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import CustomVideoPlayer from './CustomVideoPlayer';
import { tmdbFetch, TMDB_IMG } from '../services/tmdb';

export default function EpisodeDetailModal({ isOpen, onClose, movie, episode, seasonName, onSelectEpisode, onOpenPixeldrain, onToast }) {
  const [stills, setStills] = useState([]);
  const [activeServer, setActiveServer] = useState('srv1'); // 'srv1' | 'srv2' | 'srv3'

  useEffect(() => {
    if (!isOpen || !movie?.tmdbId || !episode) return;
    loadEpisodeStills();
  }, [isOpen, movie, episode]);

  const loadEpisodeStills = async () => {
    try {
      const seasonNum = episode._season?.season || 1;
      const epNum = episode.ep;
      const data = await tmdbFetch(`/tv/${movie.tmdbId}/season/${seasonNum}/episode/${epNum}/images`);
      if (data.stills && data.stills.length > 0) {
        setStills(data.stills.map(s => TMDB_IMG + 'w780' + s.file_path));
      } else {
        setStills([]);
      }
    } catch (e) {
      setStills([]);
    }
  };

  if (!isOpen || !movie || !episode) return null;

  // Find all episodes across seasons for prev/next
  const allEpisodes = [];
  (movie.seasons || []).forEach(s => {
    (s.episodes || []).forEach(ep => {
      allEpisodes.push({ ...ep, _seasonName: s.name || `Season ${s.season || 1}` });
    });
  });

  const curIdx = allEpisodes.findIndex(e => e.ep === episode.ep && e._seasonName === seasonName);
  const prevEp = curIdx > 0 ? allEpisodes[curIdx - 1] : null;
  const nextEp = curIdx >= 0 && curIdx < allEpisodes.length - 1 ? allEpisodes[curIdx + 1] : null;

  const currentStreamUrl = activeServer === 'srv1' ? episode.srv1 || episode.url : activeServer === 'srv2' ? episode.srv2 : episode.srv3;

  return (
    <div className="fixed inset-0 z-[90] bg-neutral-950 text-white overflow-y-auto animate-fade-in p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Header Nav */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <button onClick={onClose} className="flex items-center gap-2 text-xs font-extrabold text-gray-400 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" /> BACK TO {movie.title?.toUpperCase()}
          </button>

          {/* Prev / Next Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => prevEp && onSelectEpisode(prevEp, prevEp._seasonName)}
              disabled={!prevEp}
              className="p-2 bg-neutral-900 border border-white/10 rounded-xl disabled:opacity-30 hover:bg-white/10 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-gray-300">
              E{episode.ep}: {episode.title}
            </span>
            <button
              onClick={() => nextEp && onSelectEpisode(nextEp, nextEp._seasonName)}
              disabled={!nextEp}
              className="p-2 bg-neutral-900 border border-white/10 rounded-xl disabled:opacity-30 hover:bg-white/10 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Player Block */}
        <div className="space-y-3">
          <CustomVideoPlayer
            streamUrl={currentStreamUrl}
            posterUrl={episode.thumb || movie.backdrop || movie.poster}
            movieTitle={`${movie.title} - E${episode.ep}`}
            subtitleUrl={episode.subUrl}
            onToast={onToast}
          />

          {/* Server Selectors */}
          <div className="flex items-center gap-2 justify-center">
            {episode.srv1 && (
              <button
                onClick={() => setActiveServer('srv1')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  activeServer === 'srv1' ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                Server 1
              </button>
            )}
            {episode.srv2 && (
              <button
                onClick={() => setActiveServer('srv2')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  activeServer === 'srv2' ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                Server 2
              </button>
            )}
            {episode.srv3 && (
              <button
                onClick={() => setActiveServer('srv3')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  activeServer === 'srv3' ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                Server 3
              </button>
            )}
          </div>
        </div>

        {/* Episode Info Meta */}
        <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 space-y-3">
          <span className="px-2.5 py-0.5 bg-red-600/20 text-red-400 border border-red-600/40 rounded-full text-xs font-bold">
            {seasonName} • Episode {episode.ep}
          </span>
          <h1 className="text-2xl font-extrabold text-white">{episode.title || `Episode ${episode.ep}`}</h1>

          {episode.desc && <p className="text-xs text-gray-300 leading-relaxed">{episode.desc}</p>}
        </div>

        {/* Download Section */}
        <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <Download className="w-4 h-4 text-red-600" /> Episode Downloads
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {episode.pd720 && (
              <button
                onClick={() => onOpenPixeldrain(episode.pd720)}
                className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left transition flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="text-xs font-bold text-white">Pixeldrain - 720p HD</div>
                  <div className="text-[10px] text-gray-400">Fast Cloud Server</div>
                </div>
                <Download className="w-4 h-4 text-red-500" />
              </button>
            )}

            {episode.pd1080 && (
              <button
                onClick={() => onOpenPixeldrain(episode.pd1080)}
                className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left transition flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="text-xs font-bold text-white">Pixeldrain - 1080p Full HD</div>
                  <div className="text-[10px] text-gray-400">High Quality</div>
                </div>
                <Download className="w-4 h-4 text-red-500" />
              </button>
            )}

            {episode.subUrl && (
              <a
                href={episode.subUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 rounded-xl text-left transition flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="text-xs font-bold text-amber-400">Sinhala Subtitle</div>
                  <div className="text-[10px] text-amber-500/80">SRT File</div>
                </div>
                <FileText className="w-4 h-4 text-amber-400" />
              </a>
            )}
          </div>
        </div>

        {/* Episode Stills */}
        {stills.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Episode Stills</h3>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {stills.map((url, i) => (
                <img key={i} src={url} alt="" className="w-48 aspect-video object-cover rounded-xl border border-white/10 shrink-0" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
