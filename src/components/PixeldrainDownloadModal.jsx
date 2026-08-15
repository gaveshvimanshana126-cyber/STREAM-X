import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Check, Globe, Download, AlertCircle } from 'lucide-react';

export default function PixeldrainDownloadModal({ downloadUrl, filename = 'Movie.mp4', onClose }) {
  const [countdown, setCountdown] = useState(3);
  const [status, setStatus] = useState('Preparing your download...');
  const [showFailNotice, setShowFailNotice] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    } else {
      setStatus('Redirecting to Pixeldrain...');
      setShowFailNotice(true);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleCopyLink = () => {
    if (downloadUrl) {
      navigator.clipboard.writeText(downloadUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#070a0f] overflow-y-auto w-full min-h-screen text-gray-100 font-['Nunito',sans-serif] flex flex-col items-center justify-center p-6 animate-fadeIn">
      
      {/* Top Back Button */}
      <button
        onClick={onClose}
        className="absolute top-4 left-4 flex items-center space-x-1.5 text-xs font-bold text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      <div className="w-full max-w-md space-y-6 flex flex-col items-center text-center py-8">
        
        {/* Pixeldrain Logo Badge */}
        <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shadow-xl shadow-indigo-600/20">
          <Globe className="w-8 h-8 text-indigo-400" />
        </div>

        <div className="space-y-1 w-full">
          <span className="text-[10px] font-extrabold text-indigo-400 tracking-[3px] uppercase block">
            PIXELDRAIN DIRECT MIRROR
          </span>
          <h3 className="text-sm font-bold text-white truncate max-w-xs mx-auto">
            {filename}
          </h3>
        </div>

        {/* Countdown Ring */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-red-600/20 border-t-red-600 animate-spin"></div>
          <span className="text-2xl font-black text-white font-['Bebas_Neue']">
            {countdown}
          </span>
        </div>

        <p className="text-xs font-semibold text-gray-400">
          {status}
        </p>

        {/* Fail Notice Box matching index (45).html */}
        {showFailNotice && (
          <div className="w-full p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-left space-y-2 animate-fadeIn">
            <div className="flex items-center space-x-2 text-red-500 font-bold text-xs">
              <AlertCircle className="w-4 h-4" />
              <span>Download Link Fail වුනාද? (Hotlink Protection)</span>
            </div>
            <p className="text-[11px] text-red-300 leading-relaxed">
              පහත Link එක Copy කර Chrome Browser එකේ Address Bar එකට Paste කර Download කරගන්න. 👇
            </p>
          </div>
        )}

        {/* Copy Link Input Box */}
        <div className="w-full flex items-center space-x-2">
          <input
            type="text"
            readOnly
            value={downloadUrl || 'https://pixeldrain.com/u/...' }
            className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono truncate focus:outline-none"
          />
          <button
            onClick={handleCopyLink}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow cursor-pointer transition-all whitespace-nowrap"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>
        </div>

        {/* 4-Step Sinhala Instructions Card matching index (45).html */}
        <div className="w-full p-4 rounded-2xl bg-gray-900/80 border border-gray-800 text-left space-y-4">
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            📋 කරන්නේ මෙහෙමයි (INSTRUCTIONS)
          </h4>

          {/* Step 1 */}
          <div className="flex items-start space-x-3 text-xs">
            <div className="w-6 h-6 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
              1
            </div>
            <div>
              <h5 className="font-bold text-white">Link Copy කරන්න</h5>
              <p className="text-[11px] text-gray-400">ඉහලින් "Copy Link" button එක tap කරන්න. Link එක clipboard එකේ copy වේ.</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start space-x-3 text-xs">
            <div className="w-6 h-6 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
              2
            </div>
            <div>
              <h5 className="font-bold text-white">Chrome Browser Open කරන්න</h5>
              <p className="text-[11px] text-gray-400">ඔයාගේ phone එකේ Chrome App එක open කරන්න.</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start space-x-3 text-xs">
            <div className="w-6 h-6 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
              3
            </div>
            <div>
              <h5 className="font-bold text-white">Address Bar එක Tap කර Paste කරන්න</h5>
              <p className="text-[11px] text-gray-400">Top එකේ address bar එක tap කරලා Paste කරන්න.</p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start space-x-3 text-xs">
            <div className="w-6 h-6 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
              4
            </div>
            <div>
              <h5 className="font-bold text-white">Download කරන්න</h5>
              <p className="text-[11px] text-gray-400">Link එක paste කර enter කළ විට Auto download ආරම්භ වේ. ✅</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
