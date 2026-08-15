import React, { useState } from 'react';
import { ArrowLeft, Info, HelpCircle, Heart, ChevronDown } from 'lucide-react';

export default function AboutPage({ isOpen, onClose }) {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: 'Cineflix කියන්නේ මොකක්ද?',
      a: 'Cineflix කියන්නේ ශ්‍රී ලංකාවේ චිත්‍රපට සහ ටෙලි කතාමාලා ප්‍රේක්ෂකයින් උදෙසා සිංහල උපසිරැසි සමඟින් Direct Download කරගැනීමට සකස් කරන ලද 100% ක් නොමිලේ ලබාදෙන වෙබ් අඩවියකි.'
    },
    {
      q: 'මෙහි ඇති Movies සහ TV Shows නරඹන්නේ කෙසේද?',
      a: 'ඕනෑම Movie හෝ TV Series එකක් මත Click කර එහි ඇති Direct Download, Telegram හෝ Server ලින්ක් මඟින් ඉතා පහසුවෙන් Download කරගත හැක.'
    },
    {
      q: 'Sinhala Subtitles ලබාගන්නේ කෙසේද?',
      a: 'සෑම චිත්‍රපට විස්තර පිටුවකම ඇති "SINHALA SUBTITLE" Button එක Click කර SRT File එක කෙලින්ම Download කරගත හැක.'
    },
    {
      q: 'Cineflix හි ගිණුමක් සෑදීම අනිවාර්යද?',
      a: 'නැත. ගිණුමක් නොමැතිව වුවද Movies Download කරගත හැක. නමුත් Profile එකක් සෑදීමෙන් Watchlist, Movie Requests සහ Comments පහසුකම් ලබාගත හැක.'
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] bg-neutral-950 text-white overflow-y-auto animate-fade-in p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <button onClick={onClose} className="flex items-center gap-2 text-xs font-extrabold text-gray-400 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" /> BACK TO HOME
          </button>
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-red-600" />
            <h1 className="text-2xl font-black tracking-wider uppercase">ABOUT CINEFLIX</h1>
          </div>
        </div>

        {/* Mission Card */}
        <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>🎬</span> Our Mission
          </h2>
          <p className="text-sm text-gray-300 leading-relaxed">
            Cineflix is built for movie lovers in Sri Lanka, focused on one goal — <b>bringing Sinhala subtitles</b> to the latest Hollywood, Bollywood, and Asian releases. Our mission is simple: make great stories accessible to every Sinhala speaker.
          </p>
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs font-medium">
            ⚠️ <b>Disclaimer:</b> Cineflix does not host any video files on its own servers. All content is linked from third-party sources available publicly on the internet.
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-red-500" /> Frequently Asked Questions
          </h2>
          {faqs.map((f, i) => (
            <div key={i} className="bg-neutral-900 border border-white/10 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full p-4 text-left font-bold text-sm text-white flex items-center justify-between hover:bg-white/5 transition"
              >
                <span>{f.q}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${openFaq === i ? 'rotate-180 text-red-500' : ''}`} />
              </button>
              {openFaq === i && (
                <div className="p-4 pt-0 text-xs text-gray-300 border-t border-white/5 leading-relaxed bg-black/40">
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Subtitle Credits */}
        <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-600 fill-current" /> Subtitle Credits
          </h2>
          <p className="text-xs text-gray-400">
            We are grateful to the dedicated Sinhala subtitle translation communities:
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            {['Baiscope.lk', 'Cineru.lk', 'Lksubs', 'Cinem.lk'].map((name) => (
              <span key={name} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-gray-200">
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
