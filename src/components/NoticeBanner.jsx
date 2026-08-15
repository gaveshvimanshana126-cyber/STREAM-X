import React, { useEffect, useState } from 'react';
import { Megaphone } from 'lucide-react';
import { subscribeRtdb } from '../services/firebase';

export default function NoticeBanner() {
  const [noticeData, setNoticeData] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeRtdb('settings/noticeBar', (data) => {
      if (data && data.active !== false && Array.isArray(data.notices) && data.notices.length > 0) {
        setNoticeData(data);
      } else {
        setNoticeData(null);
      }
    }, 30000);

    return () => unsubscribe();
  }, []);

  if (!noticeData) return null;

  const combinedText = noticeData.notices.filter(Boolean).join('     •     ') + '     •     ';

  return (
    <div className="bg-gradient-to-r from-red-950 via-neutral-900 to-red-950 border-b border-red-600/30 text-white py-2 px-4 flex items-center gap-3 overflow-hidden select-none text-xs font-bold shadow-md">
      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-600 rounded-full text-[10px] font-extrabold uppercase shrink-0 tracking-wider shadow-sm shadow-red-600/50">
        <Megaphone className="w-3 h-3 text-white" />
        <span>NOTICE</span>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <div className="whitespace-nowrap inline-block animate-marquee font-mono text-gray-200">
          <span>{combinedText}</span>
          <span>{combinedText}</span>
        </div>
      </div>
    </div>
  );
}
