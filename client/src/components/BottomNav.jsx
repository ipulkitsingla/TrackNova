import React from 'react';
import { Train, Map, ListOrdered, Bookmark } from 'lucide-react';

export default function BottomNav({ activeTab, onChangeTab, favoritesCount }) {
  const tabs = [
    { id: 'live', label: 'Live Track', icon: Train },
    { id: 'map', label: 'Radar Map', icon: Map },
    { id: 'schedule', label: 'Stations', icon: ListOrdered },
    { id: 'saved', label: 'Saved', icon: Bookmark, badge: favoritesCount }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0a0f1d]/95 backdrop-blur-xl border-t border-slate-800 pb-safe sm:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`relative flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-2xl transition-all ${
                isActive
                  ? 'text-sky-400 font-extrabold'
                  : 'text-slate-400 hover:text-slate-200 font-semibold'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-sky-500/15' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>

              {tab.badge > 0 && (
                <span className="absolute top-0 right-1/4 w-3.5 h-3.5 rounded-full bg-amber-500 text-[9px] font-black text-slate-950 flex items-center justify-center shadow">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

