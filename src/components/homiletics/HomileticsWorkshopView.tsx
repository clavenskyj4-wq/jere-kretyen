import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  GraduationCap,
  BookOpen,
  Sparkles,
  Save,
  Copy,
  Check,
  Plus,
  Trash2,
  FileText,
  Lightbulb,
  CheckCircle2,
  HelpCircle,
  FolderOpen,
  ChevronRight,
  Compass,
  MessageSquare,
  Flame,
  Clock,
  Printer,
} from 'lucide-react';
import { homileticsService } from '../../services/homileticsService';
import { bibleService } from '../../services/bibleService';
import { PREACHING_METHODS, SAMPLE_TEACHING_SERMON } from '../../data/homileticsData';
import { ChapterData, Language, SermonDraft, SermonPoint, SermonType } from '../../types';

interface HomileticsWorkshopViewProps {
  language: Language;
  onBack: () => void;
  onNavigateToBible?: (bookId?: string, chapter?: number, verse?: number) => void;
}

export const HomileticsWorkshopView: React.FC<HomileticsWorkshopViewProps> = ({
  language,
  onBack,
  onNavigateToBible,
}) => {
  const isKr = language === 'kr';

  // Navigation tab inside workshop
  const [activeTab, setActiveTab] = useState<'editor' | 'saved' | 'school'>('editor');

  // Current working sermon draft
  const [currentSermon, setCurrentSermon] = useState<SermonDraft>(() => {
    const list = homileticsService.getSermons();
    return list[0] || SAMPLE_TEACHING_SERMON;
  });

  // Saved sermons list
  const [savedSermons, setSavedSermons] = useState<SermonDraft[]>(() => homileticsService.getSermons());

  // Step in the pedagogical guide: 1: Passage, 2: Observation, 3: Interprétation, 4: Plan, 5: Évaluation & Export
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Live Scripture reader inside workshop
  const [passageText, setPassageText] = useState<ChapterData | null>(null);
  const [loadingPassage, setLoadingPassage] = useState(false);

  // Copy status
  const [copied, setCopied] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  // Load Scripture text when passage changes
  useEffect(() => {
    let isMounted = true;
    const fetchPassage = async () => {
      if (!currentSermon.primaryPassage.bookId) return;
      setLoadingPassage(true);
      try {
        const data = await bibleService.getChapitre(
          currentSermon.primaryPassage.bookId,
          currentSermon.primaryPassage.chapter
        );
        if (isMounted) {
          setPassageText(data);
        }
      } catch (e) {
        console.warn('Could not load scripture in workshop', e);
      } finally {
        if (isMounted) setLoadingPassage(false);
      }
    };
    fetchPassage();
    return () => {
      isMounted = false;
    };
  }, [currentSermon.primaryPassage.bookId, currentSermon.primaryPassage.chapter]);

  // Handle Save
  const handleSave = () => {
    const updated = homileticsService.saveSermon(currentSermon);
    setCurrentSermon(updated);
    setSavedSermons(homileticsService.getSermons());
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2500);
  };

  // Create new draft
  const handleCreateNew = (type: SermonType = 'expositif') => {
    const newDraft = homileticsService.createNewDraft({ type });
    setCurrentSermon(newDraft);
    setCurrentStep(1);
    setActiveTab('editor');
  };

  // Delete draft
  const handleDeleteDraft = (id: string) => {
    if (confirm(isKr ? 'Èske ou vle efase mesaj sa a ?' : 'Supprimer définitivement ce plan de message ?')) {
      homileticsService.deleteSermon(id);
      const updatedList = homileticsService.getSermons();
      setSavedSermons(updatedList);
      if (currentSermon.id === id) {
        setCurrentSermon(updatedList[0] || homileticsService.createNewDraft());
      }
    }
  };

  // Handle copy formatted sermon
  const handleCopyFormatted = () => {
    const formatted = homileticsService.formatForExport(currentSermon, isKr ? 'kr' : 'fr');
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Add a point to outline
  const handleAddPoint = () => {
    const newPoint: SermonPoint = {
      id: `pt-${Date.now()}`,
      title: `${isKr ? 'Pwen' : 'Point'} ${currentSermon.points.length + 1} : `,
      scriptureRef: '',
      explanation: '',
      illustration: '',
      application: '',
    };
    setCurrentSermon(prev => ({
      ...prev,
      points: [...prev.points, newPoint],
    }));
  };

  // Remove a point
  const handleRemovePoint = (index: number) => {
    setCurrentSermon(prev => ({
      ...prev,
      points: prev.points.filter((_, idx) => idx !== index),
    }));
  };

  // Update a point
  const handleUpdatePoint = (index: number, updates: Partial<SermonPoint>) => {
    setCurrentSermon(prev => {
      const nextPoints = [...prev.points];
      nextPoints[index] = { ...nextPoints[index], ...updates };
      return { ...prev, points: nextPoints };
    });
  };

  // Quick preset loader
  const handleApplyPresetPassage = (refFr: string, refKr: string, bookId: string, chapter: number) => {
    setCurrentSermon(prev => ({
      ...prev,
      primaryPassage: {
        bookId,
        chapter,
        referenceText: isKr ? refKr : refFr,
      },
      title: isKr ? `Mesaj sou ${refKr}` : `Message sur ${refFr}`,
    }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pb-24 pt-2 space-y-4">
      {/* Top Header with Back Button */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={onBack}
          className="px-3.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-semibold text-xs flex items-center gap-2 transition active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-amber-500" />
          <span>{isKr ? '← Tounen nan Akèy' : '← Retour à l\'Accueil'}</span>
        </button>

        {/* Action badges: Save & Copy */}
        <div className="flex items-center gap-2">
          {savedMessage && (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-fadeIn">
              <Check className="w-3.5 h-3.5" />
              <span>{isKr ? 'Sove !' : 'Enregistré !'}</span>
            </span>
          )}

          <button
            onClick={handleSave}
            className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isKr ? 'Sove' : 'Sauvegarder'}</span>
          </button>

          <button
            onClick={handleCopyFormatted}
            className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition"
            title="Copier le plan complet"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? (isKr ? 'Kopye !' : 'Copié !') : isKr ? 'Kopye Plan' : 'Copier'}</span>
          </button>
        </div>
      </div>

      {/* Main Mode Navigation Tabs */}
      <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-slate-200/70 dark:bg-slate-800/80 text-xs font-bold">
        <button
          onClick={() => setActiveTab('editor')}
          className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeTab === 'editor'
              ? 'bg-white dark:bg-[#0D1C30] text-amber-600 dark:text-amber-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span className="truncate">{isKr ? 'Atelye ak Pwofesè a' : 'Atelier du Mentor'}</span>
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeTab === 'saved'
              ? 'bg-white dark:bg-[#0D1C30] text-amber-600 dark:text-amber-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FolderOpen className="w-4 h-4" />
          <span className="truncate">
            {isKr ? 'Mesaj Mwen Yo' : 'Mes Prédications'} ({savedSermons.length})
          </span>
        </button>

        <button
          onClick={() => setActiveTab('school')}
          className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeTab === 'school'
              ? 'bg-white dark:bg-[#0D1C30] text-amber-600 dark:text-amber-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span className="truncate">{isKr ? 'Lekòl Predikatè' : 'Guide Homilétique'}</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: WORKSHOP & TEACHER EDITOR
      ========================================================================= */}
      {activeTab === 'editor' && (
        <div className="space-y-4">
          {/* Professor Welcome Banner */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-[#12263F] via-[#0E2036] to-[#0A1626] border border-amber-500/30 text-white shadow-md flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 text-xl">
              👨‍🏫
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider text-amber-400">
                  {isKr ? 'Pwofesè Omiletik & Meditasyon' : 'Le Mentor Homilétique'}
                </span>
                <span className="text-[11px] text-slate-300 font-mono">
                  {isKr ? 'Etap' : 'Étape'} {currentStep}/5
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {currentStep === 1 &&
                  (isKr
                    ? '« Byenveni nan atelye a ! Premye travay la se pa kouri ekri plan mesaj la, men se chwazi pasaj la e benyen lespri ou ladan l an kreyòl e franse. »'
                    : '« Bienvenue dans l\'atelier ! La première tâche du prédicateur n\'est pas d\'inventer des idées, mais de s\'imprégner humblement du souffle de la Parole. »')}
                {currentStep === 2 &&
                  (isKr
                    ? '« Obsèvasyon : Nou reponn kesyon "KISA TÈKS LA DI ?" Gade tout detay, ki moun k\'ap pale, mo kle yo, san ou pa prese tire konklizyon. »'
                    : '« Observation : Nous répondons à la question "QU\'EST-CE QUE LE TEXTE DIT ?" Soyez comme un enquêteur saint qui relève chaque indice textuel. »')}
                {currentStep === 3 &&
                  (isKr
                    ? '« Entèpretasyon : Kisa tèks la te vle di pou premye kretyen yo ? Ki verite etènèl sou Bondye ak Jezi li montre ? »'
                    : '« Interprétation : Qu\'est-ce que le texte signifiait à l\'origine ? Quelle vérité immuable sur Dieu et l\'Évangile s\'en dégage ? »')}
                {currentStep === 4 &&
                  (isKr
                    ? '« Plan Mesaj la : Fòme Ide Santral la an yon sèl fraz kout. Bati 2 a 3 pwen klè ak bon ilistrasyon nan lavi chak jou ak yon apèl pèsonèl. »'
                    : '« Structuration : Condensez votre message en UNE seule idée force (la Big Idea), développez 2 à 3 points concrets et terminez par un appel vibrant. »')}
                {currentStep === 5 &&
                  (isKr
                    ? '« Evalyasyon final : Verifye si mesaj la fidèl ak Bib la, si Jezi nan sant la, epi sove l pou monte sou chè a oswa pataje l nan selil la ! »'
                    : '« Évaluation & Chaire : Vérifiez vos critères d\'homélie christocentrique, puis exportez ou imprimez votre plan prêt à être prêché ! »')}
              </p>
            </div>
          </div>

          {/* Step Selector Tabs (1 to 5) */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {[
              { num: 1, labelFr: '1. Passage & Sujet', labelKr: '1. Pasaj & Tèks' },
              { num: 2, labelFr: '2. Observation', labelKr: '2. Obsèvasyon' },
              { num: 3, labelFr: '3. Interprétation', labelKr: '3. Entèpretasyon' },
              { num: 4, labelFr: '4. Plan & Points', labelKr: '4. Plan Mesaj la' },
              { num: 5, labelFr: '5. Grille & Export', labelKr: '5. Evalyasyon' },
            ].map(step => (
              <button
                key={step.num}
                onClick={() => setCurrentStep(step.num)}
                className={`py-2 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                  currentStep === step.num
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-white dark:bg-[#0D1C30] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-amber-500/40'
                }`}
              >
                <span>{isKr ? step.labelKr : step.labelFr}</span>
              </button>
            ))}
          </div>

          {/* STEP 1: Passage & Method Selector */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-fadeIn">
              {/* Method choice */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#0D1C30] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {isKr ? 'Metòd Meditasyon & Predikasyon' : 'Méthode de Prédication / Méditation'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PREACHING_METHODS.map(m => (
                    <button
                      key={m.type}
                      onClick={() => setCurrentSermon(prev => ({ ...prev, type: m.type }))}
                      className={`p-3 rounded-xl border text-left transition ${
                        currentSermon.type === m.type
                          ? 'bg-amber-500/15 border-amber-500 text-slate-900 dark:text-white font-bold ring-2 ring-amber-500/20'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <div className="text-xs font-bold">{isKr ? m.titleKr : m.titleFr}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                        {isKr ? m.subtitleKr : m.subtitleFr}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title & Theme */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#0D1C30] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {isKr ? 'Tit Mesaj la oswa Meditasyon an' : 'Titre du Message ou de la Méditation'}
                  </label>
                  <input
                    type="text"
                    value={currentSermon.title}
                    onChange={e => setCurrentSermon(prev => ({ ...prev, title: e.target.value }))}
                    placeholder={isKr ? 'Eg: Lapè ki depase tout lespri...' : 'Ex: La Paix qui surpasse toute intelligence...'}
                    className="w-full mt-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {isKr ? 'Tèm Jeneral' : 'Thème Spirituel'}
                    </label>
                    <input
                      type="text"
                      value={currentSermon.theme}
                      onChange={e => setCurrentSermon(prev => ({ ...prev, theme: e.target.value }))}
                      placeholder={isKr ? 'Eg: Konfyans nan mitan eprèv' : 'Ex: La confiance dans l\'épreuve'}
                      className="w-full mt-1.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {isKr ? 'Referans Pasaj la' : 'Référence Biblique'}
                    </label>
                    <input
                      type="text"
                      value={currentSermon.primaryPassage.referenceText}
                      onChange={e =>
                        setCurrentSermon(prev => ({
                          ...prev,
                          primaryPassage: { ...prev.primaryPassage, referenceText: e.target.value },
                        }))
                      }
                      placeholder="Ex: Jean 3:16-21 / Jan 3:16-21"
                      className="w-full mt-1.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Quick Presets recommended by the Professor */}
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isKr ? 'Tèks Rekòmande pa Pwofesè a pou Antrene :' : 'Passages Recommandés pour s\'Entraîner :'}</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { refFr: 'Jean 3:16-21', refKr: 'Jan 3:16-21', bookId: 'JHN', ch: 3 },
                      { refFr: 'Psaume 23:1-6', refKr: 'Sòm 23:1-6', bookId: 'PSA', ch: 23 },
                      { refFr: 'Philippiens 4:4-7', refKr: 'Filipyen 4:4-7', bookId: 'PHP', ch: 4 },
                      { refFr: 'Romains 8:31-39', refKr: 'Women 8:31-39', bookId: 'ROM', ch: 8 },
                      { refFr: 'Éphésiens 6:10-18', refKr: 'Efez 6:10-18', bookId: 'EPH', ch: 6 },
                    ].map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleApplyPresetPassage(p.refFr, p.refKr, p.bookId, p.ch)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-semibold border border-amber-500/20 transition"
                      >
                        {isKr ? p.refKr : p.refFr}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Integrated Bible Reader for the chosen passage (Both FR & KR) */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#0D1C30] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-500" />
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      {isKr ? 'Lekti Pasaj la an Franse & Kreyòl' : 'Lecture Parallèle du Texte (FR & KR)'}
                    </h4>
                  </div>
                  {onNavigateToBible && (
                    <button
                      onClick={() =>
                        onNavigateToBible(
                          currentSermon.primaryPassage.bookId,
                          currentSermon.primaryPassage.chapter
                        )
                      }
                      className="text-xs text-amber-600 dark:text-amber-400 font-bold hover:underline"
                    >
                      {isKr ? 'Louvri nan Labib konplè' : 'Ouvrir dans la Bible'}
                    </button>
                  )}
                </div>

                {loadingPassage ? (
                  <div className="text-center py-6 text-xs text-slate-400">
                    {isKr ? 'Chajman tèks biblik la...' : 'Chargement du passage biblique...'}
                  </div>
                ) : passageText && passageText.verses.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto space-y-2.5 pr-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 p-3 border border-slate-200 dark:border-slate-800 font-serif text-xs leading-relaxed">
                    {passageText.verses.slice(0, 15).map(v => (
                      <div key={v.verse} className="space-y-0.5 border-b border-slate-200/50 dark:border-slate-800/60 pb-1.5 last:border-0">
                        <div className="text-slate-800 dark:text-slate-200">
                          <span className="font-bold text-amber-600 dark:text-amber-400 font-sans mr-1.5">
                            {v.verse}.
                          </span>
                          <span>{v.text}</span>
                        </div>
                        {v.textKr && (
                          <div className="text-amber-800 dark:text-amber-300/90 italic font-sans text-[11px] pl-4">
                            « {v.textKr} »
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic">
                    {isKr ? 'Pasaj la ap pare pou lekti.' : 'Le passage sélectionné s\'affichera ici.'}
                  </div>
                )}
              </div>

              <button
                onClick={() => setCurrentStep(2)}
                className="w-full py-3 rounded-2xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 hover:bg-amber-400 transition"
              >
                <span>{isKr ? 'Etap 2 : Pase nan Obsèvasyon' : 'Étape 2 : Passer à l\'Observation'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: Observation (Qu'est-ce que le texte dit ?) */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-white dark:bg-[#0D1C30] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5">
                <div className="flex items-center gap-2 text-amber-500">
                  <Lightbulb className="w-4 h-4" />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    {isKr ? 'Obsèvasyon Minisye (Gade san jije)' : 'Observation Minutieuse du Texte'}
                  </h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      1. {isKr ? 'Ki moun k\'ap pale e ak ki moun ?' : 'Qui parle et à qui s\'adresse-t-il ?'}
                    </label>
                    <textarea
                      rows={2}
                      value={currentSermon.observationNotes.who}
                      onChange={e =>
                        setCurrentSermon(prev => ({
                          ...prev,
                          observationNotes: { ...prev.observationNotes, who: e.target.value },
                        }))
                      }
                      placeholder={isKr ? 'Eg: Pòl ap ekri kretyen lavil Filip yo pandan l nan prizon...' : 'Ex: Paul écrit aux croyants de Philippe depuis une prison romaine...'}
                      className="w-full mt-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      2. {isKr ? 'Ki kote ak nan ki sitiyasyon istorik sa te pase ?' : 'Où et dans quelle circonstance historique ?'}
                    </label>
                    <textarea
                      rows={2}
                      value={currentSermon.observationNotes.whereWhen}
                      onChange={e =>
                        setCurrentSermon(prev => ({
                          ...prev,
                          observationNotes: { ...prev.observationNotes, whereWhen: e.target.value },
                        }))
                      }
                      placeholder={isKr ? 'Eg: Nan anviwon ane 61 aprè Jezikri...' : 'Ex: Vers l\'an 61 après J.-C., persécution et épreuves...'}
                      className="w-full mt-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      3. {isKr ? 'Ki mo kle ki repete plizyè fwa nan tèks la ?' : 'Quels sont les mots-clés répétés ou verbes d\'action ?'}
                    </label>
                    <input
                      type="text"
                      value={currentSermon.observationNotes.keywords}
                      onChange={e =>
                        setCurrentSermon(prev => ({
                          ...prev,
                          observationNotes: { ...prev.observationNotes, keywords: e.target.value },
                        }))
                      }
                      placeholder={isKr ? 'Eg: Kè kontan, lapriyè, lapè Bondye, gras' : 'Ex: Réjouissez-vous, prières, paix de Dieu, gardera vos cœurs'}
                      className="w-full mt-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="w-1/3 py-3 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  {isKr ? '← Tounen' : '← Étape 1'}
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="w-2/3 py-3 rounded-2xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 hover:bg-amber-400 transition"
                >
                  <span>{isKr ? 'Etap 3 : Pase nan Entèpretasyon' : 'Étape 3 : Interprétation'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Interprétation (Qu'est-ce que le texte signifie ?) */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-white dark:bg-[#0D1C30] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5">
                <div className="flex items-center gap-2 text-amber-500">
                  <GraduationCap className="w-4 h-4" />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    {isKr ? 'Entèpretasyon & Verite Biblik' : 'Interprétation Théologique'}
                  </h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      1. {isKr ? 'Kisa tèks la te vle di pou premye moun ki te resevwa l yo ?' : 'Que signifiait ce passage pour ses premiers destinataires ?'}
                    </label>
                    <textarea
                      rows={2}
                      value={currentSermon.interpretationNotes.originalMeaning}
                      onChange={e =>
                        setCurrentSermon(prev => ({
                          ...prev,
                          interpretationNotes: { ...prev.interpretationNotes, originalMeaning: e.target.value },
                        }))
                      }
                      placeholder={isKr ? 'Eg: Pòl te vle ankouraje legliz Filip la pou yo pa kite enkyetid kase fòs yo...' : 'Ex: Paul rassurait l\'Église que la joie ne dépend pas des barreaux de prison mais de Christ...'}
                      className="w-full mt-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      2. {isKr ? 'Ki verite etènèl sou Bondye oswa Jezikri tèks sa a revele ?' : 'Quelle vérité éternelle sur Dieu, le Christ ou l\'Évangile est révélée ?'}
                    </label>
                    <textarea
                      rows={2}
                      value={currentSermon.interpretationNotes.theologicalTruth}
                      onChange={e =>
                        setCurrentSermon(prev => ({
                          ...prev,
                          interpretationNotes: { ...prev.interpretationNotes, theologicalTruth: e.target.value },
                        }))
                      }
                      placeholder={isKr ? 'Eg: Bondye se sous yon lapè ki pi fò pase tout pwoblèm sou latè...' : 'Ex: Dieu ne supprime pas toujours la tempête immédiatement, mais sa paix monte la garde...'}
                      className="w-full mt-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      3. {isKr ? 'Lòt vèsè ki soutni ide sa a (Referans kwaze)' : 'Références croisées (Versets parallèles)'}
                    </label>
                    <input
                      type="text"
                      value={currentSermon.interpretationNotes.crossReferences}
                      onChange={e =>
                        setCurrentSermon(prev => ({
                          ...prev,
                          interpretationNotes: { ...prev.interpretationNotes, crossReferences: e.target.value },
                        }))
                      }
                      placeholder="Ex: Ésaïe 26:3, Jean 14:27, 1 Pierre 5:7"
                      className="w-full mt-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="w-1/3 py-3 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  {isKr ? '← Étape 2' : '← Étape 2'}
                </button>
                <button
                  onClick={() => setCurrentStep(4)}
                  className="w-2/3 py-3 rounded-2xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 hover:bg-amber-400 transition"
                >
                  <span>{isKr ? 'Etap 4 : Bati Plan ak Pwen yo' : 'Étape 4 : Structurer le Plan'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Outline (Big Idea, Introduction, Points, Conclusion) */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-fadeIn">
              {/* The Big Idea Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 to-amber-500/5 border border-amber-500/40 space-y-2">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <Flame className="w-4 h-4" />
                  <label className="text-xs font-bold uppercase tracking-wider">
                    {isKr ? 'Ide Santral la (Big Idea en 1 seule phrase)' : 'L\'Idée Centrale du Message (Big Idea)'}
                  </label>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isKr
                    ? 'Si moun yo ta dwe sonje yon sèl fraz lè yo sòti nan legliz la, kisa fraz sa a ye ?'
                    : 'Si les auditeurs ne devaient retenir qu\'une seule phrase le dimanche, quelle serait-elle ?'}
                </p>
                <input
                  type="text"
                  value={currentSermon.bigIdea}
                  onChange={e => setCurrentSermon(prev => ({ ...prev, bigIdea: e.target.value }))}
                  placeholder={isKr ? 'Eg: Lapè Bondye a se pou tout moun ki depoze chay yo nan lapriyè...' : 'Ex: La paix de Dieu nous est accordée quand nous déposons nos fardeaux dans la prière reconnaissante.'}
                  className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border border-amber-500/30 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              {/* Introduction & Hook */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#0D1C30] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {isKr ? 'Entwodiksyon & Akwoch (Kaptive atansyon)' : 'Introduction & Accroche'}
                </h4>
                <div className="space-y-2.5">
                  <div>
                    <label className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                      {isKr ? 'Akwoch / Ilistrasyon kòmansman' : 'Accroche (Question piquante ou histoire de départ)'}
                    </label>
                    <textarea
                      rows={2}
                      value={currentSermon.introduction.hook}
                      onChange={e =>
                        setCurrentSermon(prev => ({
                          ...prev,
                          introduction: { ...prev.introduction, hook: e.target.value },
                        }))
                      }
                      placeholder={isKr ? 'Eg: Èske sa rive nou deja pou yon ti enkyetid vòlè tout dòmi nan je nou ?' : 'Ex: Avez-vous déjà remarqué comment une petite pensée d\'inquiétude à 3h du matin peut voler tout notre sommeil ?'}
                      className="w-full mt-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Main Points / Development */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#0D1C30] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    {isKr ? 'Pwen Prensipal Mesaj la (Devlopman)' : 'Points Principaux du Message'}
                  </h4>
                  <button
                    onClick={handleAddPoint}
                    className="px-2.5 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isKr ? 'Ajoute Pwen' : 'Ajouter un point'}</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {currentSermon.points.map((pt, idx) => (
                    <div
                      key={pt.id || idx}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        {currentSermon.points.length > 1 && (
                          <button
                            onClick={() => handleRemovePoint(idx)}
                            className="text-slate-400 hover:text-rose-500 transition p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={pt.title}
                          onChange={e => handleUpdatePoint(idx, { title: e.target.value })}
                          placeholder={isKr ? 'Tit pwen an' : 'Titre du point'}
                          className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                        />
                        <input
                          type="text"
                          value={pt.scriptureRef}
                          onChange={e => handleUpdatePoint(idx, { scriptureRef: e.target.value })}
                          placeholder={isKr ? 'Vèsè ki soutni l' : 'Verset d\'appui'}
                          className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                        />
                      </div>

                      <textarea
                        rows={2}
                        value={pt.explanation}
                        onChange={e => handleUpdatePoint(idx, { explanation: e.target.value })}
                        placeholder={isKr ? 'Eksplikasyon biblik pwen an...' : 'Explication textuelle du point...'}
                        className="w-full p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={pt.illustration}
                          onChange={e => handleUpdatePoint(idx, { illustration: e.target.value })}
                          placeholder={isKr ? 'Ilistrasyon konkrè (Imaj)' : 'Illustration concrète'}
                          className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                        />
                        <input
                          type="text"
                          value={pt.application}
                          onChange={e => handleUpdatePoint(idx, { application: e.target.value })}
                          placeholder={isKr ? 'Aplikasyon pou lavi jodi a' : 'Application pratique directe'}
                          className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conclusion & Call to Action */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#0D1C30] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {isKr ? 'Konklizyon & Apèl (Desizyon pou Kris)' : 'Conclusion & Appel à la Décision'}
                </h4>
                <div className="space-y-2.5">
                  <div>
                    <label className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                      {isKr ? 'Apèl / Envitasyon pou moun aji' : 'Appel à la repentance / engagement'}
                    </label>
                    <textarea
                      rows={2}
                      value={currentSermon.conclusion.callToAction}
                      onChange={e =>
                        setCurrentSermon(prev => ({
                          ...prev,
                          conclusion: { ...prev.conclusion, callToAction: e.target.value },
                        }))
                      }
                      placeholder={isKr ? 'Eg: Èske gen yon moun la a ki vle remèt lavi l bay Jezi jodi a ?' : 'Ex: Y a-t-il quelqu\'un ce matin qui souhaite déposer son fardeau au pied de la croix ?'}
                      className="w-full mt-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                      {isKr ? 'Priyè Final' : 'Prière de clôture'}
                    </label>
                    <textarea
                      rows={2}
                      value={currentSermon.conclusion.prayer}
                      onChange={e =>
                        setCurrentSermon(prev => ({
                          ...prev,
                          conclusion: { ...prev.conclusion, prayer: e.target.value },
                        }))
                      }
                      placeholder={isKr ? 'Eg: Senyè Jezi, nou kase chenn enkyetid la nan non w...' : 'Ex: Seigneur Jésus, nous renonçons à la peur et recevons ta paix bénie. Amen !'}
                      className="w-full mt-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="w-1/3 py-3 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  {isKr ? '← Étape 3' : '← Étape 3'}
                </button>
                <button
                  onClick={() => setCurrentStep(5)}
                  className="w-2/3 py-3 rounded-2xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 hover:bg-amber-400 transition"
                >
                  <span>{isKr ? 'Etap 5 : Evalyasyon & Ekspòte' : 'Étape 5 : Grille d\'Évaluation'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Teacher's Rubric & Export for Pulpit */}
          {currentStep === 5 && (
            <div className="space-y-4 animate-fadeIn">
              {/* Professor Evaluation Checklist */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#0D1C30] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5">
                <div className="flex items-center gap-2 text-amber-500">
                  <CheckCircle2 className="w-4 h-4" />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    {isKr ? 'Gril Evalyasyon Pwofesè a (Tcheke anvan w preche)' : 'Grille d\'Évaluation du Mentor (Avant la Chaire)'}
                  </h3>
                </div>

                <div className="space-y-2.5">
                  {[
                    {
                      key: 'biblicalFaithfulness',
                      labelFr: 'Le message est-il fidèle au texte dans son contexte ?',
                      labelKr: 'Èske mesaj la fidèl ak sa tèks la vle di tout bon ?',
                    },
                    {
                      key: 'clearCentralIdea',
                      labelFr: 'L\'idée centrale (Big Idea) est-elle claire et mémorable ?',
                      labelKr: 'Èske Ide Santral la klè e fasil pou moun sonje ?',
                    },
                    {
                      key: 'practicalApplication',
                      labelFr: 'L\'auditeur sait-il quoi faire concrètement dès lundi matin ?',
                      labelKr: 'Èske moun k\'ap koute yo konnen kisa pou yo fè depi lendi maten ?',
                    },
                    {
                      key: 'gospelCentered',
                      labelFr: 'Christ et la grâce sont-ils au centre (et non la morale pure) ?',
                      labelKr: 'Èske se Jezi ak gras li ki nan sant mesaj la (se pa sèlman moral) ?',
                    },
                  ].map(item => {
                    const isChecked = !!(currentSermon.evaluation as any)[item.key];
                    return (
                      <div
                        key={item.key}
                        onClick={() =>
                          setCurrentSermon(prev => ({
                            ...prev,
                            evaluation: {
                              ...prev.evaluation,
                              [item.key]: !isChecked,
                            },
                          }))
                        }
                        className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                          isChecked
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-900 dark:text-emerald-200'
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span className="text-xs font-medium">{isKr ? item.labelKr : item.labelFr}</span>
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center ${
                            isChecked ? 'bg-emerald-500 text-white' : 'border border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Preaching time target */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isKr ? 'Tan prevwa pou preche :' : 'Durée estimée :'}</span>
                  </span>
                  <select
                    value={currentSermon.evaluation.timeTarget || '20-25 min'}
                    onChange={e =>
                      setCurrentSermon(prev => ({
                        ...prev,
                        evaluation: { ...prev.evaluation, timeTarget: e.target.value },
                      }))
                    }
                    className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100"
                  >
                    <option value="10-15 min">10 - 15 min (Dévotion / Jeûne)</option>
                    <option value="20-25 min">20 - 25 min (Culte standard)</option>
                    <option value="30-40 min">30 - 40 min (Étude approfondie)</option>
                  </select>
                </div>
              </div>

              {/* Ready to Preach: Actions */}
              <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                  {isKr ? 'Mesaj Ou Pare pou Monte sou Chè a !' : 'Votre Plan est Prêt pour la Chaire'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={handleCopyFormatted}
                    className="py-3 px-4 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 hover:bg-amber-400 shadow-sm transition"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? (isKr ? 'Kopye nan Pres-Papiye !' : 'Copié dans le Presse-Papier !') : isKr ? 'Kopye Plan Konplè a' : 'Copier le Plan Complet'}</span>
                  </button>

                  <button
                    onClick={handleSave}
                    className="py-3 px-4 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-300 dark:hover:bg-slate-700 transition"
                  >
                    <Save className="w-4 h-4 text-amber-500" />
                    <span>{isKr ? 'Anrejistre nan Mesaj Mwen' : 'Sauvegarder dans Mes Prédications'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: SAVED SERMONS & DRAFTS LIBRARY
      ========================================================================= */}
      {activeTab === 'saved' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {isKr ? 'Koleksyon Meditasyon & Mesaj Ou Yo' : 'Bibliothèque de vos Prédications'}
            </h3>
            <button
              onClick={() => handleCreateNew('expositif')}
              className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-amber-400 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isKr ? 'Nouvo Mesaj' : 'Nouveau Message'}</span>
            </button>
          </div>

          <div className="space-y-3">
            {savedSermons.map(sermon => {
              const isSelected = sermon.id === currentSermon.id;
              return (
                <div
                  key={sermon.id}
                  className={`p-4 rounded-2xl border transition flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/50 shadow-sm ring-2 ring-amber-500/20'
                      : 'bg-white dark:bg-[#0D1C30] border-slate-200 dark:border-slate-800 hover:border-slate-400'
                  }`}
                >
                  <div
                    onClick={() => {
                      setCurrentSermon(sermon);
                      setActiveTab('editor');
                    }}
                    className="flex-1 cursor-pointer space-y-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase">
                        {sermon.type}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(sermon.updatedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {sermon.title}
                    </h4>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                      📖 {sermon.primaryPassage.referenceText} • {sermon.bigIdea || (isKr ? 'Pa gen ide santral' : 'Sans thèse')}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 pt-1">
                    <button
                      onClick={() => {
                        setCurrentSermon(sermon);
                        setActiveTab('editor');
                      }}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-amber-500 text-xs font-semibold"
                      title="Modifier"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                    {savedSermons.length > 1 && (
                      <button
                        onClick={() => handleDeleteDraft(sermon.id)}
                        className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 hover:bg-rose-100 text-xs"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: THE PREACHER'S SCHOOL & HOMILETICAL PRINCIPLES
      ========================================================================= */}
      {activeTab === 'school' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-5 rounded-3xl bg-white dark:bg-[#0D1C30] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 text-amber-500">
              <Compass className="w-5 h-5" />
              <h3 className="font-cinzel font-bold text-base text-slate-900 dark:text-white">
                {isKr ? 'Prensip Debaz pou Byen Medite & Preche' : 'Les Piliers de l\'Homilétique Biblique'}
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {isKr
                ? 'Predikasyon kretyen an se pa yon senp diskou moun fè, se Pawòl Bondye a ki transmèt grasa yon kè ki ranpli ak Lespri Sen an.'
                : 'La prédication chrétienne n\'est pas un discours oratoire de sagesse humaine, mais la proclamation fidèle du conseil de Dieu pour le salut et l\'édification des âmes.'}
            </p>

            {/* The 4 golden rules */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                <span className="font-bold text-xs text-amber-700 dark:text-amber-400">
                  1. {isKr ? 'Kontèks la se Wa' : 'Le Contexte est Roi'}
                </span>
                <p className="text-[11px] text-slate-700 dark:text-slate-300">
                  {isKr
                    ? 'Pa janm pran yon vèsè poukont li san w pa li sa ki anvan l ak sa ki apre l.'
                    : 'Un texte sorti de son contexte devient un prétexte. Lisez toujours 5 versets avant et après.'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                <span className="font-bold text-xs text-amber-700 dark:text-amber-400">
                  2. {isKr ? 'Jezi nan Sant la' : 'Christocentrisme'}
                </span>
                <p className="text-[11px] text-slate-700 dark:text-slate-300">
                  {isKr
                    ? 'Tout chemen nan Labib la mennen nan kwa a ak gras Jezikri a.'
                    : 'Ne prêchez pas la morale sans la grâce : montrez comment Christ est la réponse au besoin humain.'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                <span className="font-bold text-xs text-amber-700 dark:text-amber-400">
                  3. {isKr ? 'Klè e Konkrè' : 'La Règle des 3 C'}
                </span>
                <p className="text-[11px] text-slate-700 dark:text-slate-300">
                  {isKr
                    ? 'Mesaj la dwe : Klè, Kris nan sant la, e Konkrè pou lavi a.'
                    : 'Un message efficace est Clair, Christocentrique et Concret dans ses applications quotidiennes.'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                <span className="font-bold text-xs text-amber-700 dark:text-amber-400">
                  4. {isKr ? 'Lapriyè anvan tout bagay' : 'La Prière et l\'Onction'}
                </span>
                <p className="text-[11px] text-slate-700 dark:text-slate-300">
                  {isKr
                    ? 'Yon mesaj prepare nan etid dwe tranpe nan lapriyè pou l bay fwi.'
                    : 'Le travail intellectuel d\'exégèse n\'a de puissance que trempé dans la prière secrète.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                handleCreateNew('expositif');
              }}
              className="w-full py-3 rounded-2xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 hover:bg-amber-400 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isKr ? 'Kòmanse yon Nouvo Mesaj kounye a' : 'Démarrer un Nouveau Message Guidé'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
