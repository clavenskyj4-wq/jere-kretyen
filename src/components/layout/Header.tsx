import React from 'react';
import { BookOpen, Moon, Sun, Download, Wifi, WifiOff } from 'lucide-react';
import { Language } from '../../types';
import { TRANSLATIONS } from '../../i18n/translations';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useBrandIcon } from '../../hooks/useBrandIcon';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  theme: 'dark' | 'light';
  onThemeToggle: () => void;
  onOpenOfflineManager?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  theme,
  onThemeToggle,
  onOpenOfflineManager,
}) => {
  const t = TRANSLATIONS[language];
  const isOnline = useOnlineStatus();
  const { isInstallable, install } = usePWAInstall();
  const brandIcon = useBrandIcon();

  return (
    <header className="sticky top-0 z-40 bg-[#12263F] text-white shadow-md border-b border-amber-500/20">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-[#C9A227] to-amber-700 p-0.5 shadow-sm flex items-center justify-center overflow-hidden">
            <div className="w-full h-full bg-[#12263F] rounded-[10px] flex items-center justify-center">
              {brandIcon ? (
                <img src={brandIcon} alt="Logo Jere Kretyen" className="w-full h-full object-cover rounded-[10px]" />
              ) : (
                <span className="font-cinzel text-amber-400 font-bold text-lg leading-none">JK</span>
              )}
            </div>
          </div>
          <div className="flex flex-col">
            <h1 className="font-cinzel font-bold text-lg tracking-wide text-white leading-tight">
              Jere Kretyen
            </h1>
            <p className="text-[10px] text-amber-300/80 font-medium tracking-wider uppercase">
              {t.slogan}
            </p>
          </div>
        </div>

        {/* Actions & Toggles */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* PWA Install Button if available */}
          {isInstallable && (
            <button
              onClick={install}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition shadow-sm active:scale-95"
              title="Installer l'application"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Installer</span>
            </button>
          )}

          {/* Online / Offline status badge */}
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
              isOnline
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                : 'bg-amber-950/80 text-amber-300 border border-amber-500/40 animate-pulse'
            }`}
            title={isOnline ? t.common.online : t.common.offline}
          >
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            <span className="hidden xs:inline">{isOnline ? 'Online' : 'Offline'}</span>
          </div>

          {/* Language Switcher Pill (FR / KR) */}
          <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/80 text-xs font-semibold">
            <button
              onClick={() => onLanguageChange('fr')}
              className={`px-2 py-1 rounded-md transition-all ${
                language === 'fr'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Passer en Français"
            >
              FR
            </button>
            <button
              onClick={() => onLanguageChange('kr')}
              className={`px-2 py-1 rounded-md transition-all ${
                language === 'kr'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Pase an Kreyòl"
            >
              KR
            </button>
          </div>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={onThemeToggle}
            className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-amber-400 border border-slate-700 transition active:scale-95"
            aria-label="Basculer le thème"
            title={theme === 'dark' ? t.settings.lightMode : t.settings.darkMode}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-amber-200" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
