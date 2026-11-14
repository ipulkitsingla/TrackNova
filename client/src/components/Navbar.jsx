import React from 'react';
import { Bookmark, Download, RefreshCw, Zap, Train } from 'lucide-react';

export default function Navbar({
  onOpenFavorites,
  favoritesCount,
  onRefresh,
  isRefreshing,
  deferredPrompt,
  onInstallClick
}) {
  return (
    <header className="sticky top-0 z-40 bg-[#0a0f1d]/90 backdrop-blur-md border-b border-slate-800/80 pt-safe px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 shadow-lg shadow-sky-500/20 text-white">
            <Train className="w-5 h-5 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-tight text-white">
                TRACK<span className="text-sky-400">NOVA</span>
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 uppercase tracking-wider">
                Live
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Real-Time Indian Railways GPS</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* PWA Install Button */}
          {deferredPrompt && (
            <button
              onClick={onInstallClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all active:scale-95"
              title="Install TrackNova App on your phone"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Install App</span>
              <span className="sm:hidden">Install</span>
            </button>
          )}

          {/* Quick Manual Refresh */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className={`p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60 transition-all ${
              isRefreshing ? 'opacity-50 cursor-not-allowed' : 'active:scale-90'
            }`}
            title="Refresh Live Status"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-sky-400' : ''}`} />
          </button>

          {/* Saved / Favorites Trigger */}
          <button
            onClick={onOpenFavorites}
            className="relative p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-amber-400 border border-slate-700/60 transition-all active:scale-90"
            title="Saved Trains"
          >
            <Bookmark className="w-4 h-4" />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-[10px] font-black text-slate-950 flex items-center justify-center shadow">
                {favoritesCount}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
}

