import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCw, Settings, Lock, Unlock, FileText, ExternalLink, Check, ChevronDown, X } from 'lucide-react';

export default function CustomVideoPlayer({ streamUrl, posterUrl, movieTitle, subtitleUrl, onToast }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showPoster, setShowPoster] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [subSize, setSubSize] = useState(1);
  const [activeTab, setActiveTab] = useState('speed'); // 'speed' | 'sub'
  const [subTracks, setSubTracks] = useState([]);
  const [centerFlash, setCenterFlash] = useState(null); // 'play' | 'pause' | null
  const [subPopup, setSubPopup] = useState(null);

  const hideControlsTimer = useRef(null);

  // Auto-hide controls timer
  const resetHideTimer = () => {
    setShowControls(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    if (isPlaying && !isLocked) {
      hideControlsTimer.current = setTimeout(() => {
        setShowControls(false);
      }, 4000);
    }
  };

  useEffect(() => {
    resetHideTimer();
    return () => {
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    };
  }, [isPlaying, isLocked]);

  // Load video source and auto subtitle
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    video.src = streamUrl;
    video.load();
    setShowPoster(true);
    setIsPlaying(false);

    // Auto-load subtitle if provided
    if (subtitleUrl) {
      fetchSubtitle(subtitleUrl);
    }
  }, [streamUrl, subtitleUrl]);

  const fetchSubtitle = async (url) => {
    try {
      // Try proxy/direct fetch
      const proxies = [
        `/api/subtitle-vtt?url=${encodeURIComponent(url)}`,
        url,
        `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
        `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
      ];

      let text = '';
      let isAlreadyVtt = false;

      for (const p of proxies) {
        try {
          const res = await fetch(p);
          if (res.ok) {
            text = await res.text();
            if (text.includes('WEBVTT')) isAlreadyVtt = true;
            break;
          }
        } catch (e) { }
      }

      if (text) {
        attachSubtitle(text, 'සිංහල', isAlreadyVtt);
      }
    } catch (e) {
      console.warn('Auto subtitle fetch failed:', e);
    }
  };

  const attachSubtitle = (rawText, label = 'සිංහල', isAlreadyVtt = false) => {
    const video = videoRef.current;
    if (!video) return;

    let vttContent = rawText;
    if (!isAlreadyVtt) {
      vttContent = 'WEBVTT\n\n' + rawText
        .replace(/\r\n|\r/g, '\n')
        .replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2');
    }

    const blob = new Blob([vttContent], { type: 'text/vtt' });
    const blobUrl = URL.createObjectURL(blob);

    // Remove old tracks
    const oldTracks = video.querySelectorAll('track');
    oldTracks.forEach(t => t.remove());

    const track = document.createElement('track');
    track.kind = 'subtitles';
    track.label = label;
    track.srclang = 'si';
    track.src = blobUrl;
    track.default = true;

    video.appendChild(track);
    setSubTracks([{ label, mode: 'showing' }]);

    setTimeout(() => {
      if (video.textTracks && video.textTracks[0]) {
        video.textTracks[0].mode = 'showing';
      }
    }, 300);
  };

  const handleManualSubUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result;
      if (typeof content === 'string') {
        attachSubtitle(content, file.name, ext === 'vtt');
        setSubPopup(file.name);
        if (onToast) onToast(`Loaded subtitle: ${file.name}`);
        setTimeout(() => setSubPopup(null), 3500);
      }
    };
    reader.readAsText(file);
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (showPoster) setShowPoster(false);

    if (video.paused) {
      video.play();
      setIsPlaying(true);
      triggerFlash('play');
    } else {
      video.pause();
      setIsPlaying(false);
      triggerFlash('pause');
    }
  };

  const triggerFlash = (type) => {
    setCenterFlash(type);
    setTimeout(() => setCenterFlash(null), 550);
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    video.currentTime = pct * duration;
  };

  const handleSkip = (seconds) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
  };

  const changeSpeed = (rate) => {
    const video = videoRef.current;
    if (video) video.playbackRate = rate;
    setPlaybackRate(rate);
    if (onToast) onToast(`Speed: ${rate}x`);
  };

  const playInVlc = () => {
    if (!streamUrl) return;
    const vlcUrl = 'vlc://' + streamUrl;
    window.location.href = vlcUrl;
    if (onToast) onToast('🎬 Opening in VLC app...');
  };

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      await container.requestFullscreen();
      try {
        if (screen.orientation?.lock) {
          await screen.orientation.lock('landscape');
        }
      } catch (e) { }
    } else {
      await document.exitFullscreen();
    }
  };

  const formatTime = (s) => {
    if (isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-black overflow-hidden select-none rounded-xl border border-white/10 shadow-2xl group"
      onClick={() => {
        if (!isLocked) resetHideTimer();
      }}
    >
      {/* Dynamic Cue Style for Subtitles */}
      <style>{`video::cue { font-size: ${subSize}em; background: rgba(0,0,0,0.75); color: #ffffff; text-shadow: 0 1px 3px rgba(0,0,0,0.9); }`}</style>

      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        onClick={() => {
          if (!isLocked) togglePlay();
        }}
        onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => {
          setIsBuffering(false);
          setIsPlaying(true);
        }}
        onPause={() => setIsPlaying(false)}
      />

      {/* Poster Overlay */}
      {showPoster && (
        <div className="absolute inset-0 z-10 bg-black flex flex-col justify-end p-4">
          {posterUrl && (
            <img src={posterUrl} alt={movieTitle} className="absolute inset-0 w-full h-full object-cover opacity-60" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          
          <button
            onClick={togglePlay}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg shadow-red-600/50 hover:scale-110 transition cursor-pointer z-20"
          >
            <Play className="w-8 h-8 fill-current ml-1" />
          </button>

          <div className="relative z-20">
            <span className="text-xs font-bold text-red-500 tracking-widest uppercase">CINEFLIX PLAYER</span>
            <h3 className="text-2xl font-extrabold text-white line-clamp-1">{movieTitle}</h3>
          </div>
        </div>
      )}

      {/* Buffering Spinner */}
      {isBuffering && !showPoster && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="w-12 h-12 border-4 border-white/20 border-t-red-600 rounded-full animate-spin" />
        </div>
      )}

      {/* Center Tap Flash */}
      {centerFlash && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center z-20 animate-ping">
          {centerFlash === 'play' ? <Play className="w-8 h-8 fill-white text-white" /> : <Pause className="w-8 h-8 text-white" />}
        </div>
      )}

      {/* Lock Badge */}
      <button
        onClick={() => setIsLocked(!isLocked)}
        className={`absolute top-3 left-3 z-30 p-2 rounded-full backdrop-blur-md transition ${
          isLocked ? 'bg-red-600/80 text-white' : 'bg-black/50 text-white/80 hover:bg-black/80'
        }`}
      >
        {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
      </button>

      {/* In-Player Subtitle Notification Popup */}
      {subPopup && (
        <div className="absolute top-4 right-4 z-30 bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 px-3 py-2 rounded-xl backdrop-blur-md text-xs font-bold flex items-center gap-2 animate-bounce">
          <FileText className="w-4 h-4 text-emerald-400" />
          <span>Subtitle: {subPopup}</span>
        </div>
      )}

      {/* Custom Control Bar */}
      {!isLocked && (
        <div
          className={`absolute bottom-0 inset-x-0 z-20 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Progress Bar */}
          <div className="relative w-full h-1.5 bg-white/20 rounded-full cursor-pointer mb-3 group/progress" onClick={handleSeek}>
            <div className="absolute top-0 left-0 h-full bg-red-600 rounded-full" style={{ width: `${(currentTime / (duration || 1)) * 100}%` }} />
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-md scale-0 group-hover/progress:scale-100 transition"
              style={{ left: `${(currentTime / (duration || 1)) * 100}%` }}
            />
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between text-white text-xs font-semibold">
            <div className="flex items-center gap-3">
              <button onClick={togglePlay} className="hover:text-red-500 transition">
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
              </button>

              <button onClick={() => handleSkip(-10)} className="hover:text-red-500 transition font-mono">
                -10s
              </button>
              <button onClick={() => handleSkip(10)} className="hover:text-red-500 transition font-mono">
                +10s
              </button>

              <div className="flex items-center gap-1">
                <button onClick={() => setIsMuted(!isMuted)} className="hover:text-red-500 transition">
                  {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setVolume(val);
                    if (videoRef.current) videoRef.current.volume = val;
                    setIsMuted(val === 0);
                  }}
                  className="w-14 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
              </div>

              <span className="font-mono text-gray-300">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={playInVlc}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-400 rounded-lg hover:bg-amber-500/30 transition text-[11px]"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>VLC App</span>
              </button>

              <button onClick={() => setShowMenu(!showMenu)} className="hover:text-red-500 transition relative">
                <Settings className="w-5 h-5" />
              </button>

              <button onClick={toggleFullscreen} className="hover:text-red-500 transition">
                <RotateCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Popup Menu */}
      {showMenu && (
        <div className="absolute bottom-12 right-4 z-30 bg-neutral-900/95 border border-white/10 rounded-xl p-3 w-56 backdrop-blur-lg shadow-2xl text-xs text-gray-200">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
            <span className="font-bold text-white">Playback Settings</span>
            <button onClick={() => setShowMenu(false)} className="text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Speed Selector */}
          <div className="mb-3">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Speed</span>
            <div className="grid grid-cols-4 gap-1">
              {[0.5, 1, 1.25, 1.5].map((rate) => (
                <button
                  key={rate}
                  onClick={() => changeSpeed(rate)}
                  className={`py-1 rounded font-mono text-center transition ${
                    playbackRate === rate ? 'bg-red-600 text-white font-bold' : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>

          {/* Subtitle Font Size */}
          <div className="mb-3">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Subtitle Size</span>
            <div className="grid grid-cols-3 gap-1">
              {[0.8, 1, 1.3].map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSubSize(sz)}
                  className={`py-1 rounded font-mono text-center transition ${
                    subSize === sz ? 'bg-red-600 text-white font-bold' : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  {sz === 0.8 ? 'Small' : sz === 1 ? 'Normal' : 'Large'}
                </button>
              ))}
            </div>
          </div>

          {/* Manual SRT File Upload */}
          <label className="flex items-center justify-between p-2 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition">
            <span className="font-semibold text-gray-300">Upload .SRT File</span>
            <FileText className="w-4 h-4 text-red-500" />
            <input type="file" accept=".srt,.vtt" onChange={handleManualSubUpload} className="hidden" />
          </label>
        </div>
      )}
    </div>
  );
}
