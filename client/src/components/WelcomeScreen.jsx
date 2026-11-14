import React from 'react';
import { Train, Search, Sparkles, Gauge, MapPin, Clock, ArrowRight, ShieldCheck, Smartphone } from 'lucide-react';

export default function WelcomeScreen({ onSelectTrain, popularTrains = [], history = [] }) {
  return (
    <div className="px-4 py-6 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Hero Welcome Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#131b2e] to-[#0c1324] border border-slate-800 shadow-2xl p-6 sm:p-8 text-center">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-sky-400/50 to-transparent" />
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-28 bg-sky-500/15 blur-3xl pointer-events-none rounded-full" />

        {/* Central Train Graphic Badge */}
        <div className="relative inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-sky-500 to-blue-700 shadow-xl shadow-sky-500/30 text-white mb-4">
          <Train className="w-8 h-8 sm:w-10 sm:h-10 animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Live Indian Train Tracking
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-lg mx-auto mt-2 font-medium">
          Enter any 5-digit train number or train name above to view real-time GPS radar, live speed, platform numbers & delay estimates.
        </p>

        {/* Feature Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
          <span className="px-3 py-1.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-bold flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5" />
            Live Speedometer HUD
          </span>
          <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            GPS Radar Route Map
          </span>
          <span className="px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Accurate Platform & Delay
          </span>
          <span className="px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5" />
            PWA Installable App
          </span>
        </div>
      </div>

      {/* Popular Trains Quick Launch Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-black text-white flex items-center gap-1.5 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Popular Indian Trains
          </h2>
          <span className="text-xs text-slate-400 font-semibold">Tap to track live</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {popularTrains.map((train) => (
            <button
              key={train.train_number}
              onClick={() => onSelectTrain(train.train_number)}
              className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-sky-500/40 text-left transition-all active:scale-[0.98] group shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm font-black text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded-lg border border-sky-800/50">
                    {train.train_number}
                  </span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wide">
                    {train.type || 'EXPRESS'}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors line-clamp-1">
                  {train.train_name}
                </h3>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1">
                  <strong>{train.from}</strong>
                  <span className="text-sky-400">➔</span>
                  <strong>{train.to}</strong>
                </span>
                <span className="text-sky-400 group-hover:translate-x-1 transition-transform flex items-center text-[11px] font-bold">
                  Track <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent History Quick Resumption (if available) */}
      {history.length > 0 && (
        <div className="p-4 rounded-3xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-2 px-1">
            Recently Tracked
          </span>
          <div className="flex flex-wrap gap-2">
            {history.slice(0, 5).map((item) => (
              <button
                key={item.trainNumber}
                onClick={() => onSelectTrain(item.trainNumber)}
                className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-xs font-bold text-slate-200 border border-slate-700/60 flex items-center gap-2 transition-all active:scale-95"
              >
                <span className="font-mono text-sky-400">{item.trainNumber}</span>
                <span className="truncate max-w-[140px] text-slate-300">{item.trainName}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No Signup Guarantee Banner */}
      <div className="text-center py-4 text-xs text-slate-500 font-medium flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>100% Free & Open Access • Zero Login or Sign-up Required</span>
      </div>

    </div>
  );
}
