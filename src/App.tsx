/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { BottomNavigation, TabType } from './components/layout/BottomNavigation';
import { HomeView } from './components/home/HomeView';
import { BibleView } from './components/bible/BibleView';
import { SongsView } from './components/songs/SongsView';
import { RecordingsView } from './components/recordings/RecordingsView';
import { PersonalSpaceView } from './components/profile/PersonalSpaceView';
import { MoreView } from './components/more/MoreView';
import { AdminView } from './components/admin/AdminView';
import { BibleQuizView } from './components/quiz/BibleQuizView';
import { HomileticsWorkshopView } from './components/homiletics/HomileticsWorkshopView';
import { AppPalette, storageService } from './services/storageService';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { Language, Song } from './types';
import { Download, WifiOff, X } from 'lucide-react';
import { ANDROID_BUILD_WORKFLOW_URL, AppUpdateInfo, checkForAppUpdate } from './services/appUpdateService';
import { Capacitor } from '@capacitor/core';

export default function App() {
  const [language, setLanguage] = useState<Language>(() => storageService.getLanguage());
  const [theme, setTheme] = useState<'dark' | 'light'>(() => storageService.getTheme());
  const [palette, setPalette] = useState<AppPalette>(() => storageService.getPalette());
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [showAdmin, setShowAdmin] = useState(false);
  const [appUpdate, setAppUpdate] = useState<AppUpdateInfo | null>(null);

  // Navigation targets for Bible
  const [bibleTarget, setBibleTarget] = useState<{
    bookId: string;
    chapter: number;
    verse?: number;
  }>({
    bookId: 'MAT',
    chapter: 1,
  });

  // Song selected for viewing or recording
  const [selectedSongId, setSelectedSongId] = useState<string | undefined>(undefined);
  const [songForRecording, setSongForRecording] = useState<Song | null>(null);

  const isOnline = useOnlineStatus();

  useEffect(() => {
    if (Capacitor.getPlatform() !== 'android') return;
    const controller = new AbortController();
    void checkForAppUpdate(controller.signal)
      .then(setAppUpdate)
      .catch(error => {
        if (!controller.signal.aborted) {
          console.warn('Impossible de vérifier les mises à jour de l’application.', error);
        }
      });
    return () => controller.abort();
  }, []);

  // Apply dark mode class to html document
  useEffect(() => {
    document.documentElement.style.setProperty('--app-primary', palette.primary);
    document.documentElement.style.setProperty('--app-accent', palette.accent);
  }, [palette]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    storageService.setLanguage(lang);
  };

  const handleThemeToggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    storageService.setTheme(next);
  };

  const handlePaletteChange = (nextPalette: AppPalette) => {
    setPalette(nextPalette);
    storageService.setPalette(nextPalette);
  };

  const handleNavigateToBible = (bookId?: string, chapter?: number, verse?: number) => {
    if (bookId && chapter) {
      setBibleTarget({ bookId, chapter, verse });
    }
    setCurrentTab('bible');
  };

  const handleNavigateToSongs = (songId?: string) => {
    if (songId) {
      setSelectedSongId(songId);
      storageService.setLastSongId(songId);
    }
    setCurrentTab('songs');
  };

  const handleOpenRecordWithSong = (song: Song) => {
    setSongForRecording(song);
    storageService.setLastSongId(song.id);
    setCurrentTab('recordings');
  };

  return (
    <div className="app-shell min-h-screen bg-[#F8F9FA] dark:bg-[#0A1626] text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Offline Alert Strip if network is disconnected */}
      {!isOnline && (
        <div className="bg-amber-600 text-white text-xs font-semibold py-1.5 px-4 text-center flex items-center justify-center gap-2 shadow-sm z-50">
          <WifiOff className="w-3.5 h-3.5" />
          <span>
            {language === 'kr'
              ? 'Mòd san entènèt aktif — Labib ak chant ki sove yo disponib.'
              : 'Mode hors ligne actif — La Bible et les chants enregistrés restent consultables.'}
          </span>
        </div>
      )}

      {/* Top Application Header */}
      <Header
        language={language}
        onLanguageChange={handleLanguageChange}
        theme={theme}
        onThemeToggle={handleThemeToggle}
        onNavigateHome={() => {
          setShowAdmin(false);
          setCurrentTab('home');
        }}
        onOpenOfflineManager={() => setCurrentTab('more')}
      />

      {/* Main Tab Content */}
      <main className="flex-1 w-full pt-2">
        {showAdmin ? (
          <AdminView
            language={language}
            onBack={() => setShowAdmin(false)}
          />
        ) : (
          <>
            {currentTab === 'home' && (
              <HomeView
                language={language}
                onNavigateToBible={handleNavigateToBible}
                onNavigateToSongs={handleNavigateToSongs}
                onNavigateToRecordings={() => setCurrentTab('recordings')}
                onNavigateToQuiz={() => setCurrentTab('quiz')}
                onNavigateToHomiletics={() => setCurrentTab('homiletics')}
              />
            )}

            {currentTab === 'bible' && (
              <BibleView
                language={language}
                initialBookId={bibleTarget.bookId}
                initialChapter={bibleTarget.chapter}
                initialVerse={bibleTarget.verse}
                onBack={() => setCurrentTab('home')}
                onNavigateToQuiz={() => setCurrentTab('quiz')}
                onNavigateToHomiletics={() => setCurrentTab('homiletics')}
              />
            )}

            {currentTab === 'quiz' && (
              <BibleQuizView
                language={language}
                onBack={() => setCurrentTab('home')}
                onNavigateToBible={handleNavigateToBible}
              />
            )}

            {currentTab === 'homiletics' && (
              <HomileticsWorkshopView
                language={language}
                onBack={() => setCurrentTab('home')}
                onNavigateToBible={handleNavigateToBible}
              />
            )}

            {currentTab === 'songs' && (
              <SongsView
                language={language}
                initialSongId={selectedSongId}
                onOpenRecordWithSong={handleOpenRecordWithSong}
                onBack={() => setCurrentTab('home')}
              />
            )}

            {currentTab === 'recordings' && (
              <RecordingsView
                language={language}
                songForRecording={songForRecording}
                onClearSongForRecording={() => setSongForRecording(null)}
                onBack={() => setCurrentTab('home')}
              />
            )}

            {currentTab === 'profile' && (
              <PersonalSpaceView
                language={language}
                onNavigateToBible={handleNavigateToBible}
                onNavigateToSong={handleNavigateToSongs}
                onNavigateToRecordings={() => setCurrentTab('recordings')}
                onOpenSettings={() => setCurrentTab('more')}
                onOpenAdmin={() => setShowAdmin(true)}
                onBack={() => setCurrentTab('home')}
              />
            )}

            {currentTab === 'more' && (
              <MoreView
                language={language}
                onLanguageChange={handleLanguageChange}
                theme={theme}
                onThemeToggle={handleThemeToggle}
                palette={palette}
                onPaletteChange={handlePaletteChange}
                onOpenAdmin={() => setShowAdmin(true)}
                onBack={() => setCurrentTab('home')}
              />
            )}
          </>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNavigation
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        language={language}
      />

      {appUpdate && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="app-update-title"
            className="w-full max-w-md space-y-4 rounded-3xl border border-amber-500/40 bg-white p-5 text-slate-900 shadow-2xl dark:bg-[#0D1C30] dark:text-white"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                  {language === 'kr' ? 'Nouvo vèsyon' : 'Nouvelle version'}
                </p>
                <h2 id="app-update-title" className="mt-1 text-xl font-black">
                  {language === 'kr' ? 'Mizajou aplikasyon an disponib' : 'Mise à jour de l’application disponible'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setAppUpdate(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
                aria-label={language === 'kr' ? 'Fèmen' : 'Fermer'}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {language === 'kr'
                ? 'Gen nouvo amelyorasyon pou aplikasyon an. Telechaje epi enstale nouvo APK a pou jwenn dènye vèsyon an.'
                : 'Des changements sont disponibles. Téléchargez et installez le nouvel APK pour utiliser la dernière version.'}
            </p>
            {appUpdate.releaseNotes && (
              <p className="rounded-xl bg-slate-100 p-3 text-xs text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                {language === 'kr' ? 'Chanjman:' : 'Changements :'} {appUpdate.releaseNotes}
              </p>
            )}
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {language === 'kr'
                ? 'Aplikasyon an pa enstale mizajou a otomatikman. Android ka mande retire ansyen APK tès la; sove anrejistreman ak fichye lokal ou yo anvan.'
                : 'L’application ne peut pas installer l’APK automatiquement. Android peut demander de désinstaller l’ancienne version de test; sauvegardez vos enregistrements et fichiers locaux avant.'
              }
            </p>
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setAppUpdate(null)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {language === 'kr' ? 'Pita' : 'Plus tard'}
              </button>
              <a
                href={ANDROID_BUILD_WORKFLOW_URL}
                className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-amber-400"
              >
                <Download className="h-4 w-4" />
                {language === 'kr' ? 'Jwenn APK la' : 'Obtenir le nouvel APK'}
              </a>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
