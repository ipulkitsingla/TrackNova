import React from 'react';
import { Bookmark, BookmarkCheck, Share2, AlertCircle, CheckCircle, Train, ShieldAlert } from 'lucide-react';

export default function TrainHeader({
  liveData,
  isFavorite,
  onToggleFavorite,
  countdown,
  autoRefresh,
  onToggleAutoRefresh
}) {
  if (!liveData) return null;

  const {
    train_number,
    train_name,
    journey_date,
    status,
    cancellation,
    stations = []
  } = liveData;

  const source = stations[0] || {};
  const destination = stations[stations.length - 1] || {};

  const handleShare = async () => {
    const shareData = {
      title: `${train_number} - ${train_name} Live Status`,
      text: `Track live running status of ${train_number} ${train_name} on TrackNova!`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Ignored or cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Tracking link copied to clipboard!');
    }
  };

  const isCancelled = cancellation?.fully_cancelled || status === 'CANCELLED';

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pt-2 pb-1">
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Train Name, Number & Route */}
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500/20 to-blue-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0 mt-0.5">
            <Train className="w-6 h-6" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-base sm:text-lg font-black text-sky-400 bg-sky-950/80 px-2.5 py-0.5 rounded-lg border border-sky-800/60 shadow-sm">
                {train_number}
              </span>
              <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                {train_name}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 font-semibold mt-1.5">
              <span>{source.station_name || 'Origin'} ({source.station_code})</span>
              <span className="text-sky-400">➔</span>
              <span>{destination.station_name || 'Destination'} ({destination.station_code})</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 font-mono">Date: {journey_date}</span>
            </div>

            {/* Cancellation or running alerts */}
            {isCancelled && (
              <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
                <AlertCircle className="w-4 h-4" />
                <span>{cancellation?.message || 'Train Reported Cancelled'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Controls: Auto-refresh pill, Share, Save */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          
          {/* Auto Refresh Toggle & Timer */}
          <button
            onClick={onToggleAutoRefresh}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              autoRefresh
                ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title="Auto refresh live status every 30 seconds"
          >
            <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-sky-400 animate-ping' : 'bg-slate-500'}`} />
            <span>Auto: {autoRefresh ? `${countdown}s` : 'OFF'}</span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-all active:scale-95"
            title="Share Live Status"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Bookmark / Save */}
          <button
            onClick={onToggleFavorite}
            className={`p-2 rounded-xl border transition-all active:scale-95 ${
              isFavorite
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-amber-400 border-slate-700/60'
            }`}
            title={isFavorite ? 'Saved in favorites' : 'Save this train'}
          >
            {isFavorite ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          </button>

        </div>

      </div>
    </div>
  );
}

