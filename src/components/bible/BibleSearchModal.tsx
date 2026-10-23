import React, { useState, useEffect } from 'react';
import { Search, X, BookOpen, ChevronRight } from 'lucide-react';
import { bibleService, SearchResult } from '../../services/bibleService';
import { Language } from '../../types';
import { TRANSLATIONS } from '../../i18n/translations';

interface BibleSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVerse: (bookId: string, chapter: number, verse: number) => void;
  language: Language;
}

export const BibleSearchModal: React.FC<BibleSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectVerse,
  language,
}) => {
  const t = TRANSLATIONS[language];
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    setIsSearching(true);
    const timeout = window.setTimeout(() => {
      bibleService.searchVersesGlobal(trimmedQuery, language, controller.signal)
        .then(setResults)
        .catch((error: unknown) => {
          if (!(error instanceof DOMException && error.name === 'AbortError')) {
            console.error('Could not search Bible verses.', error);
            setResults([]);
          }
        })
        .finally(() => setIsSearching(false));
    }, 300);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [query, language]);

  if (!isOpen) return null;

  const quickSuggestions = [
    { label: 'Jean 3:16', q: 'Jean 3:16' },
    { label: 'Psaume 23', q: 'Psaume 23' },
    { label: 'Psaume 91', q: 'Psaume 91' },
    { label: 'Romains 8:28', q: 'Romains 8:28' },
    { label: 'Amour / Renmen', q: language === 'kr' ? 'renmen' : 'amour' },
    { label: 'Paix / Lapè', q: language === 'kr' ? 'lapè' : 'paix' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-lg max-h-[85vh] bg-white dark:bg-[#0D1C30] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-amber-500/20">
        {/* Header */}
        <div className="p-4 bg-[#12263F] text-white flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-amber-400" />
            <h3 className="font-cinzel font-bold text-base text-amber-300">
              {language === 'kr' ? 'Chèche tout Labib la' : 'Rechercher dans toute la Bible'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.bible.searchPlaceholder}
              className="w-full pl-9 pr-8 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Suggestions */}
          {!query && (
            <div className="mt-3">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                {language === 'kr' ? 'Sijesyon rapid:' : 'Recherches rapides :'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickSuggestions.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => setQuery(s.q)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-400 hover:text-amber-500 transition"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {isSearching && (
            <div className="py-6 text-center text-slate-400 text-sm">
              {language === 'kr' ? 'N ap chèche nan Labib la…' : 'Recherche dans toute la Bible…'}
            </div>
          )}

          {!isSearching && query.trim().length >= 2 && results.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-sm">
              {language === 'kr'
                ? `Nou pa jwenn okenn vèsè pou « ${query} »`
                : `Aucun verset trouvé pour « ${query} »`}
            </div>
          )}

          {results.map((r, idx) => {
            const bookName = language === 'kr' ? r.book.nameKr : r.book.nameFr;
            return (
              <div
                key={`${r.book.id}_${r.chapter}_${r.verse}_${idx}`}
                onClick={() => {
                  onSelectVerse(r.book.id, r.chapter, r.verse);
                  onClose();
                }}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-amber-50/70 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 cursor-pointer transition flex items-start justify-between gap-3 group"
              >
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>
                      {bookName} {r.chapter}:{r.verse}
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      (LSG 1910)
                    </span>
                  </div>

                  {r.text && (
                    <p className="text-xs sm:text-sm font-scripture text-slate-800 dark:text-slate-200 leading-relaxed">
                      « {r.text} »
                    </p>
                  )}

                  {/* Haitian Creole Parallel Verse ALWAYS DISPLAYED */}
                  {r.textKr && (
                    <div className="pt-1.5 border-t border-amber-500/20 dark:border-slate-700/60">
                      <p className="text-xs font-scripture text-amber-900/90 dark:text-amber-200/90 leading-relaxed italic">
                        <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded mr-1.5 not-italic border border-amber-500/20">
                          Kreyòl:
                        </span>
                        « {r.textKr} »
                      </p>
                    </div>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-amber-500 transition shrink-0 mt-1" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
