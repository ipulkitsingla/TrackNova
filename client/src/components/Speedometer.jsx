import React, { useId } from 'react';
import { Gauge, Zap, TrendingUp, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';

export default function Speedometer({ liveData }) {
  const maskId = useId();
  if (!liveData) return null;

  const {
    speed_kmph = 0,
    delay_minutes = 0,
    confidence = 'high',
    eta_destination_at,
    total_distance_km = 0,
    distance_covered_km = 0,
    freshness
  } = liveData;

  const maxSpeed = 160; // Max speed dial range for Indian Railways
  const speedClamped = Math.min(Math.max(Number(speed_kmph) || 0, 0), maxSpeed);
  
  // Angle for speedometer needle: from -120deg (0 km/h) to +120deg (160 km/h)
  const angle = -120 + (speedClamped / maxSpeed) * 240;

  // Arc path calculation for SVG gauge
  // Radius = 90, Center = (110, 110)
  const remainingDist = Math.max(total_distance_km - distance_covered_km, 0);

  const getSpeedCategory = (s) => {
    if (s === 0) return { label: 'STATIONARY', color: 'text-slate-400', bg: 'bg-slate-800' };
    if (s < 30) return { label: 'APPROACHING / SLOW', color: 'text-amber-400', bg: 'bg-amber-500/10' };
    if (s < 80) return { label: 'CRUISING SPEED', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    if (s < 120) return { label: 'EXPRESS CORRIDOR', color: 'text-sky-400', bg: 'bg-sky-500/10' };
    return { label: 'HIGH-SPEED RAPID', color: 'text-violet-400', bg: 'bg-violet-500/10' };
  };

  const speedCat = getSpeedCategory(speed_kmph);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* ============================================================== */}
        {/* SPEEDOMETER HUD DIAL                                          */}
        {/* ============================================================== */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#131b2e] to-[#0c1324] border border-slate-800/90 shadow-xl p-5 flex flex-col items-center justify-between">
          <div className="w-full flex items-center justify-between mb-2">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-sky-400" />
              Live Telemetry Speed
            </span>
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${speedCat.bg} ${speedCat.color} border-current/20`}>
              {speedCat.label}
            </span>
          </div>

          {/* SVG Speedometer Gauge Arc */}
          <div className="relative w-56 h-40 flex items-center justify-center">
            <svg className="w-56 h-40 overflow-visible" viewBox="0 0 220 150">
              <defs>
                <linearGradient id={`speedArcGrad-${maskId}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#10b981" />
                  <stop offset="85%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
                <filter id={`needleGlow-${maskId}`} x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Background Arc Track */}
              <path
                d="M 25 125 A 85 85 0 1 1 195 125"
                fill="none"
                stroke="#1e293b"
                strokeWidth="14"
                strokeLinecap="round"
              />

              {/* Colored Speed Arc with dash calculation */}
              <path
                d="M 25 125 A 85 85 0 1 1 195 125"
                fill="none"
                stroke={`url(#speedArcGrad-${maskId})`}
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray="360"
                strokeDashoffset={360 - (speedClamped / maxSpeed) * 360 * 0.74}
                className="transition-all duration-700 ease-out"
              />

              {/* Tick Marks */}
              {[0, 20, 40, 60, 80, 100, 120, 140, 160].map((val) => {
                const tickAngle = (-120 + (val / maxSpeed) * 240) * (Math.PI / 180);
                const x1 = 110 + 72 * Math.cos(tickAngle);
                const y1 = 110 + 72 * Math.sin(tickAngle);
                const x2 = 110 + 64 * Math.cos(tickAngle);
                const y2 = 110 + 64 * Math.sin(tickAngle);
                return (
                  <line
                    key={val}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#475569"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                );
              })}

              {/* Needle */}
              <g
                transform={`rotate(${angle}, 110, 110)`}
                className="transition-transform duration-700 ease-out"
              >
                <line
                  x1="110"
                  y1="110"
                  x2="110"
                  y2="34"
                  stroke="#38bdf8"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  filter={`url(#needleGlow-${maskId})`}
                />
                <circle cx="110" cy="110" r="8" fill="#0f172a" stroke="#38bdf8" strokeWidth="3" />
                <circle cx="110" cy="110" r="3" fill="#ffffff" />
              </g>
            </svg>

            {/* Speed Digital Readout Overlay */}
            <div className="absolute bottom-1 flex flex-col items-center">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black tracking-tight text-white font-mono drop-shadow">
                  {speed_kmph}
                </span>
                <span className="text-xs font-bold text-sky-400">km/h</span>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wider">
                MAX 160 KM/H
              </span>
            </div>
          </div>

          <div className="w-full flex items-center justify-between text-xs text-slate-400 mt-2 px-2 pt-2 border-t border-slate-800/80">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Confidence: <strong className="text-slate-200 capitalize">{confidence}</strong>
            </span>
            <span className="text-[11px] text-slate-500">
              {freshness?.retrieved_at ? 'Live GPS Sync' : 'Real-time'}
            </span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* DESTINATION ETA & DISTANCE METRICS                            */}
        {/* ============================================================== */}
        <div className="rounded-3xl bg-gradient-to-b from-[#131b2e] to-[#0c1324] border border-slate-800/90 shadow-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              Journey ETA & Remaining
            </span>
            <span className="text-xs font-mono font-bold text-slate-400">
              {remainingDist.toFixed(0)} km to go
            </span>
          </div>

          {/* Large ETA Display */}
          <div className="my-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold block mb-1">
              Estimated Final Destination Arrival
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                {eta_destination_at 
                  ? new Date(eta_destination_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '--:--'}
              </span>
              <span className="text-xs text-slate-400 font-bold">
                {eta_destination_at 
                  ? new Date(eta_destination_at).toLocaleDateString([], { month: 'short', day: 'numeric' })
                  : ''}
              </span>
            </div>

            {/* Delay explanation */}
            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">Schedule Variation:</span>
              <span className={`font-bold ${delay_minutes > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {delay_minutes > 0 ? `+${delay_minutes} min late` : 'On Time'}
              </span>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/60">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Distance Traveled</span>
              <span className="text-sm font-extrabold text-white font-mono">{distance_covered_km.toFixed(1)} km</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/60">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Remaining Route</span>
              <span className="text-sm font-extrabold text-white font-mono">{remainingDist.toFixed(1)} km</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

