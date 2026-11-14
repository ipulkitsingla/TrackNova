import React, { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from './components/Navbar';
import SearchBar from './components/SearchBar';
import TrainHeader from './components/TrainHeader';
import TrainTrackAnimation from './components/TrainTrackAnimation';
import Speedometer from './components/Speedometer';
import StationTimeline from './components/StationTimeline';
import LiveMap from './components/LiveMap';
import PwaInstallPrompt from './components/PwaInstallPrompt';
import FavoritesDrawer from './components/FavoritesDrawer';
import BottomNav from './components/BottomNav';
import WelcomeScreen from './components/WelcomeScreen';
import { Loader2, AlertCircle, RefreshCw, WifiOff, Train, ShieldCheck } from 'lucide-react';

export default function App() {
  // Read initial train from URL query string if present (default to none)
  const urlParams = new URLSearchParams(window.location.search);
  const initialTrain = urlParams.get('train') || '';

  // Get current date in IST
  const getTodayIST = () => {
    const now = new Date();
    const istTime = new Date(now.getTime() + 5.5 * 3600000);
    return istTime.toISOString().split('T')[0];
  };

  const [trainNumber, setTrainNumber] = useState(initialTrain);
  const [selectedDate, setSelectedDate] = useState(getTodayIST());
  const [liveData, setLiveData] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(initialTrain));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [popularTrains, setPopularTrains] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('live'); // 'live' | 'map' | 'schedule' | 'saved'
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [countdown, setCountdown] = useState(30);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // Sync PWA install event
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load Popular Trains & Favorites on start
  useEffect(() => {
    // Fetch popular trains
    fetch('/api/popular')
      .then(res => res.json())
      .then(d => {
        if (d.success && d.data) setPopularTrains(d.data);
      })
      .catch(() => {});

    // Load local favorites fallback
    try {
      const localFavs = JSON.parse(localStorage.getItem('tracknova_favs') || '[]');
      setFavorites(localFavs);
    } catch {}

    // Fetch favorites from API
    fetch('/api/favorites')
      .then(res => res.json())
      .then(d => {
        if (d.success && d.data) {
          setFavorites(d.data);
          localStorage.setItem('tracknova_favs', JSON.stringify(d.data));
        }
      })
      .catch(() => {});

    // Fetch history
    fetch('/api/history')
      .then(res => res.json())
      .then(d => {
        if (d.success && d.data) setHistory(d.data);
      })
      .catch(() => {});
  }, []);

  // Fetch Live Train Data
  const fetchLiveData = useCallback(async (isManual = false) => {
    if (!trainNumber) {
      setIsLoading(false);
      setLiveData(null);
      setError(null);
      return;
    }

    if (isManual) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/trains/live/${trainNumber}?date=${selectedDate}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || `No live data available for train ${trainNumber}`);
      }

      setLiveData(data.data);
      setCountdown(30);

      // Update URL query string without reloading page
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('train', trainNumber);
      window.history.replaceState({}, '', currentUrl.toString());

      // Save to recent local history
      try {
        const item = {
          trainNumber,
          trainName: data.data.train_name,
          searchedAt: new Date().toISOString()
        };
        setHistory(prev => [item, ...prev.filter(h => h.trainNumber !== trainNumber)].slice(0, 15));
      } catch {}

    } catch (err) {
      console.error('Fetch live error:', err);
      setError(err.message || 'Unable to retrieve train status. Please check train number or date.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [trainNumber, selectedDate]);

  useEffect(() => {
    fetchLiveData();
  }, [fetchLiveData]);

  // Auto-refresh timer countdown (every 30 seconds)
  useEffect(() => {
    if (!autoRefresh) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          fetchLiveData(true);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRefresh, fetchLiveData]);

  // Toggle Favorite
  const handleToggleFavorite = async () => {
    if (!liveData) return;
    const isFav = favorites.some(f => f.trainNumber === trainNumber);

    if (isFav) {
      const updated = favorites.filter(f => f.trainNumber !== trainNumber);
      setFavorites(updated);
      localStorage.setItem('tracknova_favs', JSON.stringify(updated));
      try {
        await fetch(`/api/favorites/${trainNumber}`, { method: 'DELETE' });
      } catch {}
    } else {
      const newFav = {
        trainNumber,
        trainName: liveData.train_name,
        sourceStation: liveData.stations?.[0]?.station_code,
        destinationStation: liveData.stations?.[liveData.stations?.length - 1]?.station_code,
      };
      const updated = [newFav, ...favorites.filter(f => f.trainNumber !== trainNumber)];
      setFavorites(updated);
      localStorage.setItem('tracknova_favs', JSON.stringify(updated));
      try {
        await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newFav)
        });
      } catch {}
    }
  };

  const handleSelectTrain = (num) => {
    setTrainNumber(num);
    setActiveTab('live');
  };

  const handleRemoveFavorite = async (num) => {
    const updated = favorites.filter(f => f.trainNumber !== num);
    setFavorites(updated);
    localStorage.setItem('tracknova_favs', JSON.stringify(updated));
    try {
      await fetch(`/api/favorites/${num}`, { method: 'DELETE' });
    } catch {}
  };

  const handleHomeClick = () => {
    setTrainNumber('');
    setLiveData(null);
    setError(null);
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.delete('train');
    window.history.replaceState({}, '', currentUrl.pathname);
  };

  const isFavorite = favorites.some(f => f.trainNumber === trainNumber);

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0f1d] text-slate-100 selection:bg-sky-500 selection:text-white pb-24 sm:pb-12">
      
      {/* Offline Banner */}
      {isOffline && (
        <div className="bg-rose-600 text-white text-xs font-bold py-2 px-4 text-center flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4" />
          <span>You are offline. Showing cached information.</span>
        </div>
      )}

      {/* App Navbar */}
      <Navbar
        onHomeClick={handleHomeClick}
        onOpenFavorites={() => setIsDrawerOpen(true)}
        favoritesCount={favorites.length}
        onRefresh={() => fetchLiveData(true)}
        isRefreshing={isRefreshing}
        deferredPrompt={deferredPrompt}
        onInstallClick={() => {
          if (deferredPrompt) {
            deferredPrompt.prompt();
          }
        }}
      />

      {/* Search Bar & Date Picker */}
      <SearchBar
        currentTrainNumber={trainNumber}
        onSelectTrain={handleSelectTrain}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        popularTrains={popularTrains}
      />

      {/* Main View Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto py-2">
        
        {/* Welcome Hero Screen when no train is tracked yet */}
        {!trainNumber && !liveData && !isLoading && (
          <WelcomeScreen
            onSelectTrain={handleSelectTrain}
            popularTrains={popularTrains}
            history={history}
          />
        )}

        {/* Loading Spinner */}
        {isLoading && !liveData && (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="relative flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-sky-500 animate-spin" />
              <Train className="w-6 h-6 text-sky-400 absolute" />
            </div>
            <h3 className="text-base font-extrabold text-white">Fetching Live Telemetry...</h3>
            <p className="text-xs text-slate-400 mt-1">Connecting to Railcore real-time GPS feeds</p>
          </div>
        )}

        {/* Error Card */}
        {error && (
          <div className="mx-4 my-6 p-6 rounded-3xl bg-rose-950/30 border border-rose-500/40 text-center">
            <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
            <h3 className="text-base font-extrabold text-white">Unable to Load Train</h3>
            <p className="text-xs text-rose-300/90 mt-1 max-w-md mx-auto">{error}</p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => fetchLiveData(true)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all"
              >
                Retry
              </button>
              <button
                onClick={() => handleSelectTrain('12951')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition-all"
              >
                Load Demo (12951 Tejas)
              </button>
            </div>
          </div>
        )}

        {/* Train Details Content */}
        {liveData && (
          <div className="space-y-4">
            
            {/* Train Header Card */}
            <TrainHeader
              liveData={liveData}
              isFavorite={isFavorite}
              onToggleFavorite={handleToggleFavorite}
              countdown={countdown}
              autoRefresh={autoRefresh}
              onToggleAutoRefresh={() => setAutoRefresh(!autoRefresh)}
            />

            {/* Mobile: Follows activeTab */}
            <div className="block sm:hidden">
              {activeTab === 'live' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <TrainTrackAnimation liveData={liveData} />
                  <Speedometer liveData={liveData} />
                  <LiveMap liveData={liveData} />
                </div>
              )}

              {activeTab === 'map' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <LiveMap liveData={liveData} />
                  <div className="px-4">
                    <button
                      onClick={() => setActiveTab('schedule')}
                      className="w-full py-3 rounded-2xl bg-slate-900 border border-slate-800 text-sky-400 font-bold text-xs flex items-center justify-center gap-2"
                    >
                      <span>View Full Station Schedule</span>
                      <span>➔</span>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'schedule' && (
                <div className="animate-in fade-in duration-200">
                  <StationTimeline liveData={liveData} />
                </div>
              )}

              {activeTab === 'saved' && (
                <div className="px-4 animate-in fade-in duration-200">
                  <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4">
                    <h3 className="text-sm font-extrabold text-white mb-3">Saved Trains</h3>
                    {favorites.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-6">No saved trains yet</p>
                    ) : (
                      <div className="space-y-2">
                        {favorites.map(f => (
                          <button
                            key={f.trainNumber}
                            onClick={() => {
                              handleSelectTrain(f.trainNumber);
                              setActiveTab('live');
                            }}
                            className="w-full text-left p-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 flex items-center justify-between"
                          >
                            <span className="font-mono text-sm font-bold text-sky-400">{f.trainNumber}</span>
                            <span className="text-xs font-semibold text-white truncate ml-2">{f.trainName}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Desktop View: All Sections Shown Elegantly */}
            <div className="hidden sm:block space-y-4">
              <TrainTrackAnimation liveData={liveData} />
              <Speedometer liveData={liveData} />
              <LiveMap liveData={liveData} />
              <StationTimeline liveData={liveData} />
            </div>

          </div>
        )}

      </main>

      {/* PWA Floating Install Prompt */}
      <PwaInstallPrompt
        deferredPrompt={deferredPrompt}
        onInstallSuccess={() => setDeferredPrompt(null)}
      />

      {/* Favorites & Search History Drawer */}
      <FavoritesDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        favorites={favorites}
        history={history}
        onSelectTrain={handleSelectTrain}
        onRemoveFavorite={handleRemoveFavorite}
      />

      {/* Mobile Native App Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={(tab) => {
          if (tab === 'saved') {
            setIsDrawerOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        favoritesCount={favorites.length}
      />

    </div>
  );
}

