import React, { useState, useEffect, useRef } from 'react';
import {
  Music2,
  Search,
  Maximize2,
  Minimize2,
  Mic,
  Heart,
  Share2,
  ChevronLeft,
  Sliders,
  Type,
  BookMarked,
  Sparkles,
  Hash,
  ListMusic,
  Play,
  Pause,
  Plus,
  Check,
  Volume2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  RotateCcw,
} from 'lucide-react';
import { HYMNAL_SECTIONS } from '../../data/sampleSongs';
import { songService } from '../../services/songService';
import { HymnalSection, Language, Song, SongCategory, WorshipList } from '../../types';
import { TRANSLATIONS } from '../../i18n/translations';
import { HymnDialModal } from './HymnDialModal';
import { WorshipListsModal } from './WorshipListsModal';

interface SongsViewProps {
  language: Language;
  initialSongId?: string;
  onOpenRecordWithSong: (song: Song) => void;
  onBack?: () => void;
}

export const SongsView: React.FC<SongsViewProps> = ({
  language,
  initialSongId,
  onOpenRecordWithSong,
  onBack,
}) => {
  const t = TRANSLATIONS[language];
  const [selectedSong, setSelectedSong] = useState<Song | null>(() => {
    if (initialSongId) {
      return songService.getSongById(initialSongId) || songService.getAllSongs()[0];
    }
    return null;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<HymnalSection | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<SongCategory | 'all'>('all');
  const [worshipMode, setWorshipMode] = useState(false);
  const [fontSize, setFontSize] = useState(20);
  const [lyricsAlignment, setLyricsAlignment] = useState<'left' | 'center' | 'right' | 'justify'>('left');
  const [lyricsBold, setLyricsBold] = useState(false);
  const [lyricsItalic, setLyricsItalic] = useState(false);
  const [showFormatting, setShowFormatting] = useState(false);

  // Auto-scroll for hands-free singing
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState<number>(1); // 1, 2, 3
  const scrollIntervalRef = useRef<any>(null);

  // Modals
  const [isDialModalOpen, setIsDialModalOpen] = useState(false);
  const [isWorshipListsOpen, setIsWorshipListsOpen] = useState(false);
  const [showAddToPlaylistModal, setShowAddToPlaylistModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Favorites & lists
  const [favorites, setFavorites] = useState<string[]>(() => songService.getFavorites());
  const [, setSharedSongsVersion] = useState(0);

  // Filter songs
  const songs = songService.searchSongs(searchQuery, selectedCategory, selectedSection);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  useEffect(() => {
    let active = true;
    void songService.refreshSharedSongs().then(() => {
      if (active) setSharedSongsVersion(version => version + 1);
    }).catch(error => {
      console.error('Impossible de charger les chants partagés.', error);
    });
    return () => { active = false; };
  }, []);

  const toggleFavorite = (songId: string) => {
    const updated = songService.toggleFavorite(songId);
    setFavorites(updated);
    showToast(
      updated.includes(songId)
        ? language === 'kr' ? 'Mete nan chant pi renmen !' : 'Ajouté aux favoris !'
        : language === 'kr' ? 'Retire nan chant pi renmen' : 'Retiré des favoris'
    );
  };

  // Auto scroll effect
  useEffect(() => {
    if (isAutoScrolling) {
      scrollIntervalRef.current = setInterval(() => {
        window.scrollBy({ top: scrollSpeed, behavior: 'smooth' });
      }, 50);
    } else {
      clearInterval(scrollIntervalRef.current);
    }
    return () => clearInterval(scrollIntervalRef.current);
  }, [isAutoScrolling, scrollSpeed]);

  const handleShareSong = (song: Song) => {
    const chorusText = song.chorus ? `\n\n*Refrain :*\n${song.chorus.join('\n')}` : '';
    const text = `*#${song.number} — ${song.title}*\n${song.section}\n\n*Couplet 1 :*\n${song.verses[0].text.join('\n')}${chorusText}\n\n_Jere Kretyen — Chante et vis la Parole_`;

    if (navigator.share) {
      navigator.share({
        title: `#${song.number} ${song.title}`,
        text,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      showToast(language === 'kr' ? 'Pawòl chant kopye !' : 'Paroles copiées dans le presse-papier !');
    }
  };

  const handleAddSongToWorshipList = (list: WorshipList, songId: string) => {
    if (!list.songIds.includes(songId)) {
      const updatedList: WorshipList = {
        ...list,
        songIds: [...list.songIds, songId],
      };
      songService.saveWorshipList(updatedList);
      showToast(language === 'kr' ? `Ajoute nan « ${list.title} » !` : `Ajouté à la liste « ${list.title} » !`);
    } else {
      showToast(language === 'kr' ? 'Chant sa a deja nan lis la' : 'Ce chant est déjà dans cette liste');
    }
    setShowAddToPlaylistModal(false);
  };

  const categories: { id: SongCategory | 'all'; label: string }[] = [
    { id: 'all', label: t.songs.filterAll },
    { id: 'adoration', label: t.songs.filterAdoration },
    { id: 'louange', label: t.songs.filterLouange },
    { id: 'foi', label: t.songs.filterFoi },
    { id: 'esperance', label: t.songs.filterEsperance },
    { id: 'priere', label: language === 'kr' ? 'Lapriyè' : 'Prière' },
    { id: 'combat_spirituel', label: language === 'kr' ? 'Batay Espirityèl' : 'Combat Spirituel' },
    { id: 'paques', label: t.songs.filterPaques },
    { id: 'noel', label: t.songs.filterNoel },
    { id: 'enfants', label: t.songs.filterEnfants },
  ];

  const formattingPanel = showFormatting && (
    <div
      role="group"
      aria-label={language === 'kr' ? 'Fòma pawòl yo' : 'Formatage des paroles'}
      className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-xs dark:border-slate-800 dark:bg-[#0D1C30]"
    >
      <span className="mr-1 font-semibold text-slate-500 dark:text-slate-400">
        {language === 'kr' ? 'Aliyman' : 'Alignement'}
      </span>
      {([
        ['left', AlignLeft, language === 'kr' ? 'Gòch' : 'Gauche'],
        ['center', AlignCenter, language === 'kr' ? 'Sant' : 'Centrer'],
        ['right', AlignRight, language === 'kr' ? 'Dwat' : 'Droite'],
        ['justify', AlignJustify, language === 'kr' ? 'Jistifye' : 'Justifier'],
      ] as const).map(([alignment, Icon, label]) => (
        <button
          key={alignment}
          type="button"
          onClick={() => setLyricsAlignment(alignment)}
          aria-label={label}
          aria-pressed={lyricsAlignment === alignment}
          className={`rounded-lg p-2 transition ${
            lyricsAlignment === alignment
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-amber-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
          }`}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
      <span className="mx-1 h-6 w-px bg-slate-200 dark:bg-slate-700" />
      <button
        type="button"
        onClick={() => setLyricsBold(value => !value)}
        aria-label={language === 'kr' ? 'Gras' : 'Gras'}
        aria-pressed={lyricsBold}
        className={`rounded-lg p-2 transition ${
          lyricsBold
            ? 'bg-amber-500 text-slate-950 shadow-sm'
            : 'bg-slate-100 text-slate-700 hover:bg-amber-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
        }`}
      >
        <Bold className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => setLyricsItalic(value => !value)}
        aria-label={language === 'kr' ? 'An italik' : 'Italique'}
        aria-pressed={lyricsItalic}
        className={`rounded-lg p-2 transition ${
          lyricsItalic
            ? 'bg-amber-500 text-slate-950 shadow-sm'
            : 'bg-slate-100 text-slate-700 hover:bg-amber-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
        }`}
      >
        <Italic className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => {
          setLyricsAlignment('left');
          setLyricsBold(false);
          setLyricsItalic(false);
          setFontSize(20);
        }}
        className="ml-auto inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-2 text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        {language === 'kr' ? 'Reyajiste' : 'Réinitialiser'}
      </button>
    </div>
  );

  // MODE CULTE (Plein écran solennel pour projection ou pupitre)
  if (worshipMode && selectedSong) {
    return (
      <div className="fixed inset-0 z-50 bg-[#081422] text-white p-6 overflow-y-auto animate-in fade-in flex flex-col justify-between">
        <div className="max-w-2xl mx-auto w-full">
          {/* Top Bar Mode Culte */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <span className="text-amber-400 font-bold text-sm uppercase tracking-widest">
                #{selectedSong.number} — {selectedSong.section}
              </span>
              <h2 className="font-cinzel font-bold text-2xl text-white mt-0.5">
                {selectedSong.title}
              </h2>
              {selectedSong.keySignature && (
                <span className="text-xs text-slate-400">
                  Tonalité : {selectedSong.keySignature}
                </span>
              )}
            </div>
            <button
              onClick={() => setWorshipMode(false)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
            >
              <Minimize2 className="w-4 h-4" />
              <span>{t.songs.exitWorshipMode}</span>
            </button>
          </div>

          {/* Auto scroll control bar inside Worship mode */}
          <div className="my-4 py-2 px-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <button
              onClick={() => setIsAutoScrolling(!isAutoScrolling)}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition ${
                isAutoScrolling ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
              }`}
            >
              {isAutoScrolling ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{t.songs.autoScroll}</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">Taille:</span>
              <button onClick={() => setFontSize(Math.max(16, fontSize - 2))} className="px-2 py-0.5 bg-slate-800 rounded">A-</button>
              <button onClick={() => setFontSize(Math.min(34, fontSize + 2))} className="px-2 py-0.5 bg-slate-800 rounded">A+</button>
            </div>
            <button
              type="button"
              onClick={() => setShowFormatting(value => !value)}
              aria-expanded={showFormatting}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-semibold transition ${
                showFormatting ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              <Type className="h-3.5 w-3.5" />
              {language === 'kr' ? 'Fòma' : 'Format'}
            </button>
          </div>
          {formattingPanel && <div className="my-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-1 [&>div]:border-slate-700 [&>div]:bg-transparent [&>div]:text-slate-200">{formattingPanel}</div>}

          {/* Lyrics Large */}
          <div className="py-6 space-y-10 text-center">
            {selectedSong.verses.map((v) => (
              <div key={v.number} className="space-y-3">
                <span className="inline-block px-3.5 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs font-bold uppercase tracking-widest border border-amber-500/20">
                  Couplet {v.number}
                </span>
                <div
                  className="font-scripture leading-relaxed tracking-wide text-slate-100"
                  style={{
                    fontSize: `${fontSize + 6}px`,
                    textAlign: lyricsAlignment,
                    fontWeight: lyricsBold ? 700 : 400,
                    fontStyle: lyricsItalic ? 'italic' : 'normal',
                  }}
                >
                  {v.text.map((l, i) => (
                    <p key={i} className="mb-2">
                      {l}
                    </p>
                  ))}
                </div>

                {/* Chorus rendered prominently */}
                {selectedSong.chorus && (
                  <div className="my-6 p-6 rounded-3xl bg-[#12263F]/90 border border-amber-500/40 text-amber-200 shadow-xl">
                    <span className="block text-xs uppercase tracking-widest text-amber-400 font-bold mb-2">
                      Refrain
                    </span>
                    <div
                      className="font-scripture italic leading-relaxed"
                      style={{
                        fontSize: `${fontSize + 6}px`,
                        textAlign: lyricsAlignment,
                        fontWeight: lyricsBold ? 700 : 600,
                        fontStyle: lyricsItalic ? 'italic' : 'normal',
                      }}
                    >
                      {selectedSong.chorus.map((l, i) => (
                        <p key={i} className="mb-2 font-semibold">
                          {l}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Floating Bar */}
        <div className="py-4 text-center border-t border-slate-800/80">
          <button
            onClick={() => {
              setWorshipMode(false);
              onOpenRecordWithSong(selectedSong);
            }}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:brightness-110 text-white font-bold text-sm shadow-xl inline-flex items-center gap-2 active:scale-95 transition"
          >
            <Mic className="w-5 h-5" />
            <span>{t.songs.recordThisSong}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 pb-24 pt-2 space-y-4">
      {/* Toast message */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#12263F] text-amber-300 px-4 py-2 rounded-xl shadow-xl border border-amber-500/40 text-xs font-semibold animate-in fade-in flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* If a song is selected, display complete lyrics view */}
      {selectedSong ? (
        <div className="space-y-4 animate-in fade-in">
          {/* Top Bar: Back & Song Controls */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedSong(null)}
              className="py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{t.common.back}</span>
            </button>

            <div className="flex items-center gap-1.5">
              {/* Worship mode button */}
              <button
                onClick={() => setWorshipMode(true)}
                className="py-1.5 px-3 rounded-xl bg-[#12263F] text-amber-300 font-bold text-xs flex items-center gap-1.5 shadow hover:bg-slate-800 transition active:scale-95"
                title="Mode Culte plein écran"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.songs.worshipMode}</span>
              </button>

              {/* Add to Playlist button */}
              <button
                onClick={() => setShowAddToPlaylistModal(true)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-amber-500 transition"
                title="Ajouter à une liste de culte"
              >
                <Plus className="w-4 h-4" />
              </button>

              {/* Favorite */}
              <button
                onClick={() => toggleFavorite(selectedSong.id)}
                className={`p-2 rounded-xl border transition ${
                  favorites.includes(selectedSong.id)
                    ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/40 text-rose-500'
                    : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500'
                }`}
                title="Favoris"
              >
                <Heart className={`w-4 h-4 ${favorites.includes(selectedSong.id) ? 'fill-current' : ''}`} />
              </button>

              {/* Share */}
              <button
                onClick={() => handleShareSong(selectedSong)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-amber-500 transition"
                title="Partager le chant"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Reader Controls: Auto-Scroll & Text Size */}
          <div className="p-2.5 rounded-2xl bg-white dark:bg-[#0D1C30] border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-semibold">
            <button
              onClick={() => setIsAutoScrolling(!isAutoScrolling)}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition ${
                isAutoScrolling
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {isAutoScrolling ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{t.songs.autoScroll}</span>
            </button>

            {/* Scroll speed toggles */}
            {isAutoScrolling && (
              <div className="flex items-center gap-1">
                {[1, 2, 3].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setScrollSpeed(spd)}
                    className={`px-2 py-0.5 rounded text-[11px] ${
                      scrollSpeed === spd
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            )}

            {/* Font size adjustments */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => setFontSize(Math.max(16, fontSize - 2))}
                className="px-2 py-1 text-slate-700 dark:text-slate-300 font-bold hover:text-amber-500"
              >
                A-
              </button>
              <button
                onClick={() => setFontSize(Math.min(30, fontSize + 2))}
                className="px-2 py-1 text-slate-700 dark:text-slate-300 font-bold hover:text-amber-500"
              >
                A+
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowFormatting(value => !value)}
              aria-expanded={showFormatting}
              className={`rounded-xl px-3 py-1.5 font-semibold transition ${
                showFormatting
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-amber-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                <Type className="h-3.5 w-3.5" />
                {language === 'kr' ? 'Fòma' : 'Format'}
              </span>
            </button>
          </div>
          {formattingPanel}

          {/* Song Card */}
          <div className="bg-white dark:bg-[#0D1C30] rounded-3xl p-6 shadow-md border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-800">
              <span className="inline-block px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
                #{selectedSong.number} — {selectedSong.section}
              </span>
              <h2 className="font-cinzel font-bold text-2xl text-slate-900 dark:text-white">
                {selectedSong.title}
              </h2>
              {selectedSong.author && (
                <p className="text-xs text-slate-400 mt-1">
                  Auteur : {selectedSong.author}
                </p>
              )}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                <span className={`font-medium ${
                  selectedSong.copyrightStatus === 'À vérifier'
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}>
                  {selectedSong.copyrightStatus === 'À vérifier' ? '⚠' : '✓'} {selectedSong.copyrightStatus}
                </span>
                {selectedSong.rights?.sourceUrl && /^https?:\/\//i.test(selectedSong.rights.sourceUrl.trim()) && (
                  <a
                    href={selectedSong.rights.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-600 dark:text-amber-400 underline underline-offset-2"
                  >
                    Source des droits
                  </a>
                )}
                {selectedSong.keySignature && (
                  <span>Tonalité : {selectedSong.keySignature}</span>
                )}
                {selectedSong.tempo && <span>Tempo : {selectedSong.tempo}</span>}
              </div>
            </div>

            {/* Verses & Refrain */}
            <div className="space-y-6 max-w-lg mx-auto">
              {selectedSong.verses.map((v) => (
                <div key={v.number} className="space-y-2">
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                    Couplet {v.number}
                  </span>
                  <div
                    className="font-scripture text-slate-800 dark:text-slate-200 leading-relaxed space-y-1.5"
                    style={{
                      fontSize: `${fontSize}px`,
                      textAlign: lyricsAlignment,
                      fontWeight: lyricsBold ? 700 : 400,
                      fontStyle: lyricsItalic ? 'italic' : 'normal',
                    }}
                  >
                    {v.text.map((line, i) => (
                      <p key={i}>{line}</p>
                    )                    )}
                  </div>
                  {(selectedSong.rights?.lyricsAuthor ||
                    selectedSong.rights?.composer ||
                    selectedSong.rights?.translator ||
                    selectedSong.rights?.arranger ||
                    selectedSong.rights?.sourceTitle) && (
                    <p className="text-[10px] text-slate-400 mt-1">
                      {[
                        selectedSong.rights.lyricsAuthor && `Paroles : ${selectedSong.rights.lyricsAuthor}`,
                        selectedSong.rights.composer && `Musique : ${selectedSong.rights.composer}`,
                        selectedSong.rights.translator && `Traduction : ${selectedSong.rights.translator}`,
                        selectedSong.rights.arranger && `Arrangement : ${selectedSong.rights.arranger}`,
                        selectedSong.rights.sourceTitle && `Source : ${selectedSong.rights.sourceTitle}`,
                      ].filter(Boolean).join(' · ')}
                    </p>
                  )}

                  {/* Refrain after couplet 1 */}
                  {v.number === 1 && selectedSong.chorus && (
                    <div
                      className="my-5 p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border-l-4 border-amber-500 text-amber-900 dark:text-amber-200 space-y-1"
                      style={{
                        textAlign: lyricsAlignment,
                        fontWeight: lyricsBold ? 700 : 400,
                        fontStyle: lyricsItalic ? 'italic' : 'normal',
                      }}
                    >
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block mb-1">
                        Refrain
                      </span>
                      {selectedSong.chorus.map((line, i) => (
                        <p key={i} className="font-scripture font-medium italic">
                          {line}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Bottom S'enregistrer CTA Button */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
              <button
                onClick={() => onOpenRecordWithSong(selectedSong)}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 text-white font-bold text-sm shadow-lg hover:brightness-110 active:scale-95 transition inline-flex items-center justify-center gap-2"
              >
                <Mic className="w-5 h-5" />
                <span>{t.songs.recordThisSong}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Song Catalog & Navigation */
        <div className="space-y-4">
          {/* Header & Quick Action Buttons */}
          <div className="flex items-center justify-between gap-2">
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
              <div>
                <h2 className="font-cinzel font-bold text-2xl text-slate-900 dark:text-white">
                  {t.songs.title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t.songs.subtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Dial Numpad Button */}
              <button
                onClick={() => setIsDialModalOpen(true)}
                className="p-2.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500 text-amber-600 dark:text-amber-400 hover:text-slate-950 border border-amber-500/30 font-bold transition flex items-center gap-1.5 text-xs shadow-sm active:scale-95"
                title="Accès rapide par numéro"
              >
                <Hash className="w-4 h-4" />
                <span className="hidden sm:inline">Numéro</span>
              </button>

              {/* Worship Lists button */}
              <button
                onClick={() => setIsWorshipListsOpen(true)}
                className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold transition flex items-center gap-1.5 text-xs border border-slate-200 dark:border-slate-700 shadow-sm active:scale-95"
                title="Listes de Culte"
              >
                <ListMusic className="w-4 h-4 text-amber-500" />
                <span className="hidden sm:inline">Listes</span>
              </button>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.songs.searchPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
            />
          </div>

          {/* Section Pills (Recueils) */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedSection('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedSection === 'all'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {language === 'kr' ? 'Tout Recueil yo' : 'Tous les recueils'}
            </button>
            {HYMNAL_SECTIONS.map((sec) => (
              <button
                key={sec.code}
                onClick={() => setSelectedSection(sec.code)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedSection === sec.code
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {language === 'kr' ? sec.labelKr : sec.labelFr}
              </button>
            ))}
          </div>

          {/* Category Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                  selectedCategory === c.id
                    ? 'bg-[#12263F] text-amber-300 font-bold shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Songs List */}
          <div className="space-y-2.5">
            {songs.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-sm bg-white dark:bg-[#0D1C30] rounded-3xl border border-slate-200 dark:border-slate-800">
                {language === 'kr' ? 'Nou pa jwenn okenn chant.' : 'Aucun chant trouvé.'}
              </div>
            ) : (
              songs.map((song) => {
                const isFav = favorites.includes(song.id);
                return (
                  <div
                    key={song.id}
                    onClick={() => setSelectedSong(song)}
                    className="p-4 rounded-2xl bg-white dark:bg-[#0D1C30] border border-slate-200 dark:border-slate-800 hover:border-amber-400/50 shadow-sm cursor-pointer transition flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/20 text-amber-600 dark:text-amber-400 font-cinzel font-bold text-sm flex items-center justify-center shrink-0 border border-amber-500/20">
                        #{song.number}
                      </span>
                      <div>
                        <h4 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-amber-500 transition line-clamp-1">
                          {song.title}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                          {song.section} • {song.verses[0]?.text[0]}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isFav && <Heart className="w-4 h-4 text-rose-500 fill-current" />}
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        {song.verses.length} c.
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Hymn Dial Modal */}
      <HymnDialModal
        isOpen={isDialModalOpen}
        onClose={() => setIsDialModalOpen(false)}
        onSelectSong={(song) => setSelectedSong(song)}
        language={language}
      />

      {/* Worship Lists Modal */}
      <WorshipListsModal
        isOpen={isWorshipListsOpen}
        onClose={() => setIsWorshipListsOpen(false)}
        onSelectSong={(song) => setSelectedSong(song)}
        language={language}
      />

      {/* Quick Add To Playlist Picker Modal */}
      {showAddToPlaylistModal && selectedSong && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-[#0D1C30] rounded-2xl p-5 border border-amber-500/30 text-slate-900 dark:text-white space-y-4">
            <h4 className="font-bold text-sm">
              {language === 'kr' ? 'Chwazi yon lis kil pou mete chant sa a:' : 'Ajouter ce chant à une liste de culte :'}
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {songService.getWorshipLists().map((list) => (
                <button
                  key={list.id}
                  onClick={() => handleAddSongToWorshipList(list, selectedSong.id)}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-left text-xs font-semibold transition"
                >
                  {list.title}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowAddToPlaylistModal(false)}
              className="w-full py-2 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-white text-center"
            >
              {t.common.cancel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
