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
import { AppFont, AppPalette, storageService } from './services/storageService';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { Language, Song } from './types';
import { WifiOff } from 'lucide-react';

export default function App() {
  const [language, setLanguage] = useState<Language>(() => storageService.getLanguage());
  const [theme, setTheme] = useState<'dark' | 'light'>(() => storageService.getTheme());
  const [palette, setPalette] = useState<AppPalette>(() => storageService.getPalette());
  const [appFont, setAppFont] = useState<AppFont>(() => storageService.getFont());
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [showAdmin, setShowAdmin] = useState(false);

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

  // Apply dark mode class to html document
  useEffect(() => {
    document.documentElement.style.setProperty('--app-primary', palette.primary);
    document.documentElement.style.setProperty('--app-accent', palette.accent);
  }, [palette]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--app-font-family',
      appFont === 'poppins' ? '"Poppins", sans-serif' : '"Lato", sans-serif'
    );
  }, [appFont]);

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

  const handleFontChange = (nextFont: AppFont) => {
    setAppFont(nextFont);
    storageService.setFont(nextFont);
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
                appFont={appFont}
                onFontChange={handleFontChange}
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
    </div>
  );
}
