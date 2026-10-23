import React, { useState } from 'react';
import {
  Globe,
  Moon,
  Sun,
  Shield,
  Download,
  Trash2,
  Info,
  Type,
  BookOpen,
  Check,
  Smartphone,
  ChevronLeft,
  ShieldAlert,
} from 'lucide-react';
import { Language } from '../../types';
import { TRANSLATIONS } from '../../i18n/translations';
import { storageService } from '../../services/storageService';
import { bibleService } from '../../services/bibleService';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { AboutPrivacyView } from './AboutPrivacyView';
import { useBrandIcon } from '../../hooks/useBrandIcon';

interface MoreViewProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  theme: 'dark' | 'light';
  onThemeToggle: () => void;
  onBack?: () => void;
  onOpenAdmin?: () => void;
}

export const MoreView: React.FC<MoreViewProps> = ({
  language,
  onLanguageChange,
  theme,
  onThemeToggle,
  onBack,
  onOpenAdmin,
}) => {
  const t = TRANSLATIONS[language];
  const { isInstallable, install } = usePWAInstall();
  const brandIcon = useBrandIcon();

  const [fontSize, setFontSize] = useState<number>(() => storageService.getFontSize());
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [showAboutPrivacy, setShowAboutPrivacy] = useState(false);

  const handleFontSizeChange = (size: number) => {
    setFontSize(size);
    storageService.setFontSize(size);
  };

  const handleDownloadAll = async () => {
    setDownloadProgress(10);
    const count = await bibleService.downloadCoreChapters((prog) => {
      setDownloadProgress(prog);
    });
    setDownloadSuccess(true);
    setTimeout(() => {
      setDownloadProgress(null);
    }, 2000);
  };

  const handleClearData = () => {
    if (window.confirm(t.settings.clearAllConfirm)) {
      storageService.clearAll();
      window.location.reload();
    }
  };

  if (showAboutPrivacy) {
    return (
      <AboutPrivacyView
        language={language}
        onBack={() => setShowAboutPrivacy(false)}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pb-24 pt-2 space-y-5">
      {/* Top Bar with Back Button */}
      {onBack && (
        <div className="flex items-center justify-between mb-1">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-amber-500 hover:text-slate-950 transition active:scale-95 shadow-sm"
            title="Retour à l'accueil"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{language === 'kr' ? 'Akèy' : 'Retour'}</span>
          </button>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-cinzel">
            {language === 'kr' ? 'Paramèt & Plis' : 'Paramètres & Plus'}
          </span>
        </div>
      )}

      {/* App Branding Card */}
      <div className="bg-gradient-to-br from-[#12263F] via-slate-900 to-[#0A1626] rounded-3xl p-6 text-white shadow-xl border border-amber-500/30 text-center space-y-2">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 to-amber-700 p-0.5 shadow-lg flex items-center justify-center overflow-hidden">
          <div className="w-full h-full bg-[#12263F] rounded-[14px] flex items-center justify-center">
            {brandIcon ? (
              <img src={brandIcon} alt="Logo Jere Kretyen" className="w-full h-full object-cover rounded-[14px]" />
            ) : (
              <span className="font-cinzel text-amber-400 font-bold text-2xl">JK</span>
            )}
          </div>
        </div>
        <h2 className="font-cinzel font-bold text-2xl text-white">
          {t.appName}
        </h2>
        <p className="text-xs text-amber-300 font-medium tracking-wide">
          « {t.slogan} »
        </p>
        <p className="text-xs text-slate-300 max-w-sm mx-auto pt-1">
          {t.tagline}
        </p>
      </div>

      {/* About and privacy information */}
      <button
        onClick={() => setShowAboutPrivacy(true)}
        className="w-full p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700/50 text-left hover:border-amber-500 transition"
      >
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
          <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{language === 'kr' ? 'Konsènan & Konfidansyalite' : 'À propos et politique de confidentialité'}</span>
        </div>
        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300">
          {language === 'kr'
            ? 'Enfòmasyon sou aplikasyon an ak kijan done ou yo pwoteje.'
            : 'Présentation de l’application et informations sur la protection de vos données.'}
        </p>
      </button>

      {/* PWA Install Button if available */}
      {isInstallable && (
        <button
          onClick={install}
          className="w-full p-4 rounded-2xl bg-amber-500 text-slate-950 font-bold text-sm shadow-md hover:bg-amber-400 active:scale-98 transition flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Smartphone className="w-5 h-5" />
            <div className="text-left">
              <div>{t.settings.installApp}</div>
              <div className="text-xs font-normal text-slate-900/80">
                {t.settings.installAppDesc}
              </div>
            </div>
          </div>
          <Download className="w-5 h-5 shrink-0" />
        </button>
      )}

      {/* Settings Section */}
      <div className="bg-white dark:bg-[#0D1C30] rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        {/* Language switch */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                {t.settings.language}
              </h4>
              <p className="text-xs text-slate-400">{t.settings.languageDesc}</p>
            </div>
          </div>

          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => onLanguageChange('fr')}
              className={`px-3 py-1.5 rounded-lg transition ${
                language === 'fr'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Français
            </button>
            <button
              onClick={() => onLanguageChange('kr')}
              className={`px-3 py-1.5 rounded-lg transition ${
                language === 'kr'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Kreyòl
            </button>
          </div>
        </div>

        {/* Theme switch */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </div>
            <div>
              <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                {t.settings.theme}
              </h4>
              <p className="text-xs text-slate-400">
                {theme === 'dark' ? t.settings.darkMode : t.settings.lightMode}
              </p>
            </div>
          </div>

          <button
            onClick={onThemeToggle}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            {theme === 'dark' ? 'Mode Clair' : 'Mode Sombre'}
          </button>
        </div>

        {/* Font size adjustment */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <Type className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                  {t.bible.textSize}
                </h4>
                <p className="text-xs text-slate-400">
                  {fontSize}px (taille de lecture de la Bible)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleFontSizeChange(Math.max(14, fontSize - 2))}
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold text-sm text-slate-700 dark:text-slate-300"
              >
                -
              </button>
              <button
                onClick={() => handleFontSizeChange(Math.min(26, fontSize + 2))}
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold text-sm text-slate-700 dark:text-slate-300"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Offline Cache Download */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                  {t.bible.downloadOffline}
                </h4>
                <p className="text-xs text-slate-400">{t.bible.downloadOfflineDesc}</p>
              </div>
            </div>

            <button
              onClick={handleDownloadAll}
              disabled={downloadProgress !== null}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow active:scale-95 transition disabled:opacity-50"
            >
              {downloadSuccess ? (
                <span className="flex items-center gap-1 text-slate-950">
                  <Check className="w-3.5 h-3.5" /> Prêt
                </span>
              ) : downloadProgress !== null ? (
                `${downloadProgress}%`
              ) : (
                'Sauvegarder'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Administration Card */}
      {onOpenAdmin && (
        <div className="bg-gradient-to-br from-slate-900 via-[#12263F] to-slate-900 rounded-3xl p-5 border border-amber-500/40 text-white shadow-xl space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <span>{language === 'kr' ? 'Espas Administrasyon' : 'Espace Administration'}</span>
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  {language === 'kr'
                    ? 'Jesyon kont, rapò, mak aplikasyon ak kantik.'
                    : 'Gestion sécurisée, historique, rapports et identité visuelle.'}
                </p>
              </div>
            </div>
            <button
              onClick={onOpenAdmin}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition active:scale-95 shrink-0"
            >
              {language === 'kr' ? 'Ouvri' : 'Accéder'}
            </button>
          </div>
        </div>
      )}

      {/* Reset Local Data */}
      <div className="pt-2">
        <button
          onClick={handleClearData}
          className="w-full py-3 px-4 rounded-2xl border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-semibold flex items-center justify-center gap-2 transition"
        >
          <Trash2 className="w-4 h-4" />
          <span>{t.settings.clearAllData}</span>
        </button>
      </div>
    </div>
  );
};
