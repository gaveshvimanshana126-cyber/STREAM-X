import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, Check, Home, ChevronDown, Subtitles } from 'lucide-react';

export default function SubtitleDownloadModal({ movie, onClose }) {
  if (!movie) return null;

  const slug = movie.title ? movie.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : movie.id;

  // Step state: 'confirm' -> 'countdown' -> 'download'
  const [step, setStep] = useState('confirm');
  const [countdown, setCountdown] = useState(3);
  const [showSubGuide, setShowSubGuide] = useState(true);

  // Sync Clean Address Bar URL for each step matching index (45).html routing
  useEffect(() => {
    if (step === 'confirm') {
      window.history.pushState({ step: 'loaddl' }, '', `/loaddl/${slug}`);
    } else if (step === 'countdown') {
      window.history.pushState({ step: 'dldetils' }, '', `/dldetils/${slug}`);
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

  const handleStartCountdown = () => {
    setCountdown(3);
    setStep('countdown');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0A] overflow-y-auto w-full min-h-screen text-gray-100 font-['Nunito',sans-serif] animate-fadeIn select-none">
      
      {/* STEP 1: Confirm Page matching index (45).html */}
      {step === 'confirm' && (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center space-y-6 max-w-lg mx-auto">
          <div className="w-48 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-gray-800 bg-gray-900">
            <img
              src={movie.poster || movie.backdrop}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-white font-['Poppins']">
              {movie.title}
            </h2>
            <p className="text-xs text-gray-400 font-semibold">
              {movie.year} • {movie.genre || 'Action'} • SINHALA SUBTITLE
            </p>
          </div>

          <div className="w-full space-y-3 pt-4">
            <button
              onClick={handleStartCountdown}
              className="w-full py-3.5 rounded-xl bg-[#E8262A] hover:bg-red-700 text-white font-extrabold text-xs flex items-center justify-center space-x-2 shadow-xl shadow-red-600/40 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>GO TO DOWNLOAD PAGE</span>
            </button>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white font-bold text-xs flex items-center justify-center space-x-2 border border-gray-800 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>BACK TO MOVIE</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: 3-Second Ring Countdown Screen matching index (45).html */}
      {step === 'countdown' && (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center space-y-6">
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* Spinning Glow Ring */}
            <div className="absolute inset-0 rounded-full border-4 border-red-600/30 border-t-red-600 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-2 border-red-500/20 border-b-red-500 animate-spin" style={{ animationDirection: 'reverse' }}></div>

            <span className="text-4xl font-black text-white font-['Bebas_Neue'] animate-pulse">
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

      {/* STEP 3: Final Subtitle Download Page with Sinhala Guide matching index (45).html */}
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
              <span className="text-xs text-gray-400 font-semibold">{movie.year} • {movie.genre || 'Action'}</span>
            </div>
          </div>

          {/* Subtitle File Download Link Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-yellow-950/40 via-[#111111] to-[#111111] border border-yellow-500/30 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                  <Subtitles className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-yellow-400">Sinhala Subtitle</h4>
                  <p className="text-xs text-gray-400">BY {movie.subBy || 'Cineru.lk'}</p>
                </div>
              </div>

              <a
                href={movie.subUrl || '#'}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs flex items-center space-x-2 shadow-lg transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download .SRT</span>
              </a>
            </div>
          </div>

          {/* Collapsible Sinhala Subtitle Usage Guide matching index (45).html */}
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

        </div>
      )}

    </div>
  );
}
