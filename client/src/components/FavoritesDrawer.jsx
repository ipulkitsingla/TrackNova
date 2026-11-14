import React from 'react';
import { X, Bookmark, Trash2, Train, History, ArrowRight } from 'lucide-react';

export default function FavoritesDrawer({
  isOpen,
  onClose,
  favorites = [],
  history = [],
  onSelectTrain,
  onRemoveFavorite
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl h-full flex flex-col z-10 animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-extrabold text-white">Saved & History</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          
          {/* Pinned Favorites */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                Favorite Trains ({favorites.length})
              </span>
            </div>

            {favorites.length === 0 ? (
              <div className="text-center py-6 px-4 rounded-2xl bg-slate-950/50 border border-slate-800/80">
                <Train className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-300">No saved trains yet</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Tap the bookmark icon on any train to quickly track it anytime.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {favorites.map((fav) => (
                  <div
                    key={fav.trainNumber}
                    className="p-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 flex items-center justify-between gap-3 group transition-all"
                  >
                    <button
                      onClick={() => {
                        onSelectTrain(fav.trainNumber);
                        onClose();
                      }}
                      className="flex-1 text-left min-w-0"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800/40">
                          {fav.trainNumber}
                        </span>
                        <span className="text-xs font-bold text-white truncate">
                          {fav.trainName}
                        </span>
                      </div>
                      {(fav.sourceStation || fav.destinationStation) && (
                        <p className="text-[11px] text-slate-400 mt-1 font-medium">
                          {fav.sourceStation} → {fav.destinationStation}
                        </p>
                      )}
                    </button>

                    <button
                      onClick={() => onRemoveFavorite(fav.trainNumber)}
                      className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                      title="Remove from favorites"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Search History */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-sky-400" />
                Recently Tracked
              </span>
            </div>

            {history.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No recent searches</p>
            ) : (
              <div className="space-y-1.5">
                {history.slice(0, 8).map((h, i) => (
                  <button
                    key={`${h.trainNumber}-${i}`}
                    onClick={() => {
                      onSelectTrain(h.trainNumber);
                      onClose();
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800/70 flex items-center justify-between text-xs text-slate-300 hover:text-white transition-colors group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono font-bold text-sky-400">{h.trainNumber}</span>
                      <span className="truncate">{h.trainName}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-sky-400 transition-colors" />
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

