import React, { useState } from 'react';
import { X, MessageCircle, Copy, Check, ExternalLink, Download, Sparkles, Smartphone, ArrowRight, ShieldCheck } from 'lucide-react';
import { generateWhatsAppCommand, getBotPhoneNumber } from '../data/moviesData.js';

export default function WhatsAppDownloadModal({ movie, onClose }) {
  if (!movie) return null;

  const [quality, setQuality] = useState('720p');
  const [copied, setCopied] = useState(false);
  const botPhone = getBotPhoneNumber();

  const botCommand = generateWhatsAppCommand(movie, quality);
  const waDirectUrl = `https://wa.me/${botPhone.replace(/\+/g, '')}?text=${encodeURIComponent(botCommand)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(botCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-xl glass-panel rounded-3xl overflow-hidden border border-emerald-500/40 shadow-2xl bg-[#0c1317]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Bar */}
        <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-gradient-to-r from-emerald-950/80 via-gray-900 to-gray-900">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <MessageCircle className="w-5 h-5 fill-emerald-500 text-emerald-950" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                WhatsApp Movie Downloader
                <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-gray-950 text-[10px] font-black uppercase">
                  BOT
                </span>
              </h3>
              <p className="text-xs text-emerald-400 font-medium">Fast & Direct File Delivery to WhatsApp</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-gray-800/80 hover:bg-red-600 text-gray-400 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* Movie Overview */}
          <div className="flex items-center space-x-4 p-3.5 rounded-2xl bg-gray-900/90 border border-gray-800">
            <img
              src={movie.poster || movie.backdrop}
              alt={movie.title}
              className="w-14 h-20 object-cover rounded-xl shadow"
            />
            <div>
              <h4 className="text-base font-bold text-white">{movie.title}</h4>
              <p className="text-xs text-gray-400 font-medium">Year: {movie.year} | Subtitle: {movie.subBy || 'Sinhala Sub'}</p>
              <div className="flex items-center space-x-1.5 mt-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] text-emerald-400 font-semibold">100% Safe WhatsApp Delivery</span>
              </div>
            </div>
          </div>

          {/* Quality Selector */}
          <div>
            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-2">
              1. Choose Video Quality
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {['480p', '720p', '1080p'].map((res) => (
                <button
                  key={res}
                  onClick={() => setQuality(res)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                    quality === res
                      ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-600/30'
                      : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {res} {res === '720p' && '(HD)'} {res === '1080p' && '(FHD)'}
                </button>
              ))}
            </div>
          </div>

          {/* WhatsApp Command Code Box */}
          <div>
            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-2">
              2. Bot Command Code
            </label>
            <div className="relative flex items-center bg-black/70 border border-emerald-500/30 rounded-2xl p-3">
              <code className="text-xs font-mono text-emerald-300 flex-1 break-all pr-12">
                {botCommand}
              </code>
              <button
                onClick={handleCopy}
                className="absolute right-2.5 p-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white transition-all border border-emerald-500/40"
                title="Copy Command Code"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            {copied && <p className="text-[11px] text-emerald-400 mt-1 font-semibold">Command code copied to clipboard!</p>}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-1">
            {/* Direct WhatsApp Click Link */}
            <a
              href={waDirectUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black text-sm flex items-center justify-center space-x-2 shadow-xl shadow-emerald-500/30 transition-all transform hover:-translate-y-0.5"
            >
              <MessageCircle className="w-5 h-5 fill-gray-950 text-emerald-500" />
              <span>Send Command to WhatsApp Bot Now</span>
              <ExternalLink className="w-4 h-4 ml-1" />
            </a>

            <button
              onClick={handleCopy}
              className="w-full py-3 px-4 rounded-2xl bg-gray-900 hover:bg-gray-800 text-gray-200 font-bold text-xs flex items-center justify-center space-x-2 border border-gray-800 transition-all"
            >
              <Copy className="w-4 h-4 text-gray-400" />
              <span>Or Copy Code & Paste in WhatsApp Chat</span>
            </button>
          </div>

          {/* Simulated WhatsApp Chat Preview matching user's screenshot */}
          <div className="space-y-2 pt-2 border-t border-gray-800/80">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              How Bot Responds in WhatsApp:
            </label>
            
            <div className="wa-chat-bg p-4 rounded-2xl border border-gray-800 space-y-3 font-sans text-xs">
              
              {/* User Sent Message */}
              <div className="flex justify-end">
                <div className="wa-bubble-sent p-2.5 rounded-lg max-w-[85%] text-right font-mono shadow text-[11px]">
                  {botCommand}
                  <span className="block text-[9px] text-emerald-200/70 mt-0.5">19:55 ✓✓</span>
                </div>
              </div>

              {/* Bot Processing Status */}
              <div className="flex justify-start">
                <div className="wa-bubble-recv p-2.5 rounded-lg max-w-[90%] shadow text-[11px]">
                  ⏳ Sending <b>{movie.title} ({movie.year}) ({quality})</b> with Sinhala Subtitles | සිංහල උපසිරැසි සමඟ...
                  <span className="block text-[9px] text-gray-400 mt-0.5">19:55</span>
                </div>
              </div>

              {/* Bot Checkmark */}
              <div className="flex justify-start">
                <div className="wa-bubble-recv p-1.5 px-2.5 rounded-lg shadow text-xs">
                  ✅
                </div>
              </div>

              {/* Bot Movie File Attachment */}
              <div className="flex justify-start">
                <div className="wa-bubble-recv p-3 rounded-lg max-w-[85%] shadow border border-gray-700/50 space-y-2">
                  <div className="flex items-center space-x-3 bg-black/40 p-2 rounded-lg">
                    <div className="w-8 h-8 rounded bg-red-600/30 text-red-400 font-bold text-[10px] flex items-center justify-center border border-red-500/40">
                      MP4
                    </div>
                    <div>
                      <p className="font-bold text-white truncate text-[11px]">{movie.title} ({quality}).mp4</p>
                      <p className="text-[10px] text-gray-400">873 MB • MP4 Video Document</p>
                    </div>
                    <Download className="w-4 h-4 text-emerald-400 ml-auto" />
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
