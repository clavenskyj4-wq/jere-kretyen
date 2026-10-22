import React, { useState } from 'react';
import { X, Hash, ChevronRight, Music2 } from 'lucide-react';
import { HYMNAL_SECTIONS } from '../../data/sampleSongs';
import { songService } from '../../services/songService';
import { HymnalSection, Language, Song } from '../../types';
import { TRANSLATIONS } from '../../i18n/translations';

interface HymnDialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSong: (song: Song) => void;
  language: Language;
}

export const HymnDialModal: React.FC<HymnDialModalProps> = ({
  isOpen,
  onClose,
  onSelectSong,
  language,
}) => {
  const t = TRANSLATIONS[language];
  const [typedNumber, setTypedNumber] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<HymnalSection | 'all'>('all');

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (typedNumber.length < 4) {
      setTypedNumber((prev) => prev + digit);
    }
  };

  const handleBackspace = () => {
    setTypedNumber((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setTypedNumber('');
  };

  // Find matching songs based on typed number and optional section
  const matchingSongs = typedNumber
    ? songService
        .getAllSongs()
        .filter((s) => {
          const matchNum = s.number.toString().startsWith(typedNumber);
          const matchSec = selectedSection === 'all' || s.sectionCode === selectedSection;
          return matchNum && matchSec;
        })
        .slice(0, 5)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-sm bg-white dark:bg-[#0D1C30] rounded-3xl shadow-2xl overflow-hidden border border-amber-500/30 flex flex-col">
        {/* Header */}
        <div className="p-4 bg-[#12263F] text-white flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Hash className="w-5 h-5 text-amber-400" />
            <h3 className="font-cinzel font-bold text-base text-amber-300">
              {language === 'kr' ? 'Tape Nimewo Chant la' : 'Accès Rapide par Numéro'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Pills */}
        <div className="p-2.5 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex gap-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setSelectedSection('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              selectedSection === 'all'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {language === 'kr' ? 'Tout' : 'Tous'}
          </button>
          {HYMNAL_SECTIONS.map((sec) => (
            <button
              key={sec.code}
              onClick={() => setSelectedSection(sec.code)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedSection === sec.code
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {sec.short}
            </button>
          ))}
        </div>

        {/* Big Display */}
        <div className="p-4 bg-slate-100 dark:bg-slate-950 text-center border-b border-slate-200 dark:border-slate-800">
          <div className="h-12 flex items-center justify-center">
            <span className="font-mono font-bold text-3xl sm:text-4xl text-slate-900 dark:text-amber-300 tracking-wider">
              {typedNumber ? `#${typedNumber}` : <span className="text-slate-400 text-xl font-sans">Tapez un numéro...</span>}
            </span>
          </div>
        </div>

        {/* Instant matches preview */}
        {matchingSongs.length > 0 && (
          <div className="p-2 bg-amber-50 dark:bg-slate-800/80 border-b border-amber-200 dark:border-slate-700 max-h-36 overflow-y-auto space-y-1">
            {matchingSongs.map((song) => (
              <div
                key={song.id}
                onClick={() => {
                  onSelectSong(song);
                  onClose();
                }}
                className="p-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-amber-100 dark:hover:bg-slate-700 border border-amber-300/40 dark:border-slate-700 cursor-pointer flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="font-bold text-amber-600 dark:text-amber-400 shrink-0">
                    #{song.number}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {song.title}
                  </span>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    ({song.sectionCode})
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-500 shrink-0" />
              </div>
            ))}
          </div>
        )}

        {/* Numeric Keypad */}
        <div className="p-4 grid grid-cols-3 gap-2.5 bg-white dark:bg-[#0D1C30]">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleDigit(digit)}
              className="py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xl hover:bg-amber-100 dark:hover:bg-slate-700 active:scale-95 transition shadow-sm border border-slate-200 dark:border-slate-700"
            >
              {digit}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="py-3.5 rounded-2xl bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs uppercase hover:bg-slate-300 dark:hover:bg-slate-700 active:scale-95 transition"
          >
            Effacer
          </button>
          <button
            onClick={() => handleDigit('0')}
            className="py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xl hover:bg-amber-100 dark:hover:bg-slate-700 active:scale-95 transition shadow-sm border border-slate-200 dark:border-slate-700"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="py-3.5 rounded-2xl bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-lg hover:bg-slate-300 dark:hover:bg-slate-700 active:scale-95 transition"
          >
            ⌫
          </button>
        </div>
      </div>
    </div>
  );
};
