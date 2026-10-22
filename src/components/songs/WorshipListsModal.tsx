import React, { useState } from 'react';
import { X, ListMusic, Plus, Trash2, Music2, ChevronRight, Play } from 'lucide-react';
import { songService } from '../../services/songService';
import { Language, Song, WorshipList } from '../../types';
import { TRANSLATIONS } from '../../i18n/translations';

interface WorshipListsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSong: (song: Song) => void;
  language: Language;
}

export const WorshipListsModal: React.FC<WorshipListsModalProps> = ({
  isOpen,
  onClose,
  onSelectSong,
  language,
}) => {
  const t = TRANSLATIONS[language];
  const [lists, setLists] = useState<WorshipList[]>(() => songService.getWorshipLists());
  const [activeListId, setActiveListId] = useState<string | null>(lists[0]?.id || null);
  const [newTitle, setNewTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen) return null;

  const handleCreateList = () => {
    if (!newTitle.trim()) return;
    const newList: WorshipList = {
      id: `worship_${Date.now()}`,
      title: newTitle.trim(),
      date: new Date().toLocaleDateString(),
      songIds: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = songService.saveWorshipList(newList);
    setLists(updated);
    setActiveListId(newList.id);
    setNewTitle('');
    setIsCreating(false);
  };

  const handleDeleteList = (id: string) => {
    if (window.confirm(language === 'kr' ? 'Èske w vle efase lis sa a?' : 'Voulez-vous supprimer cette liste de culte ?')) {
      const updated = songService.deleteWorshipList(id);
      setLists(updated);
      if (activeListId === id) {
        setActiveListId(updated[0]?.id || null);
      }
    }
  };

  const activeList = lists.find((l) => l.id === activeListId);
  const activeSongs = activeList
    ? activeList.songIds
        .map((id) => songService.getSongById(id))
        .filter((s): s is Song => !!s)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-lg max-h-[88vh] bg-white dark:bg-[#0D1C30] rounded-3xl shadow-2xl overflow-hidden border border-amber-500/30 flex flex-col">
        {/* Header */}
        <div className="p-4 bg-[#12263F] text-white flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-2">
            <ListMusic className="w-5 h-5 text-amber-400" />
            <h3 className="font-cinzel font-bold text-base text-amber-300">
              {language === 'kr' ? 'Lis Chante pou Kil yo' : 'Listes de Culte Personnalisées'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content: Lists tabs & Songs */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* New list creator */}
          {isCreating ? (
            <div className="p-3 bg-amber-50 dark:bg-slate-800 rounded-2xl border border-amber-300/40 space-y-2">
              <input
                type="text"
                autoFocus
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder={language === 'kr' ? 'Non nouvo lis la (eg: Veye Lapriyè)' : 'Nom de la liste (ex: Veillée de prière)'}
                className="w-full p-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  {t.common.cancel}
                </button>
                <button
                  onClick={handleCreateList}
                  className="px-4 py-1.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400"
                >
                  {t.common.save}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full py-2.5 px-4 rounded-2xl border border-dashed border-amber-500/50 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-amber-50 dark:hover:bg-slate-800 transition"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'kr' ? 'Kreye yon nouvo lis kil' : 'Créer une nouvelle liste de culte'}</span>
            </button>
          )}

          {/* List selection pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {lists.map((l) => (
              <div key={l.id} className="relative group shrink-0">
                <button
                  onClick={() => setActiveListId(l.id)}
                  className={`py-2 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
                    activeListId === l.id
                      ? 'bg-[#12263F] text-amber-300 shadow'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span>{l.title}</span>
                  <span className="text-[10px] opacity-75">({l.songIds.length})</span>
                </button>
              </div>
            ))}
          </div>

          {/* Active list details */}
          {activeList && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {activeList.title}
                  </h4>
                  {activeList.description && (
                    <p className="text-xs text-slate-400">{activeList.description}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteList(activeList.id)}
                  className="p-1.5 text-slate-400 hover:text-red-500 transition"
                  title="Supprimer la liste"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {activeSongs.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs border border-slate-200 dark:border-slate-800 rounded-2xl">
                  {language === 'kr'
                    ? 'Pa gen okenn chant nan lis sa a ankò. Louvri yon chant epi klike « Ajoute nan lis ».'
                    : 'Aucun chant dans cette liste pour l\'instant. Ouvrez un chant et touchez « Ajouter à une liste ».'}
                </div>
              ) : (
                <div className="space-y-2">
                  {activeSongs.map((song, index) => (
                    <div
                      key={`${song.id}_${index}`}
                      onClick={() => {
                        onSelectSong(song);
                        onClose();
                      }}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 cursor-pointer flex items-center justify-between gap-3 group transition"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition">
                            #{song.number} {song.title}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {song.section} • {song.verses.length} c.
                          </div>
                        </div>
                      </div>
                      <Play className="w-4 h-4 text-amber-500 shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
