import React, { useState, useEffect } from 'react';
import { X, Copy, ExternalLink, AlertTriangle, Check, ArrowRight, Download } from 'lucide-react';
import { trackDownload } from '../services/firebase';

export default function PixeldrainDownloadModal({ isOpen, onClose, downloadUrl, movieId, onToast }) {
  const [countdown, setCountdown] = useState(3);
  const [isFinished, setIsFinished] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setCountdown(3);
    setIsFinished(false);
    setCopied(false);

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  const handleCopyLink = () => {
    if (!downloadUrl) return;

    if (movieId) trackDownload(movieId);

    navigator.clipboard.writeText(downloadUrl).then(() => {
      setCopied(true);
      if (onToast) onToast('📋 Link copied! Chrome එකේ Paste කරලා Download කරන්න.');
      setTimeout(() => setCopied(false), 3000);
    }).catch(() => {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = downloadUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      if (onToast) onToast('📋 Link copied! Chrome එකේ Paste කරලා Download කරන්න.');
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const handleOpenDirectly = () => {
    if (!downloadUrl) return;
    if (movieId) trackDownload(movieId);
    window.open(downloadUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  if (!isOpen || !downloadUrl) return null;

  const filename = decodeURIComponent(downloadUrl.split('/').pop().split('?')[0]) || 'Download File';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden text-white space-y-5">
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-full bg-white/5 hover:bg-white/10 transition">
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="text-center space-y-1">
          <span className="text-[10px] font-black tracking-widest text-red-500 uppercase">PIXELDRAIN SECURE DOWNLOAD</span>
          <h3 className="text-base font-bold text-white line-clamp-1">{filename}</h3>
        </div>

        {/* 3s Animated Countdown Ring */}
        <div className="flex flex-col items-center justify-center py-4">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="6" className="text-white/10" fill="transparent" />
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke="currentColor"
                strokeWidth="6"
                className="text-red-600 transition-all duration-1000"
                fill="transparent"
                strokeDasharray={213.6}
                strokeDashoffset={213.6 * (countdown / 3)}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-2xl font-black">{isFinished ? '!' : countdown}</span>
          </div>

          <p className="text-xs text-gray-300 font-medium text-center mt-3 max-w-xs">
            {isFinished ? 'Link copy කරලා Chrome එකෙන් download කරගන්න 👇' : 'Preparing download link...'}
          </p>
        </div>

        {/* Actions Box */}
        {isFinished && (
          <div className="space-y-4 animate-fade-in">
            {/* Copy Link Main Action */}
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={downloadUrl}
                className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-gray-300 truncate"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/30 transition flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'COPIED!' : 'COPY LINK'}</span>
              </button>
            </div>

            <button
              onClick={handleOpenDirectly}
              className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open Directly in Browser</span>
            </button>

            {/* Sri Lankan Mobile Chrome Instructions */}
            <div className="p-4 bg-black/40 border border-white/5 rounded-xl text-xs space-y-2 text-gray-300">
              <div className="font-extrabold text-white flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Pixeldrain Hotlink Error එක වැළැක්වීමට:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-gray-400 text-[11px] leading-relaxed">
                <li>උඩ ඇති <b>COPY LINK</b> Button එක Click කරන්න.</li>
                <li>ඔබගේ Phone එකේ <b>Google Chrome Browser</b> එක Open කරන්න.</li>
                <li>Chrome හි Search Bar එකෙහි Link එක <b>Paste</b> කර Go කරන්න.</li>
                <li>එවිට එන Pixeldrain පිටුවේ <b>Download</b> Button එක ඔබන්න.</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
