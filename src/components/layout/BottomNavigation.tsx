import React from 'react';
import { Home, BookOpen, Music2, Mic, User } from 'lucide-react';
import { Language } from '../../types';
import { TRANSLATIONS } from '../../i18n/translations';

export type TabType = 'home' | 'bible' | 'songs' | 'recordings' | 'profile' | 'more' | 'quiz' | 'homiletics';

interface BottomNavigationProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  language: Language;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentTab,
  onTabChange,
  language,
}) => {
  const t = TRANSLATIONS[language];

  const items = [
    { id: 'home' as TabType, label: t.nav.home, icon: Home },
    { id: 'bible' as TabType, label: t.nav.bible, icon: BookOpen },
    { id: 'songs' as TabType, label: t.nav.songs, icon: Music2 },
    { id: 'recordings' as TabType, label: t.nav.recordings, icon: Mic },
    {
      id: 'profile' as TabType,
      label: language === 'kr' ? 'Espas Mwen' : 'Mon Espace',
      icon: User,
    },
  ];

  return (
    <nav className="app-nav fixed bottom-0 left-0 right-0 z-40 backdrop-blur-md border-t border-slate-800 text-slate-300 safe-pb">
      <div className="max-w-md mx-auto grid grid-cols-5 h-16">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id || (item.id === 'profile' && currentTab === 'more');
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`my-1 mx-0.5 flex flex-col items-center justify-center gap-1 rounded-xl transition-all ${
                isActive
                  ? 'bg-amber-500/15 text-amber-300 font-bold ring-1 ring-inset ring-amber-400/40 shadow-[0_0_14px_rgba(245,158,11,0.12)]'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
              }`}
            >
              <div
                className={`rounded-xl p-1.5 transition-all ${
                  isActive ? 'scale-110 bg-amber-400 text-[#12263F] shadow-sm' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.6]' : 'stroke-[1.8]'}`} />
              </div>
              <span className={`text-[11px] tracking-tight truncate max-w-[68px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
