import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Music2,
  Mic,
  Share2,
  Copy,
  Check,
  Calendar,
  ChevronRight,
  Flame,
  ArrowRight,
  Megaphone,
  GraduationCap,
  Award,
} from 'lucide-react';
import { getTodayVerse } from '../../data/dailyVerses';
import { SAMPLE_SONGS } from '../../data/sampleSongs';
import { READING_PLANS } from '../../data/readingPlans';
import { storageService } from '../../services/storageService';
import { bibleService } from '../../services/bibleService';
import { Bookmark, Language } from '../../types';
import { TRANSLATIONS } from '../../i18n/translations';
import { VerseCardModal } from '../bible/VerseCardModal';
import { PWAInstallButton } from '../layout/PWAInstallButton';
import { adminBackendService } from '../../services/adminBackendService';

interface HomeViewProps {
  language: Language;
  onNavigateToBible: (bookId?: string, chapter?: number, verse?: number) => void;
  onNavigateToSongs: (songId?: string) => void;
  onNavigateToRecordings: () => void;
  onNavigateToQuiz?: () => void;
  onNavigateToHomiletics?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  language,
  onNavigateToBible,
  onNavigateToSongs,
  onNavigateToRecordings,
  onNavigateToQuiz,
  onNavigateToHomiletics,
}) => {
  const t = TRANSLATIONS[language];
  const todayVerse = getTodayVerse();
  const lastBookmark: Bookmark = storageService.getLastBookmark();
  const book = bibleService.getLivreById(lastBookmark.bookId);
  const bookName = book ? (language === 'kr' ? book.nameKr : book.nameFr) : lastBookmark.bookId;

  const [copied, setCopied] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [sharedAnnouncements, setSharedAnnouncements] = useState<string[] | null>(null);

  const localAnnouncements: string[] = (() => {
    try {
      const stored = localStorage.getItem('jere_kretyen_church_announcements');
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        return Array.isArray(parsed)
          ? parsed.filter((announcement): announcement is string => typeof announcement === 'string')
          : [];
      }
      return [
        'Culte d\'adoration et de louange tous les dimanches matin à 9h00.',
        'Jèn ak Lapriyè chak premye vandredi nan mwa a.'
      ];
    } catch {
      return [];
    }
  })();
  const announcements = sharedAnnouncements ?? localAnnouncements;
  const cleanAnnouncements = Array.isArray(announcements) ? announcements.filter((announcement): announcement is string =>
    typeof announcement === 'string' && announcement.trim().length > 0
  ) : [];

  useEffect(() => {
    let active = true;
    void adminBackendService.getPublicAnnouncements().then(remoteAnnouncements => {
      if (active && remoteAnnouncements) setSharedAnnouncements(remoteAnnouncements);
    }).catch(error => {
      console.error('Impossible de charger les annonces partagées.', error);
    });
    return () => { active = false; };
  }, []);

  const planProgress = storageService.getPlanProgress('year');
  const planPercent = Math.round((planProgress.length / 365) * 100);

  const displayedRef = language === 'kr' ? todayVerse.referenceKr : todayVerse.referenceFr;
  const displayedTheme = language === 'kr' ? todayVerse.themeKr : todayVerse.themeFr;

  const handleCopyDailyVerse = () => {
    navigator.clipboard.writeText(
      `« ${todayVerse.textFr} »\n« ${todayVerse.textKr} »\n(${displayedRef} — Jere Kretyen)`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 pb-24 pt-3 space-y-5">
      {/* PWA Install Banner */}
      <PWAInstallButton language={language} />

      {/* Church Announcements Banner if any */}
      {cleanAnnouncements.length > 0 && (
        <section
          aria-label={language === 'kr' ? 'Anons legliz' : 'Annonces de l’église'}
          className="p-3 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-slate-800 dark:text-amber-200 flex items-center gap-3 overflow-hidden"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Megaphone className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1 overflow-hidden" tabIndex={0}>
            <span className="sr-only">{language === 'kr' ? 'Nouvèl Legliz :' : 'Annonce :'}</span>
            <div className="announcement-marquee flex w-max items-center text-xs font-bold uppercase tracking-wider">
              {[0, 1].map((copy) => (
                <div key={copy} aria-hidden={copy === 1} className="flex shrink-0 items-center gap-8 pr-8">
                  {cleanAnnouncements.map((announcement, index) => (
                    <span key={`${copy}-${index}`} className="inline-flex items-center gap-8 whitespace-nowrap">
                      {index === 0 && (
                        <span className="text-amber-700 dark:text-amber-400">
                          {language === 'kr' ? 'Nouvèl Legliz :' : 'Annonce :'}
                        </span>
                      )}
                      <span>{announcement}</span>
                      <span aria-hidden="true" className="text-amber-500">✦</span>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Verset du Jour (Card Hero) with BOTH French and Haitian Creole */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#12263F] via-[#0E2036] to-[#081422] p-6 text-white shadow-xl border border-amber-500/30">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                {t.home.verseOfDay}
              </span>
            </div>

            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800/80 text-amber-200/90 border border-amber-500/30 font-medium">
              {displayedTheme}
            </span>
          </div>

          {/* Scripture Verse Text: Dual French & Haitian Creole */}
          <div className="space-y-2.5">
            {/* French Louis Segond */}
            <blockquote className="font-scripture text-base sm:text-lg leading-relaxed text-slate-100 italic">
              « {todayVerse.textFr} »
            </blockquote>

            {/* Haitian Creole */}
            <div className="pt-2 border-t border-slate-700/50">
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-amber-400 block mb-1">
                Kreyòl Ayisyen :
              </span>
              <p className="font-scripture text-sm sm:text-base leading-relaxed text-amber-200/90 italic">
                « {todayVerse.textKr} »
              </p>
            </div>
          </div>

          {/* Reference & Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-700/60">
            <button
              onClick={() => onNavigateToBible(todayVerse.bookId, todayVerse.chapter, todayVerse.verse)}
              className="font-cinzel font-bold text-amber-300 hover:text-amber-200 text-sm flex items-center gap-1 transition"
            >
              <span>{displayedRef}</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyDailyVerse}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition active:scale-95 text-xs flex items-center gap-1.5"
                title="Copier le verset"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => setShowCardModal(true)}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm hover:brightness-110 active:scale-95 transition"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{language === 'kr' ? 'Pataje Foto' : 'Partager'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Grid: Reprendre la lecture & S'enregistrer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Reprendre la lecture */}
        <div
          onClick={() => onNavigateToBible(lastBookmark.bookId, lastBookmark.chapter, lastBookmark.verse)}
          className="p-4 rounded-2xl bg-white dark:bg-[#0D1C30] border border-slate-200 dark:border-slate-800 hover:border-amber-500/40 shadow-sm cursor-pointer transition active:scale-[0.99] flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {t.home.resumeReading}
              </span>
              <h4 className="font-cinzel font-bold text-base text-slate-900 dark:text-white group-hover:text-amber-500 transition">
                {bookName} {lastBookmark.chapter}:{lastBookmark.verse || 1}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.home.continueWhereYouLeft}
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-1 transition" />
        </div>

        {/* Bouton rapide "S'enregistrer" */}
        <div
          onClick={onNavigateToRecordings}
          className="p-4 rounded-2xl bg-gradient-to-br from-rose-950/20 to-amber-950/20 dark:from-rose-950/40 dark:to-slate-900 border border-rose-500/20 dark:border-rose-500/30 hover:border-rose-500/50 shadow-sm cursor-pointer transition active:scale-[0.99] flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
              <Mic className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                {t.home.quickRecord}
              </span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                {language === 'kr' ? 'Chante oswa Lapriyè' : 'Chanter ou Prier'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.home.quickRecordDesc}
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-rose-500 group-hover:translate-x-1 transition" />
        </div>
      </div>

      {/* Dynamic Bible Training & Homiletics Workshop */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-amber-500" />
            <h3 className="font-cinzel font-bold text-base text-slate-900 dark:text-slate-100">
              {language === 'kr' ? 'Etid & Fòmasyon Biblik' : 'Étude & Formation Biblique'}
            </h3>
          </div>
          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            {language === 'kr' ? 'Dinamik' : 'Nouveau'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Card 1: Dynamic Bible Quiz Training */}
          <div
            onClick={onNavigateToQuiz}
            className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-500/15 dark:to-slate-900 border border-amber-500/30 hover:border-amber-500/60 shadow-sm cursor-pointer transition active:scale-[0.99] flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 text-xl shadow-inner">
                🧠
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  {language === 'kr' ? 'Kesyon Dinamik' : 'Quiz & Entraînement'}
                </span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-amber-500 transition">
                  {language === 'kr' ? 'Antrènman sou Labib' : 'Questions sur la Bible'}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                  {language === 'kr' ? '66 liv, eksplikasyon vèsè FR & KR' : 'Renouvelé sur divers livres & versets'}
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-1 transition shrink-0" />
          </div>

          {/* Card 2: Homiletics & Meditation Workshop */}
          <div
            onClick={onNavigateToHomiletics}
            className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent dark:from-indigo-500/15 dark:to-slate-900 border border-indigo-500/30 hover:border-indigo-500/60 shadow-sm cursor-pointer transition active:scale-[0.99] flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 text-xl shadow-inner">
                👨‍🏫
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                  {language === 'kr' ? 'Ak Pwofesè a' : 'Espace de Mentorat'}
                </span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-500 transition">
                  {language === 'kr' ? 'Aprann Medite & Preche' : 'Atelier Prédication & Méditation'}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                  {language === 'kr' ? 'Obsèvasyon, plan, ilistrasyon & apèl' : 'Guide méthodique sur un texte ou thème'}
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition shrink-0" />
          </div>
        </div>
      </div>

      {/* Chants d'Espérance Highlights */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#0D1C30] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music2 className="w-5 h-5 text-amber-500" />
            <h3 className="font-cinzel font-bold text-base text-slate-900 dark:text-slate-100">
              {t.home.popularHymns}
            </h3>
          </div>
          <button
            onClick={() => onNavigateToSongs()}
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            <span>{t.home.seeAllHymns}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {SAMPLE_SONGS.slice(0, 4).map((song) => (
            <div
              key={song.id}
              onClick={() => onNavigateToSongs(song.id)}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-50/60 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
                  #{song.number}
                </span>
                <div>
                  <h5 className="font-semibold text-xs text-slate-900 dark:text-slate-100 group-hover:text-amber-500 transition line-clamp-1">
                    {song.title}
                  </h5>
                  <p className="text-[10px] text-slate-400 line-clamp-1">
                    {song.section} • {song.verses[0]?.text[0]}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500 transition shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Reading Plan Tracker Card */}
      <div
        onClick={() => onNavigateToBible('GEN', 1)}
        className="p-5 rounded-2xl bg-gradient-to-br from-[#12263F]/90 to-slate-900 text-white border border-amber-500/30 shadow-md cursor-pointer hover:border-amber-500/60 transition group"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            <h4 className="font-cinzel font-bold text-sm text-amber-300">
              {t.home.readingPlan} — {READING_PLANS[0].titleFr}
            </h4>
          </div>
          <span className="text-xs text-slate-300 font-mono">
            {planProgress.length} / 365 {language === 'kr' ? 'jou' : 'jours'}
          </span>
        </div>

        <p className="text-xs text-slate-300 mb-3">
          {language === 'kr'
            ? 'Kenbe bon abitid pou w li Pawòl Bondye a chak jou.'
            : 'Prenez la sainte discipline de méditer les Écritures chaque jour.'}
        </p>

        {/* Progress bar */}
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all"
            style={{ width: `${Math.max(5, planPercent)}%` }}
          />
        </div>
      </div>

      {/* Verse Card Modal */}
      {showCardModal && (
        <VerseCardModal
          isOpen={showCardModal}
          onClose={() => setShowCardModal(false)}
          reference={displayedRef}
          verseText={todayVerse.textFr}
          verseTextKr={todayVerse.textKr}
          language={language}
        />
      )}
    </div>
  );
};
