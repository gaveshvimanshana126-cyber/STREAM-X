import React from 'react';
import { X, MessageCircle, Terminal, QrCode, CheckCircle2, Play, FolderCheck, ShieldAlert } from 'lucide-react';

export default function WhatsAppBotGuideModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-2xl glass-panel rounded-3xl overflow-hidden border border-emerald-500/40 shadow-2xl bg-[#0d1217]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-gradient-to-r from-emerald-950 via-gray-900 to-gray-900">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">WhatsApp Bot Setup Guide</h3>
              <p className="text-xs text-emerald-400">Bot Code folder setup & execution instructions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-gray-800 hover:bg-red-600 text-gray-400 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-sm text-gray-300">
          
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-start space-x-3">
            <FolderCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <p className="font-bold text-emerald-300 mb-1">Bot Folder Location:</p>
              <code className="px-2 py-1 rounded bg-black/60 font-mono text-emerald-400">bot code/</code>
              <p className="mt-1 text-gray-300">
                The WhatsApp bot code is stored separately in the <span className="font-bold text-white">bot code</span> directory as requested. It runs independently of the React website.
              </p>
            </div>
          </div>

          {/* Setup Steps */}
          <div className="space-y-4">
            
            {/* Step 1 */}
            <div className="p-4 rounded-2xl bg-gray-900 border border-gray-800 space-y-2">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-gray-950 text-xs font-black flex items-center justify-center">1</span>
                <h4 className="font-bold text-white">Open Terminal & Navigate to Bot Folder</h4>
              </div>
              <div className="bg-black p-3 rounded-xl font-mono text-xs text-emerald-300 border border-gray-800">
                cd "bot code"<br />
                npm install
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-2xl bg-gray-900 border border-gray-800 space-y-2">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-gray-950 text-xs font-black flex items-center justify-center">2</span>
                <h4 className="font-bold text-white">Start the WhatsApp Bot</h4>
              </div>
              <div className="bg-black p-3 rounded-xl font-mono text-xs text-emerald-300 border border-gray-800">
                npm start
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-2xl bg-gray-900 border border-gray-800 space-y-2">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-gray-950 text-xs font-black flex items-center justify-center">3</span>
                <h4 className="font-bold text-white">Scan WhatsApp QR Code in Terminal</h4>
              </div>
              <p className="text-xs text-gray-400">
                Open WhatsApp on your phone → <span className="text-white font-semibold">Settings → Linked Devices → Link a Device</span> and scan the QR code displayed in the terminal.
              </p>
            </div>

          </div>

          <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800 text-xs space-y-1">
            <h5 className="font-bold text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Bot Status & Verification
            </h5>
            <p className="text-gray-400">
              Once connected, any user sending a movie code from Cineflix will automatically receive the status message and direct video document attachment!
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
