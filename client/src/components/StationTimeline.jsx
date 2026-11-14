import React, { useState } from 'react';
import { CheckCircle2, Clock, MapPin, Train, ArrowDown, Filter } from 'lucide-react';

export default function StationTimeline({ liveData }) {
  if (!liveData) return null;

  const {
    stations = [],
    current_station_code,
    next_stop
  } = liveData;

  const [filterStoppingOnly, setFilterStoppingOnly] = useState(true);

  // Filter stations based on toggle
  const displayedStations = filterStoppingOnly
    ? stations.filter(s => s.is_stopping)
    : stations;

  const formatTime = (isoString) => {
    if (!isoString) return '--:--';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return '--:--';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-2">
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl p-4 sm:p-6">
        
        {/* Header & Filter Toggle */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-400" />
              Station Schedule & Halts
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Showing {displayedStations.length} of {stations.length} total stations
            </p>
          </div>

          {/* Toggle Button */}
          <button
            onClick={() => setFilterStoppingOnly(!filterStoppingOnly)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-bold text-slate-300 transition-all active:scale-95"
          >
            <Filter className="w-3.5 h-3.5 text-sky-400" />
            <span>{filterStoppingOnly ? 'Stopping Only' : 'All Passing'}</span>
          </button>
        </div>

        {/* Stations Timeline List */}
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
          
          {displayedStations.map((station, index) => {
            const isDeparted = station.has_departed;
            const isArrived = station.has_arrived && !station.has_departed;
            const isNextStop = next_stop?.station_code === station.station_code;
            const isCurrent = station.station_code === current_station_code || isArrived;

            const delayArrival = station.delay_arrival_minutes || 0;
            const delayDeparture = station.delay_departure_minutes || 0;
            const maxDelay = Math.max(delayArrival, delayDeparture);

            return (
              <div 
                key={`${station.station_code}-${index}`}
                className={`relative group transition-all ${
                  isCurrent 
                    ? 'p-3 rounded-2xl bg-sky-950/40 border border-sky-500/40 -ml-3 sm:-ml-4 shadow-lg shadow-sky-950/40' 
                    : ''
                }`}
              >
                {/* Timeline Node Icon */}
                <div className={`absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                  isDeparted
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-400'
                    : isCurrent
                    ? 'bg-sky-500 border-white text-slate-950 shadow-md shadow-sky-500/50 scale-110'
                    : isNextStop
                    ? 'bg-amber-500 border-white text-slate-950 animate-pulse'
                    : 'bg-slate-900 border-slate-700 text-slate-500'
                }`}>
                  {isDeparted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                  ) : isCurrent || isNextStop ? (
                    <Train className="w-3.5 h-3.5" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                  )}
                </div>

                {/* Station Info Content */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  
                  {/* Left: Station Code, Name, Distance & Platform */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-extrabold text-sm text-sky-400 bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-800/40">
                        {station.station_code}
                      </span>
                      <h3 className={`text-sm sm:text-base font-extrabold truncate ${
                        isCurrent ? 'text-white' : isDeparted ? 'text-slate-300' : 'text-slate-100'
                      }`}>
                        {station.station_name}
                      </h3>
                      {station.platform_number && (
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-amber-500/30">
                          PF {station.platform_number}
                        </span>
                      )}
                      {isCurrent && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-sky-500 text-slate-950 animate-pulse uppercase">
                          Current Train Location
                        </span>
                      )}
                      {isNextStop && !isCurrent && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 uppercase">
                          Next Halting Stop
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mt-1">
                      <span>{station.distance_km || 0} km</span>
                      {station.halt_minutes > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-sky-300 font-semibold">{station.halt_minutes}m halt</span>
                        </>
                      )}
                      {station.day && (
                        <>
                          <span>•</span>
                          <span>Day {station.day}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right: Arrival & Departure Times + Delay Badge */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 sm:gap-0.5 shrink-0 pt-1 sm:pt-0">
                    <div className="flex items-center gap-3 sm:gap-2 text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">Arr</span>
                        <span className="font-bold text-white">
                          {formatTime(station.eta || station.scheduled_arrival)}
                        </span>
                      </div>
                      <div className="text-slate-600">/</div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">Dep</span>
                        <span className="font-bold text-white">
                          {formatTime(station.etd || station.scheduled_departure)}
                        </span>
                      </div>
                    </div>

                    {/* Delay indicator */}
                    <div className="text-[11px] font-bold">
                      {maxDelay <= 0 ? (
                        <span className="text-emerald-400">Right Time</span>
                      ) : (
                        <span className={maxDelay > 15 ? 'text-rose-400' : 'text-amber-400'}>
                          +{maxDelay}m late
                        </span>
                      )}
                    </div>
                  </div>

                </div>

              </div>
            );
          })}

        </div>

      </div>
    </div>
  );
}

