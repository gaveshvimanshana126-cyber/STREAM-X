import React, { useState } from 'react';
import { X, Send, Film, MessageSquare, CheckCircle } from 'lucide-react';

export default function RequestMovieModal({ onClose }) {
  const [movieName, setMovieName] = useState('');
  const [year, setYear] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!movieName) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-lg glass-panel rounded-3xl p-6 border border-gray-700 shadow-2xl bg-[#0f1118]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-800 hover:bg-red-600 text-gray-400 hover:text-white transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-['Poppins']">Request a Movie / Series</h3>
            <p className="text-xs text-gray-400">අවශ්‍ය චිත්‍රපටය හෝ ටෙලිනාට්‍ය මෙහි සටහන් කරන්න</p>
          </div>
        </div>

        {submitted ? (
          <div className="text-center py-8 space-y-2">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-white">Request Submitted!</h4>
            <p className="text-xs text-gray-400">ඔබගේ ඉල්ලීම Cineflix කණ්ඩායම වෙත යොමු කරන ලදී.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                Movie / Series Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Idhayam Murali, Anyone but You"
                value={movieName}
                onChange={(e) => setMovieName(e.target.value)}
                className="w-full bg-black border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                Release Year (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 2026"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full bg-black border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-red-600/30 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Submit Request</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
