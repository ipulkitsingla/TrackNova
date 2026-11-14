import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Share } from 'lucide-react';

export default function PwaInstallPrompt({ deferredPrompt, onInstallSuccess }) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running as installed standalone PWA
    const isApp = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    setIsStandalone(isApp);

    // Detect iOS Safari
    const ua = window.navigator.userAgent;
    const isIosDevice = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
    setIsIOS(isIosDevice && isSafari && !isApp);
  }, []);

  if (isStandalone || isDismissed) return null;
  if (!deferredPrompt && !isIOS) return null;

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      if (onInstallSuccess) onInstallSuccess();
    }
    setIsDismissed(true);
  };

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 z-50 max-w-md mx-auto animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-sky-500/40 rounded-3xl p-4 shadow-2xl shadow-sky-950/60 flex items-center justify-between gap-3">
        
        {/* App Logo & Text */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 shadow-md flex items-center justify-center text-white shrink-0">
            <Smartphone className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-black text-white flex items-center gap-1.5">
              <span>Install TrackNova App</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 font-extrabold border border-sky-500/30 uppercase">
                PWA
              </span>
            </h4>
            <p className="text-xs text-slate-300 font-medium line-clamp-1">
              {isIOS 
                ? 'Tap Share ⎋ and choose "Add to Home Screen"' 
                : 'Fast 1-tap live GPS tracking & offline support'}
            </p>
          </div>
        </div>

        {/* Action Button & Dismiss */}
        <div className="flex items-center gap-2 shrink-0">
          {!isIOS ? (
            <button
              onClick={handleInstallClick}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-black shadow-lg shadow-sky-500/30 transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
          ) : (
            <div className="p-2 rounded-xl bg-slate-800 text-sky-400 border border-slate-700">
              <Share className="w-4 h-4" />
            </div>
          )}

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}

