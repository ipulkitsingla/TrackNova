import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, Sparkles, Calendar, ChevronRight } from 'lucide-react';

export default function SearchBar({
  currentTrainNumber,
  onSelectTrain,
  selectedDate,
  onSelectDate,
  popularTrains = []
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/trains/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        if (data.success && data.data?.results) {
          setResults(data.data.results);
          setIsOpen(true);
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (train) => {
    setQuery('');
    setIsOpen(false);
    onSelectTrain(train.train_number);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      // If user typed a 5-digit train number directly
      const cleanNum = query.trim().replace(/\D/g, '');
      if (cleanNum.length >= 4) {
        onSelectTrain(cleanNum);
        setQuery('');
        setIsOpen(false);
      } else if (results.length > 0) {
        handleSelect(results[0]);
      }
    }
  };

  // Helper dates (Yesterday, Today, Tomorrow)
  const getDates = () => {
    const today = new Date();
    const format = (d) => {
      const istTime = new Date(d.getTime() + 5.5 * 3600000);
      return istTime.toISOString().split('T')[0];
    };
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return [
      { label: 'Yesterday', val: format(yesterday) },
      { label: 'Today', val: format(today) },
      { label: 'Tomorrow', val: format(tomorrow) }
    ];
  };

  const dates = getDates();

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pt-4 pb-2" ref={dropdownRef}>
      
      {/* Search Input Box */}
      <form onSubmit={handleFormSubmit} className="relative w-full">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-sky-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (results.length > 0) setIsOpen(true);
            }}
            placeholder="Enter Train Number (e.g. 12951) or Name..."
            className="w-full pl-12 pr-12 py-3.5 bg-slate-900/90 text-white placeholder-slate-400 text-sm sm:text-base font-semibold rounded-2xl border border-slate-700/80 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 shadow-xl transition-all"
          />

          {isLoading ? (
            <Loader2 className="absolute right-4 w-5 h-5 text-sky-400 animate-spin" />
          ) : query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setResults([]);
              }}
              className="absolute right-4 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </div>

        {/* Live Search Auto-complete Dropdown */}
        {isOpen && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl overflow-hidden z-50 divide-y divide-slate-800 max-h-80 overflow-y-auto">
            <div className="px-4 py-2 bg-slate-800/50 text-[11px] font-bold text-sky-400 uppercase tracking-wider flex items-center justify-between">
              <span>Matching Trains ({results.length})</span>
              <span>Tap to track</span>
            </div>
            {results.map((train) => (
              <button
                key={train.train_number}
                type="button"
                onClick={() => handleSelect(train)}
                className="w-full text-left px-4 py-3 hover:bg-slate-800/80 active:bg-sky-950/40 flex items-center justify-between transition-colors group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-extrabold text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/50">
                      {train.train_number}
                    </span>
                    <span className="font-bold text-white text-sm group-hover:text-sky-300 transition-colors">
                      {train.train_name}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
                    <span>{train.source_station_code}</span>
                    <span>→</span>
                    <span>{train.destination_station_code}</span>
                    {train.train_type && (
                      <span className="ml-2 text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                        {train.train_type}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 transition-colors" />
              </button>
            ))}
          </div>
        )}
      </form>

      {/* Date Pill Selector & Popular Quick Chips */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mt-3">
        {/* Date Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold mr-1">
            <Calendar className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden xs:inline">Journey:</span>
          </div>
          {dates.map((d) => {
            const isSelected = selectedDate === d.val;
            return (
              <button
                key={d.val}
                type="button"
                onClick={() => onSelectDate(d.val)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  isSelected
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-700/50'
                }`}
              >
                {d.label}
              </button>
            );
          })}
        </div>

        {/* Popular Trains Quick Chips */}
        {popularTrains.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-slate-400 text-[11px] font-semibold flex items-center gap-1 shrink-0">
              <Sparkles className="w-3 h-3 text-amber-400" /> Quick:
            </span>
            {popularTrains.slice(0, 4).map((pt) => {
              const isActive = currentTrainNumber === pt.train_number;
              return (
                <button
                  key={pt.train_number}
                  type="button"
                  onClick={() => onSelectTrain(pt.train_number)}
                  className={`shrink-0 px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/30 font-black'
                      : 'bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-700/70 border-slate-700/60'
                  }`}
                  title={`${pt.train_number} - ${pt.train_name}`}
                >
                  {pt.train_number}
                </button>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

