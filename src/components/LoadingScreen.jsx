import React from 'react';

export default function LoadingScreen({ isFadingOut }) {
  return (
    <div className={`loading-screen ${isFadingOut ? 'fade-out' : ''}`}>
      {/* Film Reel Spinner matching index (45).html */}
      <div className="loading-reel" id="loadingSpinner">
        <div className="loading-reel-hole"></div>
        <div className="loading-reel-hole"></div>
        <div className="loading-reel-hole"></div>
        <div className="loading-reel-hole"></div>
        <div className="loading-reel-inner"></div>
      </div>

      {/* Cineflix Logo Text */}
      <div className="loading-logo">
        Cine<span>flix</span>
      </div>

      {/* Sub Tagline */}
      <div className="loading-tagline">
        Unlimited Movies · Endless Entertainment
      </div>

      {/* Dots */}
      <div className="loading-dots">
        <div className="loading-dot"></div>
        <div className="loading-dot"></div>
        <div className="loading-dot"></div>
      </div>
    </div>
  );
}
