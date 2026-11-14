import React, { useId } from 'react';
import { Gauge, MapPin, Navigation, Clock, ShieldCheck, Zap } from 'lucide-react';

export default function TrainTrackAnimation({ liveData }) {
  const maskId = useId();
  if (!liveData) return null;

  const {
    train_number,
    train_name,
    speed_kmph = 0,
    progress_percent = 0,
    current_station_name,
    current_station_code,
    previous_station_code,
    next_station_code,
    next_stop,
    status_text,
    delay_minutes = 0,
    total_distance_km = 0,
    distance_covered_km = 0,
    distance_from_current_station_km = 0,
    stations = []
  } = liveData;

  const isMoving = speed_kmph > 2;
  const isDelayed = delay_minutes > 5;
  const sourceStation = stations[0] || {};
  const destStation = stations[stations.length - 1] || {};

  // Calculate clamped progress percentage
  const progressClamped = Math.min(Math.max(Number(progress_percent) || 0, 2), 98);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-2">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#131b2e] to-[#0c1324] border border-slate-800/90 shadow-2xl p-4 sm:p-6">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-sky-400/50 to-transparent" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-28 bg-sky-500/10 blur-3xl pointer-events-none rounded-full" />

        {/* Section Header: Telemetry Summary */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
              isMoving 
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isMoving ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
              <span>{isMoving ? 'TRAIN IN MOTION' : 'HALTED / STATIONARY'}</span>
            </div>

            <div className="flex items-center gap-1 text-xs font-mono font-bold text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700/60">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{speed_kmph} km/h</span>
            </div>
          </div>

          {/* Delay Status Indicator */}
          <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
            delay_minutes <= 0
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
              : delay_minutes <= 15
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            <span>{status_text || (delay_minutes > 0 ? `${delay_minutes} min late` : 'Right Time')}</span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* ANIMATED TRAIN CANVAS / TRACK STAGE                           */}
        {/* ============================================================== */}
        <div className="relative w-full h-44 sm:h-52 bg-gradient-to-b from-slate-950/80 to-[#070b14] rounded-2xl border border-slate-800/80 overflow-hidden flex flex-col justify-end">
          
          {/* Distant Night Horizon & Mountain Silhouettes */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            {/* Stars */}
            <div className="absolute top-3 left-10 w-1 h-1 bg-white rounded-full opacity-60" />
            <div className="absolute top-7 left-36 w-1 h-1 bg-sky-200 rounded-full opacity-80" />
            <div className="absolute top-4 right-20 w-1 h-1 bg-amber-100 rounded-full opacity-70" />
            <div className="absolute top-9 right-48 w-1 h-1 bg-white rounded-full opacity-50" />
            <div className="absolute top-5 left-1/2 w-1.5 h-1.5 bg-sky-300 rounded-full opacity-90 animate-pulse" />
            
            {/* Soft Mountain Outlines */}
            <svg className="absolute bottom-16 left-0 right-0 w-full h-20 text-slate-800/40 fill-current" preserveAspectRatio="none" viewBox="0 0 800 120">
              <polygon points="0,120 0,60 120,20 220,70 340,15 480,80 620,30 750,90 800,40 800,120" />
            </svg>
            {/* Telegraph Poles passing in background if moving */}
            <div className={`absolute bottom-16 left-0 right-0 h-10 ${isMoving ? 'animated-track-pattern' : ''} opacity-30`} />
          </div>

          {/* Electric OHE Wire Overhead */}
          <div className="absolute bottom-28 left-0 right-0 h-px bg-slate-700/80">
            {/* OHE drop lines */}
            <div className="absolute top-0 left-12 w-px h-6 bg-slate-700" />
            <div className="absolute top-0 left-48 w-px h-6 bg-slate-700" />
            <div className="absolute top-0 left-96 w-px h-6 bg-slate-700" />
            <div className="absolute top-0 right-32 w-px h-6 bg-slate-700" />
          </div>

          {/* THE MOVING TRAIN & ENGINE */}
          <div 
            className="relative z-10 w-full transition-all duration-1000 ease-out"
            style={{ paddingBottom: '32px' }}
          >
            {/* Train Container positioned relative to progress percentage or centered showcase */}
            <div className="w-full flex items-center justify-center overflow-visible">
              <div className={`relative flex items-end ${isMoving ? 'animate-train-chug' : ''}`}>
                
                {/* Pantograph Spark Animation (Electric Locomotive) */}
                {isMoving && (
                  <div className="absolute -top-7 left-24 w-3 h-3 rounded-full bg-sky-400 blur-[2px] animate-ping opacity-80" />
                )}

                {/* Speed Drift / Wind particles trailing behind */}
                {isMoving && (
                  <div className="absolute -left-16 bottom-6 flex flex-col gap-1 pointer-events-none">
                    <span className="w-12 h-0.5 bg-gradient-to-l from-sky-400/80 to-transparent rounded animate-smoke-drift" />
                    <span className="w-8 h-0.5 bg-gradient-to-l from-sky-300/60 to-transparent rounded animate-smoke-drift delay-75" />
                    <span className="w-14 h-0.5 bg-gradient-to-l from-cyan-400/70 to-transparent rounded animate-smoke-drift delay-150" />
                  </div>
                )}

                {/* SVG TRAIN: LOCOMOTIVE + 2 PASSENGER COACHES */}
                <svg className="w-72 sm:w-96 h-24 overflow-visible" viewBox="0 0 380 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id={`locoGrad-${maskId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="45%" stopColor="#0284c7" />
                      <stop offset="100%" stopColor="#082f49" />
                    </linearGradient>
                    <linearGradient id={`coachGrad-${maskId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1e293b" />
                      <stop offset="100%" stopColor="#0f172a" />
                    </linearGradient>
                    <linearGradient id={`accentStripe-${maskId}`} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#fbbf24" />
                    </linearGradient>
                    <filter id={`headlightGlow-${maskId}`} x="-30%" y="-30%" width="160%" height="160%">
                      <feGaussianBlur stdDeviation="6" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Coach 2 (Rear) */}
                  <g transform="translate(10, 18)">
                    <rect x="0" y="8" width="80" height="42" rx="4" fill={`url(#coachGrad-${maskId})`} stroke="#334155" strokeWidth="1.5" />
                    {/* Coach windows with warm passenger light */}
                    <rect x="8" y="15" width="12" height="14" rx="2" fill="#38bdf8" opacity="0.85" />
                    <rect x="25" y="15" width="12" height="14" rx="2" fill="#38bdf8" opacity="0.85" />
                    <rect x="42" y="15" width="12" height="14" rx="2" fill="#38bdf8" opacity="0.85" />
                    <rect x="59" y="15" width="12" height="14" rx="2" fill="#38bdf8" opacity="0.85" />
                    {/* Coach red/orange livery stripe */}
                    <rect x="0" y="36" width="80" height="4" fill="#0284c7" />
                    {/* Coupler */}
                    <rect x="80" y="32" width="10" height="4" fill="#475569" />
                    {/* Coach wheels */}
                    <circle cx="18" cy="53" r="7" fill="#1e293b" stroke="#64748b" strokeWidth="2.5" />
                    <circle cx="62" cy="53" r="7" fill="#1e293b" stroke="#64748b" strokeWidth="2.5" />
                  </g>

                  {/* Coach 1 (Middle) */}
                  <g transform="translate(100, 18)">
                    <rect x="0" y="8" width="80" height="42" rx="4" fill={`url(#coachGrad-${maskId})`} stroke="#334155" strokeWidth="1.5" />
                    <rect x="8" y="15" width="12" height="14" rx="2" fill="#38bdf8" opacity="0.85" />
                    <rect x="25" y="15" width="12" height="14" rx="2" fill="#38bdf8" opacity="0.85" />
                    <rect x="42" y="15" width="12" height="14" rx="2" fill="#38bdf8" opacity="0.85" />
                    <rect x="59" y="15" width="12" height="14" rx="2" fill="#38bdf8" opacity="0.85" />
                    <rect x="0" y="36" width="80" height="4" fill="#0284c7" />
                    {/* Coupler to loco */}
                    <rect x="80" y="32" width="10" height="4" fill="#475569" />
                    {/* Wheels */}
                    <circle cx="18" cy="53" r="7" fill="#1e293b" stroke="#64748b" strokeWidth="2.5" />
                    <circle cx="62" cy="53" r="7" fill="#1e293b" stroke="#64748b" strokeWidth="2.5" />
                  </g>

                  {/* HIGH SPEED LOCOMOTIVE (Front Lead Engine) */}
                  <g transform="translate(190, 8)">
                    {/* Pantograph */}
                    <path d="M 35 18 L 45 4 L 62 4 L 52 18" stroke="#94a3b8" strokeWidth="2.5" strokeLinejoin="round" fill="none" />
                    <line x1="42" y1="4" x2="68" y2="4" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="68" cy="4" r="2" fill="#38bdf8" />

                    {/* Aerodynamic Engine Shell (Vande Bharat / WAP-7 style) */}
                    <path 
                      d="M 0 18 
                         L 110 18 
                         C 145 18, 165 35, 172 50 
                         C 175 56, 172 62, 165 62 
                         L 0 62 
                         Z" 
                      fill={`url(#locoGrad-${maskId})`} 
                    />

                    {/* Driver Windshield Cockpit */}
                    <path d="M 112 24 L 148 29 C 158 35, 160 44, 155 46 L 112 42 Z" fill="#0f172a" />
                    <path d="M 118 27 L 145 31 C 151 35, 152 40, 148 42 L 118 39 Z" fill="#38bdf8" opacity="0.6" />

                    {/* Speed Liveries */}
                    <path d="M 0 46 L 165 46" stroke={`url(#accentStripe-${maskId})`} strokeWidth="3.5" />
                    <text x="25" y="40" fill="#ffffff" fontSize="9" fontWeight="800" letterSpacing="1" fontFamily="sans-serif">
                      IR • {train_number || 'RAPID'}
                    </text>

                    {/* Headlight Beam Cone illuminating the track ahead */}
                    <polygon 
                      points="168,52 300,35 300,75 168,58" 
                      fill="url(#headlightBeam)" 
                      opacity={isMoving ? 0.75 : 0.35} 
                    />
                    {/* Headlight Bulb */}
                    <circle cx="168" cy="54" r="3.5" fill="#ffffff" filter={`url(#headlightGlow-${maskId})`} />
                    <circle cx="168" cy="54" r="1.5" fill="#fef08a" />

                    {/* Locomotive Wheels with suspension bogies */}
                    <circle cx="28" cy="63" r="8" fill="#1e293b" stroke="#64748b" strokeWidth="2.5" />
                    <circle cx="28" cy="63" r="3" fill="#cbd5e1" />
                    <circle cx="68" cy="63" r="8" fill="#1e293b" stroke="#64748b" strokeWidth="2.5" />
                    <circle cx="68" cy="63" r="3" fill="#cbd5e1" />
                    <circle cx="120" cy="63" r="8" fill="#1e293b" stroke="#64748b" strokeWidth="2.5" />
                    <circle cx="120" cy="63" r="3" fill="#cbd5e1" />

                    {/* Rotating wheel spoke markers if moving */}
                    {isMoving && (
                      <>
                        <line x1="28" y1="56" x2="28" y2="70" stroke="#94a3b8" strokeWidth="1.5" className="animate-spin origin-[28px_63px]" />
                        <line x1="68" y1="56" x2="68" y2="70" stroke="#94a3b8" strokeWidth="1.5" className="animate-spin origin-[68px_63px]" />
                        <line x1="120" y1="56" x2="120" y2="70" stroke="#94a3b8" strokeWidth="1.5" className="animate-spin origin-[120px_63px]" />
                      </>
                    )}
                  </g>

                  {/* Gradient for headlight beam */}
                  <linearGradient id="headlightBeam" x1="0%" y1="50%" x2="100%" y2="50%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                    <stop offset="30%" stopColor="#38bdf8" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                  </linearGradient>
                </svg>

              </div>
            </div>
          </div>

          {/* RAILWAY TRACKS & MOVING SLEEPERS */}
          <div className="relative w-full h-8 bg-slate-900 border-t-2 border-sky-500/70 shadow-lg shadow-sky-500/20">
            {/* Top glowing rail */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-white to-sky-400 opacity-90" />
            
            {/* Dynamic Moving Sleepers */}
            <div className={`w-full h-full ${isMoving ? 'animated-track-pattern' : 'bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.08)_0px,rgba(255,255,255,0.08)_4px,transparent_4px,transparent_20px)]'}`} />
            
            {/* Bottom Ballast / Gravel Bed */}
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-[#0c101c]" />
          </div>

        </div>

        {/* ============================================================== */}
        {/* JOURNEY ROUTE PROGRESS TIMELINE BAR                            */}
        {/* ============================================================== */}
        <div className="mt-6 pt-2">
          
          {/* Progress Bar Container with Train Marker Pin */}
          <div className="relative">
            {/* Background Rail Line */}
            <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
              <div 
                className="h-full bg-gradient-to-r from-sky-500 via-teal-400 to-emerald-400 rounded-full transition-all duration-700 relative shadow-sm"
                style={{ width: `${progressClamped}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            </div>

            {/* Glowing Current Train Pin on the Progress Bar */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-700 z-20 flex flex-col items-center"
              style={{ left: `${progressClamped}%` }}
            >
              <div className="relative flex items-center justify-center">
                <span className="radar-ring absolute w-7 h-7 rounded-full bg-sky-400/40" />
                <div className="w-5 h-5 rounded-full bg-sky-400 border-2 border-slate-900 shadow-lg shadow-sky-400/80 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                </div>
              </div>
            </div>
          </div>

          {/* Current Station & Distance Telemetry Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
            
            {/* Origin / Previous Stop */}
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-2.5">
              <div className="p-2 rounded-xl bg-slate-800 text-slate-400 shrink-0">
                <Navigation className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Departed / Prev
                </span>
                <p className="text-sm font-extrabold text-white truncate">
                  {previous_station_code || sourceStation.station_code || 'Origin'}
                </p>
                <p className="text-xs text-slate-400 font-medium">
                  {sourceStation.station_name || 'Source Station'}
                </p>
              </div>
            </div>

            {/* Current Position / Live Status */}
            <div className="p-3 rounded-2xl bg-sky-950/40 border border-sky-500/30 flex items-start gap-2.5 shadow-lg shadow-sky-950/50">
              <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 shrink-0">
                <MapPin className="w-4 h-4 animate-bounce" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-extrabold text-sky-400 uppercase tracking-wider">
                    Current Location
                  </span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                </div>
                <p className="text-sm font-extrabold text-white truncate">
                  {current_station_name} ({current_station_code || 'LIVE'})
                </p>
                <p className="text-xs text-sky-300/80 font-medium">
                  {distance_from_current_station_km > 0 
                    ? `${distance_from_current_station_km.toFixed(1)} km past station`
                    : 'Passing through'}
                </p>
              </div>
            </div>

            {/* Next Stop / Destination */}
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  Next Halting Stop
                </span>
                <p className="text-sm font-extrabold text-white truncate">
                  {next_stop?.station_name || destStation.station_name || 'Destination'}
                </p>
                <p className="text-xs text-slate-400 font-medium">
                  {next_stop?.eta 
                    ? `ETA: ${new Date(next_stop.eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` 
                    : `Platform ${next_stop?.platform_number || '-'}`}
                </p>
              </div>
            </div>

          </div>

          {/* Progress Distance Tracker */}
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mt-4 px-1">
            <span>{distance_covered_km.toFixed(0)} km covered ({progressClamped.toFixed(1)}%)</span>
            <span>Total: {total_distance_km} km</span>
          </div>

        </div>

      </div>
    </div>
  );
}

