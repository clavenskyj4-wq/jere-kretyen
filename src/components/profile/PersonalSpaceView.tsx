import React, { useState, useEffect } from 'react';
import {
  User,
  Heart,
  Bookmark,
  BookOpen,
  Music2,
  Calendar,
  Sparkles,
  Edit3,
  Download,
  Upload,
  ShieldCheck,
  Check,
  ChevronRight,
  Flame,
  FileAudio,
  Trash2,
  Share2,
  RefreshCw,
  Clock,
  Layers,
  Settings,
  ChevronLeft,
  ShieldAlert,
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { songService } from '../../services/songService';
import { bibleService } from '../../services/bibleService';
import { recordingStorageService, StoredAudioRecording } from '../../services/recordingStorageService';
import { READING_PLANS } from '../../data/readingPlans';
import { Language, Song, UserProfile, VerseHighlight, VerseNote } from '../../types';
import { TRANSLATIONS } from '../../i18n/translations';

interface PersonalSpaceViewProps {
  language: Language;
  onNavigateToBible: (bookId: string, chapter: number, verse?: number) => void;
  onNavigateToSong: (songId: string) => void;
  onNavigateToRecordings: () => void;
  onOpenSettings: () => void;
  onBack?: () => void;
  onOpenAdmin?: () => void;
}

export const PersonalSpaceView: React.FC<PersonalSpaceViewProps> = ({
  language,
  onNavigateToBible,
  onNavigateToSong,
  onNavigateToRecordings,
  onOpenSettings,
  onBack,
  onOpenAdmin,
}) => {
  const t = TRANSLATIONS[language];
  const [profile, setProfile] = useState<UserProfile>(() => storageService.getUserProfile());
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'favorites' | 'notes' | 'backup'>('overview');

  // Personal data
  const [highlights, setHighlights] = useState<VerseHighlight[]>(() => storageService.getHighlights());
  const [notes, setNotes] = useState<VerseNote[]>(() => storageService.getNotes());
  const [favoriteSongs, setFavoriteSongs] = useState<Song[]>([]);
  const [recentRecordings, setRecentRecordings] = useState<StoredAudioRecording[]>([]);
  const [lastBookmark, setLastBookmark] = useState(storageService.getLastBookmark());
  const [lastSong, setLastSong] = useState<Song | undefined>(undefined);

  // Edit profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [nameInput, setNameInput] = useState(profile.name);
  const [avatarInput, setAvatarInput] = useState(profile.avatar);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const avatars = ['🕊️', '📖', '✝️', '🕯️', '👑', '🛡️', '🌿', '🌅'];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  useEffect(() => {
    // Load favorite songs
    const favIds = songService.getFavorites();
    const loadedFavs = favIds
      .map((id) => songService.getSongById(id))
      .filter((s): s is Song => !!s);
    setFavoriteSongs(loadedFavs);

    // Load recent recordings
    recordingStorageService.getAll().then((list) => {
      setRecentRecordings(list.slice(0, 3));
    });

    // Load last song
    const lastId = storageService.getLastSongId();
    setLastSong(songService.getSongById(lastId));
  }, []);

  const handleSaveProfile = () => {
    if (nameInput.trim()) {
      const updated = storageService.updateUserProfile({
        name: nameInput.trim(),
        avatar: avatarInput,
      });
      setProfile(updated);
      setIsEditingProfile(false);
      showToast(language === 'kr' ? 'Pwofil ou mete ajou !' : 'Profil mis à jour !');
    }
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    const dataStr = storageService.exportBackup();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `JereKretyen_Sauvegarde_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(language === 'kr' ? 'Kopi sekirite telechaje !' : 'Sauvegarde téléchargée avec succès !');
  };

  // Import JSON Backup
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = storageService.importBackup(content);
      if (success) {
        setProfile(storageService.getUserProfile());
        setHighlights(storageService.getHighlights());
        setNotes(storageService.getNotes());
        showToast(language === 'kr' ? 'Done yo restore avèk siksè !' : 'Données restaurées avec succès !');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        alert(language === 'kr' ? 'Fichye sa a pa valid.' : 'Format de fichier non valide.');
      }
    };
    reader.readAsText(file);
  };

  const lastBookMeta = bibleService.getLivreById(lastBookmark.bookId);
  const lastBookName = lastBookMeta
    ? language === 'kr'
      ? lastBookMeta.nameKr
      : lastBookMeta.nameFr
    : lastBookmark.bookId;

  // Plan progress numbers
  const planYearCount = storageService.getPlanProgress('year').length;
  const planNtCount = storageService.getPlanProgress('nt90').length;
  const planPsaumesCount = storageService.getPlanProgress('psalms_proverbs').length;

  return (
    <div className="max-w-3xl mx-auto px-4 pb-24 pt-2 space-y-5">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#12263F] text-amber-300 px-4 py-2 rounded-xl shadow-xl border border-amber-500/40 text-xs font-semibold animate-in fade-in flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar with Back Button */}
      {onBack && (
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-amber-500 hover:text-slate-950 transition active:scale-95 shadow-sm"
            title="Retour à l'accueil"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{language === 'kr' ? 'Akèy' : 'Retour'}</span>
          </button>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-cinzel">
            {language === 'kr' ? 'Espas Pèsonèl' : 'Mon Espace'}
          </span>
        </div>
      )}

      {/* User Profile Header Card */}
      <div className="bg-gradient-to-br from-[#12263F] via-slate-900 to-[#0A1626] rounded-3xl p-6 text-white shadow-xl border border-amber-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => setIsEditingProfile(true)}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/30 border border-amber-500/40 flex items-center justify-center text-3xl shadow-inner hover:scale-105 transition"
              title="Changer d'avatar"
            >
              {profile.avatar}
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-cinzel font-bold text-xl text-white">
                  {profile.name}
                </h3>
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="p-1 text-slate-400 hover:text-amber-400 transition"
                  title="Modifier mon nom"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>
                    {language === 'kr' ? 'Mòd Pèsonèl Lokal' : 'Données Locales Sécurisées'}
                  </span>
                </span>
                <span className="text-[11px] text-slate-400">
                  {language === 'kr' ? 'San kont obligatwa' : 'Sans compte obligatoire'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="p-2.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/30 transition shadow-sm"
                title="Administration & Gestion des Chants (PIN: 1910)"
              >
                <ShieldAlert className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onOpenSettings}
              className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Paramètres de l'application"
            >
              <Settings className="w-5 h-5 text-amber-400" />
            </button>
          </div>
        </div>

        {/* Spiritual Stats Mini Banner */}
        <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-slate-800 text-center">
          <div className="p-2 rounded-xl bg-slate-800/40 border border-slate-800">
            <span className="font-cinzel font-bold text-base text-amber-300 block">
              {highlights.length}
            </span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">
              {language === 'kr' ? 'Souliye' : 'Surlignages'}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-slate-800/40 border border-slate-800">
            <span className="font-cinzel font-bold text-base text-amber-300 block">
              {notes.length}
            </span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">
              {language === 'kr' ? 'Nòt' : 'Notes'}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-slate-800/40 border border-slate-800">
            <span className="font-cinzel font-bold text-base text-amber-300 block">
              {favoriteSongs.length}
            </span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">
              {language === 'kr' ? 'Chant' : 'Favoris'}
            </span>
          </div>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-slate-200/80 dark:bg-slate-800/80 rounded-2xl text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`py-2 rounded-xl transition ${
            activeSubTab === 'overview'
              ? 'bg-[#12263F] text-amber-300 font-bold shadow'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {language === 'kr' ? 'Rezime' : 'Aperçu'}
        </button>

        <button
          onClick={() => setActiveSubTab('favorites')}
          className={`py-2 rounded-xl transition ${
            activeSubTab === 'favorites'
              ? 'bg-[#12263F] text-amber-300 font-bold shadow'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {language === 'kr' ? 'Favori' : 'Favoris'}
        </button>

        <button
          onClick={() => setActiveSubTab('notes')}
          className={`py-2 rounded-xl transition ${
            activeSubTab === 'notes'
              ? 'bg-[#12263F] text-amber-300 font-bold shadow'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {language === 'kr' ? 'Nòt & Tèks' : 'Notes'}
        </button>

        <button
          onClick={() => setActiveSubTab('backup')}
          className={`py-2 rounded-xl transition ${
            activeSubTab === 'backup'
              ? 'bg-[#12263F] text-amber-300 font-bold shadow'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {language === 'kr' ? 'Sove' : 'Sauvegarde'}
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeSubTab === 'overview' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Quick jump to last reading & last song */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Last Bible Bookmark */}
            <div
              onClick={() =>
                onNavigateToBible(lastBookmark.bookId, lastBookmark.chapter, lastBookmark.verse)
              }
              className="p-4 rounded-2xl bg-white dark:bg-[#0D1C30] border border-slate-200 dark:border-slate-800 hover:border-amber-400/50 shadow-sm cursor-pointer transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {language === 'kr' ? 'Dènye lekti Labib' : 'Dernière lecture'}
                  </span>
                  <h4 className="font-cinzel font-bold text-sm text-slate-900 dark:text-white group-hover:text-amber-500 transition">
                    {lastBookName} {lastBookmark.chapter}:{lastBookmark.verse || 1}
                  </h4>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition" />
            </div>

            {/* Last Song */}
            {lastSong && (
              <div
                onClick={() => onNavigateToSong(lastSong.id)}
                className="p-4 rounded-2xl bg-white dark:bg-[#0D1C30] border border-slate-200 dark:border-slate-800 hover:border-amber-400/50 shadow-sm cursor-pointer transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <Music2 className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {language === 'kr' ? 'Dènye chant' : 'Dernier chant'}
                    </span>
                    <h4 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-amber-500 transition truncate">
                      #{lastSong.number} {lastSong.title}
                    </h4>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition shrink-0" />
              </div>
            )}
          </div>

          {/* Reading Plans Progress Dashboard */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#0D1C30] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500" />
                <h4 className="font-cinzel font-bold text-base text-slate-900 dark:text-white">
                  {t.plans.title}
                </h4>
              </div>
              <span className="text-xs text-slate-400">
                {language === 'kr' ? '3 plan an kour' : '3 plans disponibles'}
              </span>
            </div>

            <div className="space-y-3">
              {/* Year */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700 dark:text-slate-300">
                    {language === 'kr' ? 'Labib nan yon ane' : 'Bible en un an'}
                  </span>
                  <span className="font-mono text-amber-600 dark:text-amber-400">
                    {planYearCount} / 365 ({Math.round((planYearCount / 365) * 100)}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${Math.max(3, (planYearCount / 365) * 100)}%` }}
                  />
                </div>
              </div>

              {/* NT 90 */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700 dark:text-slate-300">
                    {language === 'kr' ? 'Nouvo Testaman nan 90 jou' : 'Nouveau Testament en 90 jours'}
                  </span>
                  <span className="font-mono text-amber-600 dark:text-amber-400">
                    {planNtCount} / 90 ({Math.round((planNtCount / 90) * 100)}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${Math.max(3, (planNtCount / 90) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Psalms & Proverbs */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700 dark:text-slate-300">
                    {language === 'kr' ? 'Sòm ak Pwovèb' : 'Psaumes & Proverbes'}
                  </span>
                  <span className="font-mono text-amber-600 dark:text-amber-400">
                    {planPsaumesCount} / 30 ({Math.round((planPsaumesCount / 30) * 100)}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-500 rounded-full"
                    style={{ width: `${Math.max(3, (planPsaumesCount / 30) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Vocal Recordings */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#0D1C30] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileAudio className="w-5 h-5 text-rose-500" />
                <h4 className="font-cinzel font-bold text-base text-slate-900 dark:text-white">
                  {language === 'kr' ? 'Dènye Anrejistreman' : 'Derniers Enregistrements'}
                </h4>
              </div>
              <button
                onClick={onNavigateToRecordings}
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>{language === 'kr' ? 'Wè tout' : 'Voir tout'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentRecordings.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-4">
                {language === 'kr' ? 'Poko gen okenn anrejistreman vwa.' : 'Aucun enregistrement récent.'}
              </p>
            ) : (
              <div className="space-y-2">
                {recentRecordings.map((rec) => (
                  <div
                    key={rec.id}
                    onClick={onNavigateToRecordings}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between cursor-pointer hover:border-amber-400/40 transition"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                        <FileAudio className="w-4 h-4" />
                      </span>
                      <div className="truncate">
                        <span className="font-semibold text-xs text-slate-900 dark:text-white truncate block">
                          {rec.title}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(rec.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: FAVORITES */}
      {activeSubTab === 'favorites' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="p-4 bg-white dark:bg-[#0D1C30] rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-cinzel font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500 fill-current" />
                <span>{language === 'kr' ? 'Chants d\'Espérance Pi Renmen' : 'Chants d\'Espérance Favoris'}</span>
              </h4>
              <span className="text-xs text-slate-400 font-mono">
                {favoriteSongs.length} {language === 'kr' ? 'chant' : 'chants'}
              </span>
            </div>

            {favoriteSongs.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                {language === 'kr'
                  ? 'Ou poko mete okenn chant nan favori w yo. Klike sou ti kè a nan paj yon chant pou w mete l la.'
                  : 'Aucun chant favori pour l\'instant. Touchez le cœur sur la page d\'un chant pour l\'ajouter.'}
              </div>
            ) : (
              <div className="space-y-2">
                {favoriteSongs.map((song) => (
                  <div
                    key={song.id}
                    onClick={() => onNavigateToSong(song.id)}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-50 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer flex items-center justify-between group transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
                        #{song.number}
                      </span>
                      <div>
                        <h5 className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-amber-500 transition">
                          {song.title}
                        </h5>
                        <p className="text-[10px] text-slate-400">
                          {song.section} • {song.verses.length} couplets
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: NOTES & SURLIGNAGES */}
      {activeSubTab === 'notes' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Notes List */}
          <div className="p-4 bg-white dark:bg-[#0D1C30] rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="font-cinzel font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-amber-500" />
              <span>{language === 'kr' ? 'Nòt Pèsonèl sou Labib' : 'Notes Personnelles sur la Bible'}</span>
            </h4>

            {notes.length === 0 ? (
              <p className="text-center py-6 text-slate-400 text-xs italic">
                {language === 'kr'
                  ? 'Ou poko ekri okenn nòt sou yon vèsè. Peze sou yon vèsè nan lekti a pou ajoute yon nòt.'
                  : 'Aucune note pour le moment. Touchez un verset pendant votre lecture biblique pour y ajouter une réflexion.'}
              </p>
            ) : (
              <div className="space-y-2.5">
                {notes.map((note) => {
                  const bMeta = bibleService.getLivreById(note.bookId);
                  const bName = bMeta ? (language === 'kr' ? bMeta.nameKr : bMeta.nameFr) : note.bookId;
                  return (
                    <div
                      key={note.id}
                      onClick={() => onNavigateToBible(note.bookId, note.chapter, note.verse)}
                      className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-slate-800/60 border border-amber-300/40 dark:border-slate-700/60 cursor-pointer hover:border-amber-500 transition space-y-1"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-amber-700 dark:text-amber-300">
                        <span>
                          {bName} {note.chapter}:{note.verse}
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {new Date(note.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="font-scripture text-xs text-slate-800 dark:text-slate-200 leading-relaxed italic">
                        « {note.text} »
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Highlights List */}
          <div className="p-4 bg-white dark:bg-[#0D1C30] rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="font-cinzel font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-amber-500" />
              <span>{language === 'kr' ? 'Vèsè Souliye' : 'Versets Surlignés'}</span>
            </h4>

            {highlights.length === 0 ? (
              <p className="text-center py-6 text-slate-400 text-xs italic">
                {language === 'kr' ? 'Poko gen okenn vèsè souliye.' : 'Aucun verset surligné pour le moment.'}
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {highlights.map((h) => {
                  const bMeta = bibleService.getLivreById(h.bookId);
                  const bName = bMeta ? (language === 'kr' ? bMeta.nameKr : bMeta.nameFr) : h.bookId;
                  return (
                    <button
                      key={h.id}
                      onClick={() => onNavigateToBible(h.bookId, h.chapter, h.verse)}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-400 text-left transition flex items-center justify-between gap-1 text-xs"
                    >
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {bName} {h.chapter}:{h.verse}
                      </span>
                      <span
                        className={`w-3 h-3 rounded-full shrink-0 ${
                          h.color === 'gold'
                            ? 'bg-amber-400'
                            : h.color === 'emerald'
                            ? 'bg-emerald-400'
                            : h.color === 'azure'
                            ? 'bg-sky-400'
                            : 'bg-rose-400'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: BACKUP & EXPORT */}
      {activeSubTab === 'backup' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="p-5 bg-white dark:bg-[#0D1C30] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <h4 className="font-cinzel font-bold text-base text-slate-900 dark:text-white">
                {language === 'kr' ? 'Sove & Pwoteje Done Ou' : 'Sauvegarde & Sécurité des Données'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {language === 'kr'
                  ? 'Tout nòt ou, vèsè ou souliye, plan lekti ak chant pi renmen ou yo ka telechaje nan yon fichye pou w pa janm pèdi yo si w chanje telefòn.'
                  : 'Vos notes, surlignages, progression de lecture et favoris peuvent être exportés dans un fichier pour les conserver ou les transférer vers un autre appareil.'}
              </p>
            </div>

            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Export Button */}
              <button
                onClick={handleExportBackup}
                className="p-4 rounded-2xl bg-[#12263F] text-amber-300 font-bold text-xs flex items-center justify-center gap-2 shadow hover:bg-slate-800 transition active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>{language === 'kr' ? 'Telechaje Kopi Sekirite (JSON)' : 'Exporter ma Sauvegarde'}</span>
              </button>

              {/* Import Button */}
              <label className="p-4 rounded-2xl border border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold text-xs flex items-center justify-center gap-2 hover:bg-amber-500/20 transition cursor-pointer active:scale-95 text-center">
                <Upload className="w-4 h-4" />
                <span>{language === 'kr' ? 'Retabli yon Kopi Sekirite' : 'Restaurer une Sauvegarde'}</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-[#0D1C30] rounded-3xl p-5 border border-amber-500/30 text-slate-900 dark:text-white space-y-4">
            <h4 className="font-cinzel font-bold text-base text-amber-400">
              {language === 'kr' ? 'Chanje Pwofil Ou' : 'Personnaliser mon Profil'}
            </h4>

            {/* Avatar picker */}
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-2">
                {language === 'kr' ? 'Chwazi yon senbòl:' : 'Choisissez un symbole chrétien :'}
              </label>
              <div className="flex gap-2 justify-center">
                {avatars.map((av) => (
                  <button
                    key={av}
                    onClick={() => setAvatarInput(av)}
                    className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition ${
                      avatarInput === av
                        ? 'bg-amber-500 scale-110 shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            {/* Name Input */}
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">
                {language === 'kr' ? 'Non ou oswa ti non ou:' : 'Votre nom ou prénom :'}
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Ex. Frère David, Sè Marie..."
                className="w-full p-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsEditingProfile(false)}
                className="px-3.5 py-2 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition"
              >
                {t.common.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
