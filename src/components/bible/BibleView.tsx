import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  BookOpen,
  Calendar,
  Share2,
  Bookmark,
  Sparkles,
  Edit3,
  Copy,
  Check,
  Type,
  CloudDownload,
  Languages,
} from 'lucide-react';
import { bibleService } from '../../services/bibleService';
import { storageService } from '../../services/storageService';
import { ChapterData, Language, Verse, VerseHighlight, VerseNote } from '../../types';
import { TRANSLATIONS } from '../../i18n/translations';
import { BookSelectorModal } from './BookSelectorModal';
import { VerseCardModal } from './VerseCardModal';
import { VerseNoteModal } from './VerseNoteModal';
import { BibleSearchModal } from './BibleSearchModal';
import { ReadingPlansView } from './ReadingPlansView';

interface BibleViewProps {
  language: Language;
  initialBookId?: string;
  initialChapter?: number;
  initialVerse?: number;
  onOpenRecordWithVerse?: (ref: string, text: string) => void;
  onBack?: () => void;
  onNavigateToQuiz?: () => void;
  onNavigateToHomiletics?: () => void;
}

export const BibleView: React.FC<BibleViewProps> = ({
  language,
  initialBookId = 'JHN',
  initialChapter = 3,
  initialVerse,
  onOpenRecordWithVerse,
  onBack,
  onNavigateToQuiz,
  onNavigateToHomiletics,
}) => {
  const t = TRANSLATIONS[language];

  // Navigation state
  const [currentBookId, setCurrentBookId] = useState<string>(initialBookId);
  const [currentChapter, setCurrentChapter] = useState<number>(initialChapter);
  const [chapterData, setChapterData] = useState<ChapterData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'read' | 'plans'>('read');

  // Interactive Modals
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [cardModalVerse, setCardModalVerse] = useState<{ ref: string; text: string; textKr?: string } | null>(null);
  const [noteModalVerse, setNoteModalVerse] = useState<{ ref: string; verseNum: number; note: string } | null>(null);

  // User customizations & local storage
  const [fontSize, setFontSize] = useState<number>(() => storageService.getFontSize());
  const [showBilingual, setShowBilingual] = useState<boolean>(true);
  const [highlights, setHighlights] = useState<VerseHighlight[]>(() => storageService.getHighlights());
  const [notes, setNotes] = useState<VerseNote[]>(() => storageService.getNotes());
  const [selectedVerseNum, setSelectedVerseNum] = useState<number | null>(initialVerse || null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [offlineDownloadSuccess, setOfflineDownloadSuccess] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Sync initial props
  useEffect(() => {
    if (initialBookId) setCurrentBookId(initialBookId);
    if (initialChapter) setCurrentChapter(initialChapter);
    if (initialVerse) setSelectedVerseNum(initialVerse);
  }, [initialBookId, initialChapter, initialVerse]);

  // Load chapter data
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    bibleService.getChapitre(currentBookId, currentChapter).then((data) => {
      if (isMounted) {
        setChapterData(data);
        setLoading(false);

        // Save last bookmark
        storageService.setLastBookmark({
          bookId: currentBookId,
          chapter: currentChapter,
          verse: selectedVerseNum || 1,
          timestamp: Date.now(),
        });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [currentBookId, currentChapter]);

  // Scroll to selected verse if any
  useEffect(() => {
    if (selectedVerseNum && !loading) {
      const el = document.getElementById(`verse-${selectedVerseNum}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedVerseNum, loading]);

  const currentBook = bibleService.getLivreById(currentBookId);
  const bookName = currentBook ? (language === 'kr' ? currentBook.nameKr : currentBook.nameFr) : currentBookId;
  const showFrench = language === 'fr' || showBilingual;
  const showCreole = language === 'kr' || showBilingual;

  // Chapter navigation
  const goToPreviousChapter = () => {
    if (currentChapter > 1) {
      setCurrentChapter(currentChapter - 1);
      setSelectedVerseNum(null);
    } else {
      // Go to previous book if available
      const allBooks = bibleService.getLivres();
      const idx = allBooks.findIndex((b) => b.id === currentBookId);
      if (idx > 0) {
        const prevBook = allBooks[idx - 1];
        setCurrentBookId(prevBook.id);
        setCurrentChapter(prevBook.chaptersCount);
        setSelectedVerseNum(null);
      }
    }
  };

  const goToNextChapter = () => {
    if (currentBook && currentChapter < currentBook.chaptersCount) {
      setCurrentChapter(currentChapter + 1);
      setSelectedVerseNum(null);
    } else {
      // Go to next book
      const allBooks = bibleService.getLivres();
      const idx = allBooks.findIndex((b) => b.id === currentBookId);
      if (idx < allBooks.length - 1) {
        const nextBook = allBooks[idx + 1];
        setCurrentBookId(nextBook.id);
        setCurrentChapter(1);
        setSelectedVerseNum(null);
      }
    }
  };

  // Toast notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Highlight action
  const handleSetHighlight = (verseNum: number, color: VerseHighlight['color'] | null) => {
    if (color) {
      storageService.setHighlight(currentBookId, currentChapter, verseNum, color);
      setHighlights(storageService.getHighlights());
      showToast(language === 'kr' ? 'Vèsè souliye !' : 'Verset surligné !');
    } else {
      storageService.removeHighlight(currentBookId, currentChapter, verseNum);
      setHighlights(storageService.getHighlights());
    }
  };

  // Note actions
  const handleOpenNoteModal = (verseNum: number) => {
    const existing = notes.find(
      (n) => n.bookId === currentBookId && n.chapter === currentChapter && n.verse === verseNum
    );
    setNoteModalVerse({
      ref: `${bookName} ${currentChapter}:${verseNum}`,
      verseNum,
      note: existing ? existing.text : '',
    });
  };

  const handleSaveNote = (text: string) => {
    if (noteModalVerse) {
      storageService.saveNote(currentBookId, currentChapter, noteModalVerse.verseNum, text);
      setNotes(storageService.getNotes());
      showToast(language === 'kr' ? 'Nòt anrejistre !' : 'Note enregistrée !');
    }
  };

  const handleDeleteNote = () => {
    if (noteModalVerse) {
      storageService.deleteNote(currentBookId, currentChapter, noteModalVerse.verseNum);
      setNotes(storageService.getNotes());
      showToast(language === 'kr' ? 'Nòt efase !' : 'Note supprimée !');
    }
  };

  // Copy verse
  const handleCopyVerse = (v: Verse) => {
    const ref = `${bookName} ${currentChapter}:${v.verse}`;
    const text = language === 'kr' && v.textKr ? v.textKr : v.text;
    navigator.clipboard.writeText(`« ${text} » (${ref} — Louis Segond)`);
    showToast(t.bible.copiedSuccess);
  };

  // Font size adjustments
  const changeFontSize = (delta: number) => {
    const newSize = Math.max(14, Math.min(28, fontSize + delta));
    setFontSize(newSize);
    storageService.setFontSize(newSize);
  };

  // Offline download action
  const handleDownloadOffline = async () => {
    await bibleService.downloadCoreChapters();
    setOfflineDownloadSuccess(true);
    showToast(t.bible.downloadedSuccess);
    setTimeout(() => setOfflineDownloadSuccess(false), 4000);
  };

  // Color styles for highlights
  const getHighlightClass = (color?: VerseHighlight['color']) => {
    switch (color) {
      case 'gold':
        return 'bg-amber-300/40 dark:bg-amber-500/25 border-l-4 border-amber-500 pl-2 rounded-r';
      case 'emerald':
        return 'bg-emerald-300/35 dark:bg-emerald-500/25 border-l-4 border-emerald-500 pl-2 rounded-r';
      case 'azure':
        return 'bg-sky-300/35 dark:bg-sky-500/25 border-l-4 border-sky-500 pl-2 rounded-r';
      case 'rose':
        return 'bg-rose-300/35 dark:bg-rose-500/25 border-l-4 border-rose-500 pl-2 rounded-r';
      default:
        return '';
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 pb-24 pt-2">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#12263F] text-amber-300 px-4 py-2 rounded-xl shadow-xl border border-amber-500/40 text-xs font-semibold animate-in fade-in flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Tabs Switcher: Lecture / Plans de lecture + Back Button */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-amber-500 hover:text-slate-950 transition active:scale-95 shadow-sm"
              title="Retour à l'accueil"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{language === 'kr' ? 'Akèy' : 'Retour'}</span>
            </button>
          )}

          <div className="flex items-center p-1 bg-slate-200/80 dark:bg-slate-800/80 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('read')}
              className={`py-1.5 px-3 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'read'
                  ? 'bg-[#12263F] text-amber-300 shadow font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{language === 'kr' ? 'Lekti Labib' : 'Lecture'}</span>
            </button>
            <button
              onClick={() => setActiveTab('plans')}
              className={`py-1.5 px-3 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'plans'
                  ? 'bg-[#12263F] text-amber-300 shadow font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{t.bible.readingPlans}</span>
            </button>
          </div>
        </div>

        {/* Quick Search Button */}
        <button
          onClick={() => setIsSearchModalOpen(true)}
          className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-400 hover:text-amber-500 transition shadow-sm active:scale-95 flex items-center gap-1.5 text-xs font-medium"
          title="Rechercher"
        >
          <Search className="w-4 h-4 text-amber-500" />
          <span className="hidden sm:inline">{t.common.search}</span>
        </button>
      </div>

      {activeTab === 'plans' ? (
        <div className="space-y-3">
          <button
            onClick={() => setActiveTab('read')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-amber-500 hover:text-slate-950 transition active:scale-95 shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{language === 'kr' ? 'Tounen nan Lekti Labib' : 'Retour à la lecture biblique'}</span>
          </button>
          <ReadingPlansView
            language={language}
            onOpenPassage={(bookId, ch) => {
              setCurrentBookId(bookId);
              setCurrentChapter(ch);
              setSelectedVerseNum(null);
              setActiveTab('read');
            }}
          />
        </div>
      ) : (
        <>
          {/* Reader Control Bar */}
          <div className="sticky top-16 z-30 bg-white/95 dark:bg-[#0A1626]/95 backdrop-blur-md py-2.5 px-3 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 mb-4 flex items-center justify-between gap-2">
            {/* Previous Chapter */}
            <button
              onClick={goToPreviousChapter}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-90"
              title={t.bible.previousChapter}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Book & Chapter Selector Button */}
            <button
              onClick={() => setIsBookModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-amber-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition active:scale-95"
            >
              <span className="font-cinzel font-bold text-base sm:text-lg text-slate-900 dark:text-amber-300">
                {bookName} {currentChapter}
              </span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 uppercase tracking-wider font-semibold">
                ▼
              </span>
            </button>

            {/* Next Chapter */}
            <button
              onClick={goToNextChapter}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-90"
              title={t.bible.nextChapter}
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Tools: Font size & Bilingual toggle */}
            <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-2">
              {/* Font size toggle */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 text-xs">
                <button
                  onClick={() => changeFontSize(-1)}
                  className="px-1.5 py-1 text-slate-700 dark:text-slate-300 font-bold hover:text-amber-500"
                  title="Diminuer texte"
                >
                  A-
                </button>
                <button
                  onClick={() => changeFontSize(1)}
                  className="px-1.5 py-1 text-slate-700 dark:text-slate-300 font-bold hover:text-amber-500"
                  title="Agrandir texte"
                >
                  A+
                </button>
              </div>

              {/* Parallel Creole/French toggle */}
              <button
                onClick={() => setShowBilingual(!showBilingual)}
                className={`p-1.5 rounded-lg border transition ${
                  showBilingual
                    ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-400'
                }`}
                title={language === 'kr' ? 'Montre vèsyon fransè ak kreyòl ansanm' : 'Affichage bilingue FR / Créole'}
                aria-label={language === 'kr' ? 'Montre ou masque le français' : 'Afficher ou masquer le créole'}
                aria-pressed={showBilingual}
              >
                <Languages className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chapter Header Info */}
          <div className="text-center my-4 space-y-2">
            <h2 className="font-cinzel font-bold text-2xl text-slate-900 dark:text-slate-100">
              {bookName}
            </h2>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold tracking-widest uppercase mt-0.5">
              {t.bible.chapter} {currentChapter} — Louis Segond (1910)
            </p>

            {/* Quick Study & Meditation Tools */}
            <div className="flex items-center justify-center gap-2 pt-1">
              {onNavigateToQuiz && (
                <button
                  onClick={onNavigateToQuiz}
                  className="px-2.5 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] font-bold border border-amber-500/20 flex items-center gap-1.5 transition active:scale-95 shadow-sm"
                  title="Questions d'entraînement"
                >
                  <span>🧠</span>
                  <span>{language === 'kr' ? 'Quiz & Antrènman' : 'Quiz Biblique'}</span>
                </button>
              )}

              {onNavigateToHomiletics && (
                <button
                  onClick={onNavigateToHomiletics}
                  className="px-2.5 py-1 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold border border-indigo-500/20 flex items-center gap-1.5 transition active:scale-95 shadow-sm"
                  title="Atelier Méditation & Prédication"
                >
                  <span>👨‍🏫</span>
                  <span>{language === 'kr' ? 'Atelye Predikasyon' : 'Atelier Prédication'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Verses Container */}
          {loading ? (
            <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-semibold">{t.common.loading}</p>
            </div>
          ) : (
            <div ref={containerRef} className="space-y-3">
              {chapterData?.verses.some((verse) => !verse.text.trim()) && (
                <div
                  role="status"
                  className="rounded-xl border border-amber-300/70 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900 dark:border-amber-700/50 dark:bg-amber-950/30 dark:text-amber-200"
                >
                  {language === 'kr'
                    ? 'Vèsè fransè yo poko disponib pou chapit sa a. Konekte ak entènèt epi relouvri chapit la pou chaje yo.'
                    : 'Les versets français ne sont pas encore disponibles pour ce chapitre. Connectez-vous à Internet puis rouvrez le chapitre pour les charger.'}
                </div>
              )}
              {chapterData?.verses.map((v) => {
                const isSelected = selectedVerseNum === v.verse;
                const highlight = highlights.find(
                  (h) => h.bookId === currentBookId && h.chapter === currentChapter && h.verse === v.verse
                );
                const note = notes.find(
                  (n) => n.bookId === currentBookId && n.chapter === currentChapter && n.verse === v.verse
                );
                const highlightClass = getHighlightClass(highlight?.color);

                return (
                  <div
                    key={v.verse}
                    id={`verse-${v.verse}`}
                    onClick={() => setSelectedVerseNum(isSelected ? null : v.verse)}
                    className={`p-2.5 rounded-2xl transition-all cursor-pointer relative ${highlightClass} ${
                      isSelected
                        ? 'bg-amber-100/70 dark:bg-slate-800/90 ring-2 ring-amber-400/80 shadow-md'
                        : 'hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Verse Number & Note badge */}
                    <div className="flex items-start gap-2.5">
                      <span className="font-cinzel font-bold text-xs text-amber-600 dark:text-amber-400 select-none pt-0.5 min-w-[20px]">
                        {v.verse}
                      </span>

                      <div className="flex-1 space-y-1">
                        {showFrench && v.text.trim() && (
                          <p
                            className="font-scripture text-slate-800 dark:text-slate-100 leading-relaxed"
                            style={{ fontSize: `${fontSize}px` }}
                          >
                            {showBilingual && (
                              <span className="mr-2 rounded border border-slate-300 px-1.5 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-700 dark:text-slate-400">
                                Français:
                              </span>
                            )}
                            {v.text}
                          </p>
                        )}

                        {showCreole && v.textKr && (
                          <div className="pt-1.5 mt-1 border-t border-amber-500/20 dark:border-slate-800/80">
                            <p
                              className="font-scripture text-amber-900/90 dark:text-amber-200/90 leading-relaxed italic"
                              style={{ fontSize: `${Math.max(14, fontSize - 2)}px` }}
                            >
                              <span className="text-[10px] font-sans font-bold text-amber-600 dark:text-amber-400 not-italic mr-2 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 uppercase tracking-wider">
                                {showBilingual ? 'Kreyòl:' : 'Kreyòl'}
                              </span>
                              {v.textKr}
                            </p>
                          </div>
                        )}

                        {/* Personal note snippet if present */}
                        {note && (
                          <div className="mt-2 p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300/40 dark:border-amber-700/40 text-xs text-slate-700 dark:text-amber-200 flex items-start gap-1.5">
                            <Edit3 className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                            <span className="line-clamp-2 italic">{note.text}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Contextual Action Drawer when Verse is selected */}
                    {isSelected && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="mt-3 pt-3 border-t border-amber-300/40 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 animate-in fade-in"
                      >
                        {/* Highlight Color Pickers */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleSetHighlight(v.verse, 'gold')}
                            className="w-6 h-6 rounded-full bg-amber-400 border border-amber-600/40 hover:scale-110 active:scale-95 transition shadow-sm"
                            title="Or / Sagesse"
                          />
                          <button
                            onClick={() => handleSetHighlight(v.verse, 'emerald')}
                            className="w-6 h-6 rounded-full bg-emerald-400 border border-emerald-600/40 hover:scale-110 active:scale-95 transition shadow-sm"
                            title="Vert / Espérance"
                          />
                          <button
                            onClick={() => handleSetHighlight(v.verse, 'azure')}
                            className="w-6 h-6 rounded-full bg-sky-400 border border-sky-600/40 hover:scale-110 active:scale-95 transition shadow-sm"
                            title="Bleu / Paix"
                          />
                          <button
                            onClick={() => handleSetHighlight(v.verse, 'rose')}
                            className="w-6 h-6 rounded-full bg-rose-400 border border-rose-600/40 hover:scale-110 active:scale-95 transition shadow-sm"
                            title="Rose / Amour"
                          />
                          {highlight && (
                            <button
                              onClick={() => handleSetHighlight(v.verse, null)}
                              className="px-2 py-0.5 rounded-lg text-[10px] text-slate-500 dark:text-slate-400 hover:text-red-500 font-semibold"
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5">
                          {/* Note Button */}
                          <button
                            onClick={() => handleOpenNoteModal(v.verse)}
                            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs text-slate-700 dark:text-slate-200 font-semibold flex items-center gap-1 hover:border-amber-400 transition"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-amber-500" />
                            <span>{t.bible.addNote}</span>
                          </button>

                          {/* Share Image Button */}
                          <button
                            onClick={() =>
                              setCardModalVerse({
                                ref: `${bookName} ${currentChapter}:${v.verse}`,
                                text: v.text,
                                textKr: v.textKr,
                              })
                            }
                            className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-sm hover:brightness-110 transition"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Image</span>
                          </button>

                          {/* Copy */}
                          <button
                            onClick={() => handleCopyVerse(v)}
                            className="p-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:text-amber-500 transition"
                            title={t.bible.copyVerse}
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Chapter Footer Navigation */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={goToPreviousChapter}
              className="py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{t.bible.previousChapter}</span>
            </button>

            <button
              onClick={goToNextChapter}
              className="py-2.5 px-4 rounded-xl bg-[#12263F] text-amber-300 font-bold text-xs flex items-center gap-2 shadow hover:bg-slate-800 transition active:scale-95"
            >
              <span>{t.bible.nextChapter}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Download for offline card */}
          <div className="mt-8 p-4 rounded-2xl bg-gradient-to-r from-[#12263F]/10 to-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <CloudDownload className="w-4 h-4 text-amber-500" />
                <span>{t.bible.downloadOffline}</span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {t.bible.downloadOfflineDesc}
              </p>
            </div>
            <button
              onClick={handleDownloadOffline}
              className="shrink-0 px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition active:scale-95"
            >
              {language === 'kr' ? 'Telechaje' : 'Télécharger'}
            </button>
          </div>
        </>
      )}

      {/* Book Selector Modal */}
      <BookSelectorModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        currentBookId={currentBookId}
        currentChapter={currentChapter}
        onSelect={(bId, ch) => {
          setCurrentBookId(bId);
          setCurrentChapter(ch);
          setSelectedVerseNum(null);
        }}
        language={language}
      />

      {/* Bible Search Modal */}
      <BibleSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectVerse={(bId, ch, vNum) => {
          setCurrentBookId(bId);
          setCurrentChapter(ch);
          setSelectedVerseNum(vNum);
          setActiveTab('read');
        }}
        language={language}
      />

      {/* Verse Card Modal */}
      {cardModalVerse && (
        <VerseCardModal
          isOpen={!!cardModalVerse}
          onClose={() => setCardModalVerse(null)}
          reference={cardModalVerse.ref}
          verseText={cardModalVerse.text}
          verseTextKr={cardModalVerse.textKr}
          language={language}
        />
      )}

      {/* Verse Note Modal */}
      {noteModalVerse && (
        <VerseNoteModal
          isOpen={!!noteModalVerse}
          onClose={() => setNoteModalVerse(null)}
          reference={noteModalVerse.ref}
          initialNote={noteModalVerse.note}
          onSave={handleSaveNote}
          onDelete={handleDeleteNote}
          language={language}
        />
      )}
    </div>
  );
};
