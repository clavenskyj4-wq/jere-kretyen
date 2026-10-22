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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#12263F]/95 backdrop-blur-md border-t border-slate-800 text-slate-300 safe-pb">
      <div className="max-w-md mx-auto grid grid-cols-5 h-16">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id || (item.id === 'profile' && currentTab === 'more');
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center gap-1 transition-all relative ${
                isActive ? 'text-amber-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isActive && (
                <div className="absolute top-0 w-8 h-1 bg-amber-400 rounded-b-full shadow-[0_0_8px_#C9A227]" />
              )}
              <div
                className={`p-1 rounded-xl transition-transform ${
                  isActive ? 'scale-110 bg-amber-400/10' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.3]' : 'stroke-[1.8]'}`} />
              </div>
              <span className="text-[11px] tracking-tight truncate max-w-[68px]">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
