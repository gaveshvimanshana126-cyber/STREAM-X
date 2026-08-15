import React, { useState } from 'react';
import { X, Send, Check, Phone, User, Film, MessageCircle, Sparkles } from 'lucide-react';
import { rtdbPush } from '../services/firebase.js';

export default function WhatsAppDeliveryModal({ movie, selectedQuality = '720p', onClose }) {
  if (!movie) return null;

  const [userName, setUserName] = useState('');
  const [phone, setPhone] = useState('');
  const [quality, setQuality] = useState(selectedQuality || '720p');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userName.trim() || !phone.trim()) {
      alert('කරුණාකර ඔබගේ නම සහ WhatsApp දුරකථන අංකය ඇතුළත් කරන්න.');
      return;
    }

    setSubmitting(true);

    // Clean phone number (e.g. 0771234567 -> 94771234567)
    let cleanNum = phone.replace(/[^0-9]/g, '');
    if (cleanNum.startsWith('0')) {
      cleanNum = '94' + cleanNum.substring(1);
    }

    const requestData = {
      movieId: movie.id,
      movieTitle: movie.title,
      movieYear: movie.year || '2025',
      userName: userName.trim(),
      phone: cleanNum,
      quality: quality,
      status: 'pending',
      time: Date.now()
    };

    try {
      // 1. Push request to Firebase Realtime Database for automatic Bot queue delivery
      await rtdbPush('bot_requests', requestData);

      setSubmitting(false);
      setSuccess(true);

      // Auto close modal after 3.5 seconds
      setTimeout(() => {
        onClose();
      }, 3500);

    } catch (err) {
      setSubmitting(false);
      alert('Error submitting request: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-['Nunito',sans-serif] animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#111111] border border-emerald-500/40 rounded-3xl p-6 shadow-2xl space-y-5">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-900 hover:bg-red-600 text-gray-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title Header */}
        <div className="flex items-center space-x-3 text-emerald-400">
          <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/30">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-sm font-['Poppins']">WHATSAPP DIRECT MOVIE DELIVERY</h3>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">CINEFLIX BOT QUEUE</span>
          </div>
        </div>

        {/* Movie Info Box */}
        <div className="p-3 bg-black/50 border border-gray-800 rounded-2xl flex items-center space-x-3">
          <img
            src={movie.poster || movie.backdrop}
            alt={movie.title}
            className="w-12 h-16 object-cover rounded-xl border border-gray-800"
          />
          <div>
            <h4 className="text-xs font-bold text-white truncate">{movie.title}</h4>
            <span className="text-[10px] text-gray-400 font-semibold">{movie.year} • {quality.toUpperCase()}</span>
          </div>
        </div>

        {/* Success Alert */}
        {success ? (
          <div className="p-4 bg-emerald-950/80 border border-emerald-500/60 rounded-2xl text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-500 text-black flex items-center justify-center mx-auto font-black">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="text-xs font-bold text-white">ඉල්ලීම සාර්ථකව යවන ලදී!</h4>
            <p className="text-[11px] text-emerald-300 leading-relaxed">
              Bot එක විසින් ඔබගේ WhatsApp අංකය (<strong className="text-white">+{phone}</strong>) වෙත චිත්‍රපටය කෙලින්ම යවනු ඇත. 🚀
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                <User className="w-3 h-3 text-emerald-400" />
                <span>ඔබගේ නම (Your Name) *</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Gavesh / Kasun"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-black/60 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                <Phone className="w-3 h-3 text-emerald-400" />
                <span>WhatsApp Phone Number *</span>
              </label>
              <input
                type="text"
                required
                placeholder="0771234567 / 94771234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-black/60 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Quality</label>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                className="w-full bg-black/60 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-emerald-400 font-bold focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="720p">720P HD</option>
                <option value="1080p">1080P Full HD</option>
                <option value="480p">480P Low Data</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center space-x-2 cursor-pointer uppercase tracking-wider"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'SENDING REQUEST...' : 'SEND MOVIE TO MY WHATSAPP'}</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
