import React, { useState } from 'react';
import { X, Save, Trash2, Edit3, Bookmark } from 'lucide-react';
import { Language } from '../../types';
import { TRANSLATIONS } from '../../i18n/translations';

interface VerseNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  reference: string;
  initialNote: string;
  onSave: (note: string) => void;
  onDelete?: () => void;
  language: Language;
}

export const VerseNoteModal: React.FC<VerseNoteModalProps> = ({
  isOpen,
  onClose,
  reference,
  initialNote,
  onSave,
  onDelete,
  language,
}) => {
  const t = TRANSLATIONS[language];
  const [noteText, setNoteText] = useState(initialNote);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(noteText);
    onClose();
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-white dark:bg-[#0D1C30] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-amber-500/20">
        {/* Header */}
        <div className="p-4 bg-[#12263F] text-white flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-cinzel font-bold text-base text-amber-300">
                {t.bible.addNote}
              </h3>
              <p className="text-xs text-amber-200/80 font-mono">{reference}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Note Body */}
        <div className="p-4 space-y-3">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">
            {language === 'kr' ? 'Meditasyon ou oswa lapriyè ou sou vèsè sa a:' : 'Votre méditation ou prière sur ce verset :'}
          </label>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            rows={6}
            placeholder={t.bible.notePlaceholder}
            className="w-full p-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none font-scripture leading-relaxed"
          />
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
          {initialNote && onDelete ? (
            <button
              onClick={handleDelete}
              className="py-2 px-3 rounded-xl border border-red-300 dark:border-red-900/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>{t.bible.deleteNote}</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="py-2 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {t.common.cancel}
            </button>
            <button
              onClick={handleSave}
              className="py-2 px-4 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow hover:bg-amber-400 active:scale-95 transition"
            >
              <Save className="w-4 h-4" />
              <span>{t.bible.saveNote}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
