import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, Check, Home, ChevronDown, Subtitles, Film, Shield, Globe, MessageCircle } from 'lucide-react';

export default function MovieDownloadFlowModal({ movie, selectedQuality = '1080p', downloadType = 'movie', onClose, onOpenPixeldrain, onOpenWhatsApp }) {
  if (!movie) return null;

  const slug = movie.title ? movie.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : movie.id;

  // Step state: 'countdown' (3-2-1-0 ring screen) -> 'download' (Final download button screen)
  const [step, setStep] = useState('countdown');
  const [countdown, setCountdown] = useState(3);
  const [showSubGuide, setShowSubGuide] = useState(true);

  // Sync Clean Address Bar URL for each step matching index (45).html routing
  useEffect(() => {
    if (step === 'countdown') {
      window.history.pushState({ step: 'loaddl' }, '', `/loaddl/${slug}`);
    } else if (step === 'download') {
      window.history.pushState({ step: 'dlmovie' }, '', `/dlmovie/${slug}`);
    }
  }, [step, slug]);

  useEffect(() => {
    let timer;
    if (step === 'countdown') {
      if (countdown > 0) {
        timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      } else {
        setStep('download');
      }
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  const dl720 = movie.downloads?.find(d => d.res === '720p') || movie.downloads?.[0] || {};
  const dl1080 = movie.downloads?.find(d => d.res === '1080p') || movie.downloads?.[1] || dl720;
  const activeDl = selectedQuality === '1080p' ? dl1080 : dl720;
  
  // Use exact database download URL
  const targetUrl = activeDl.srv1 || activeDl.srv2 || activeDl.pd1080 || activeDl.pd720 || activeDl.url || movie.subUrl || '#';

  const handleDownloadClick = () => {
    if (!targetUrl || targetUrl === '#') {
      alert('Download link for this quality is preparing in Database.');
      return;
    }
    if (targetUrl.includes('pixeldrain.com')) {
      onOpenPixeldrain(targetUrl);
    } else {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0A] overflow-y-auto w-full min-h-screen text-gray-100 font-['Nunito',sans-serif] animate-fadeIn select-none">
      
      {/* STEP 1: 3-Second Ring Countdown Screen (3 -> 2 -> 1 -> 0) matching index (45).html */}
      {step === 'countdown' && (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center space-y-6">
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* Spinning Glow Ring */}
            <div className="absolute inset-0 rounded-full border-4 border-red-600/30 border-t-red-600 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-2 border-red-500/20 border-b-red-500 animate-spin" style={{ animationDirection: 'reverse' }}></div>

            <span className="text-5xl font-black text-white font-['Bebas_Neue'] animate-pulse">
              {countdown}
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white tracking-wider uppercase font-['Poppins']">
              Preparing your download link...
            </h3>
            <span className="text-[10px] font-extrabold text-red-500 tracking-[3px] uppercase block">
              CINEFLIX CLOUD
            </span>
          </div>
        </div>
      )}

      {/* STEP 2: Final Movie/Subtitle Download Page with Active Database Download Button matching index (45).html */}
      {step === 'download' && (
        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8 space-y-8">
          
          {/* Top Bar */}
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <button
              onClick={onClose}
              className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-900 hover:bg-red-600 text-white text-xs font-bold transition-all border border-gray-800 cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>HOME</span>
            </button>

            <span className="text-xs font-bold text-gray-400">
              POWERED BY <span className="text-red-500">CINEFLIX DEV TEAM</span>
            </span>
          </div>

          {/* Movie Info Card */}
          <div className="flex items-center space-x-4 p-4 rounded-2xl bg-[#111111] border border-gray-800">
            <img
              src={movie.poster || movie.backdrop}
              alt={movie.title}
              className="w-16 h-24 object-cover rounded-xl border border-gray-800"
            />
            <div>
              <h2 className="text-xl font-bold text-white font-['Poppins']">{movie.title}</h2>
              <span className="text-xs text-gray-400 font-semibold">{movie.year} • {movie.genre || 'Action'} • {movie.quality || 'WEB-DL'}</span>
            </div>
          </div>

          {downloadType === 'subtitle' ? (
            /* Subtitle Download Box */
            <div className="p-5 rounded-2xl bg-gradient-to-r from-yellow-950/40 via-[#111111] to-[#111111] border border-yellow-500/30 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                    <Subtitles className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-yellow-400">Sinhala Subtitle</h4>
                    <p className="text-xs text-gray-400">BY {movie.subBy || 'Cineru.lk'} • .SRT FILE</p>
                  </div>
                </div>

                <a
                  href={movie.subUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-3.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs flex items-center space-x-2 shadow-lg transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download .SRT File</span>
                </a>
              </div>
            </div>
          ) : (
            /* Movie Video Download Box */
            <div className="p-5 rounded-2xl bg-[#111111] border border-gray-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="px-3 py-1.5 rounded-xl bg-red-600 text-white font-black text-sm font-['Bebas_Neue']">
                    {selectedQuality.toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Direct Download <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 font-extrabold">DATABASE SERVER</span></h4>
                    <span className="text-xs text-gray-400 font-bold">{activeDl.size || '1.85GB'} • MP4 File</span>
                  </div>
                </div>
              </div>

              {/* Main Download Triggers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  onClick={handleDownloadClick}
                  className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-red-600/30 transition-all cursor-pointer uppercase tracking-wider"
                >
                  <Download className="w-4 h-4" />
                  <span>START MOVIE DOWNLOAD</span>
                </button>

                <button
                  onClick={() => onOpenWhatsApp(movie)}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center space-x-2 shadow-lg transition-all cursor-pointer uppercase tracking-wider"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WHATSAPP BOT DOWNLOAD</span>
                </button>
              </div>
            </div>
          )}

          {/* Collapsible Sinhala Subtitle Usage Guide matching index (45).html */}
          {movie.subUrl && (
            <div className="rounded-2xl bg-[#111111] border border-gray-800 overflow-hidden">
              <button
                onClick={() => setShowSubGuide(!showSubGuide)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-all cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <Subtitles className="w-4 h-4 text-red-500" />
                  <span className="text-xs font-extrabold text-white">සිංහල උපසිරැසි යෙදීම (Sinhala Subtitle Guide)</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${showSubGuide ? 'rotate-180' : ''}`} />
              </button>

              {showSubGuide && (
                <div className="p-4 border-t border-gray-800 space-y-3 text-xs text-gray-300 leading-relaxed bg-gray-950/60">
                  <p className="font-semibold text-white">
                    📱 Mobile / PC හි සිංහල උපසිරැසි සමඟ වීඩියෝ බලන්නේ කෙසේද:
                  </p>
                  <ol className="list-decimal list-inside space-y-1.5 text-gray-400">
                    <li>බාගත කරගත් <code className="text-yellow-400 font-mono">.SRT</code> Subtitle ගොනුව සහ Movie ගොනුව එකම ෆෝල්ඩරයේ තබන්න.</li>
                    <li>ලැබුණු <code className="text-yellow-400 font-mono">.SRT</code> ගොනුවේ නම Movie File එකේ නමට සමාන වන සේ Rename කරන්න.</li>
                    <li><strong className="text-white">VLC Media Player</strong> හෝ <strong className="text-white">MX Player</strong> මගින් Movie එක Open කර Subtitles ලබා ගන්න.</li>
                  </ol>
                </div>
              )}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
