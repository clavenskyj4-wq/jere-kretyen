import React, { useState } from 'react';
import { X, Search, ChevronRight, BookOpen } from 'lucide-react';
import { BIBLE_BOOKS, CATEGORY_LABELS } from '../../data/bibleBooks';
import { BibleBook, Language, Testament } from '../../types';
import { TRANSLATIONS } from '../../i18n/translations';

interface BookSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBookId: string;
  currentChapter: number;
  onSelect: (bookId: string, chapter: number) => void;
  language: Language;
}

export const BookSelectorModal: React.FC<BookSelectorModalProps> = ({
  isOpen,
  onClose,
  currentBookId,
  currentChapter,
  onSelect,
  language,
}) => {
  const t = TRANSLATIONS[language];
  const [activeTestament, setActiveTestament] = useState<Testament>('NT');
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(
    () => BIBLE_BOOKS.find(b => b.id === currentBookId) || BIBLE_BOOKS[42] // default Jean
  );
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  // Filter books by testament and search query
  const filteredBooks = BIBLE_BOOKS.filter((book) => {
    const matchesSearch =
      book.nameFr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.nameKr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.shortNameFr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.shortNameKr.toLowerCase().includes(searchQuery.toLowerCase());

    if (searchQuery.trim().length > 0) {
      return matchesSearch;
    }
    return book.testament === activeTestament;
  });

  const handleBookClick = (book: BibleBook) => {
    setSelectedBook(book);
  };

  const handleChapterClick = (ch: number) => {
    if (selectedBook) {
      onSelect(selectedBook.id, ch);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-lg max-h-[90vh] bg-white dark:bg-[#0D1C30] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-amber-500/20">
        {/* Header */}
        <div className="p-4 bg-[#12263F] text-white flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h3 className="font-cinzel font-bold text-base text-amber-300">
              {t.bible.selectBookAndChapter}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search input */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'kr' ? 'Chèche yon liv (eg. Jan, Sòm, Jenèz)...' : 'Rechercher un livre (ex. Jean, Psaumes, Genèse)...'}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Testament Switcher (hidden when searching) */}
        {!searchQuery && (
          <div className="grid grid-cols-2 p-2 gap-2 bg-slate-100 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTestament('AT')}
              className={`py-2 rounded-xl transition-all ${
                activeTestament === 'AT'
                  ? 'bg-[#12263F] text-amber-300 shadow'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {t.bible.ot} (39)
            </button>
            <button
              onClick={() => setActiveTestament('NT')}
              className={`py-2 rounded-xl transition-all ${
                activeTestament === 'NT'
                  ? 'bg-[#12263F] text-amber-300 shadow'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {t.bible.nt} (27)
            </button>
          </div>
        )}

        {/* Content: Two-column layout on larger screens, tabs on mobile */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800 min-h-[320px]">
          {/* Books List */}
          <div className="overflow-y-auto max-h-[45vh] md:max-h-[55vh] p-2 space-y-1">
            <div className="px-2 py-1 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {t.bible.books} ({filteredBooks.length})
            </div>
            {filteredBooks.map((book) => {
              const isCurrent = selectedBook?.id === book.id;
              const bookName = language === 'kr' ? book.nameKr : book.nameFr;
              return (
                <button
                  key={book.id}
                  onClick={() => handleBookClick(book)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-sm transition ${
                    isCurrent
                      ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/30'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-8 text-[11px] font-mono text-slate-400 dark:text-slate-500">
                      {book.id}
                    </span>
                    <span>{bookName}</span>
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {book.chaptersCount} ch.
                  </span>
                </button>
              );
            })}
          </div>

          {/* Chapters Picker */}
          <div className="overflow-y-auto max-h-[40vh] md:max-h-[55vh] p-3 bg-slate-50 dark:bg-slate-900/30">
            {selectedBook ? (
              <div>
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-base">
                      {language === 'kr' ? selectedBook.nameKr : selectedBook.nameFr}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {selectedBook.chaptersCount} {t.bible.chapters.toLowerCase()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                  {Array.from({ length: selectedBook.chaptersCount }, (_, i) => i + 1).map((ch) => {
                    const isSelected =
                      selectedBook.id === currentBookId && ch === currentChapter;
                    return (
                      <button
                        key={ch}
                        onClick={() => handleChapterClick(ch)}
                        className={`aspect-square rounded-xl font-bold text-sm flex items-center justify-center transition active:scale-95 ${
                          isSelected
                            ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 shadow-md ring-2 ring-amber-300'
                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-amber-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {ch}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm text-center p-6">
                Sélectionnez un livre pour afficher les chapitres
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
