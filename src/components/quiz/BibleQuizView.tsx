import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Trophy,
  Flame,
  CheckCircle2,
  XCircle,
  RotateCcw,
  BookOpen,
  HelpCircle,
  Award,
  ChevronRight,
  Filter,
  Eye,
  Check,
} from 'lucide-react';
import { quizService } from '../../services/quizService';
import { bibleService } from '../../services/bibleService';
import { Language, QuizCategory, QuizDifficulty, QuizQuestion, QuizSessionStats } from '../../types';

interface BibleQuizViewProps {
  language: Language;
  onBack: () => void;
  onNavigateToBible?: (bookId?: string, chapter?: number, verse?: number) => void;
}

export const BibleQuizView: React.FC<BibleQuizViewProps> = ({
  language,
  onBack,
  onNavigateToBible,
}) => {
  const isKr = language === 'kr';

  // Session options
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuizDifficulty>('all');
  const [questionCount, setQuestionCount] = useState<number>(10);

  // Quiz state
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'completed'>('setup');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [sessionScore, setSessionScore] = useState(0);
  const [sessionStreak, setSessionStreak] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ question: QuizQuestion; chosenIndex: number; isCorrect: boolean }[]>([]);

  // Verse quick preview modal/drawer
  const [previewVerse, setPreviewVerse] = useState<{ ref: string; textFr: string; textKr?: string } | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Overall stats
  const [stats, setStats] = useState<QuizSessionStats>(() => quizService.getStats());

  const categories: { id: QuizCategory; labelFr: string; labelKr: string; icon: string }[] = [
    { id: 'all', labelFr: 'Tous les livres', labelKr: 'Tout liv yo', icon: '📖' },
    { id: 'evangiles', labelFr: 'Évangiles (Jésus)', labelKr: 'Levanjil yo (Jezi)', icon: '✝️' },
    { id: 'psaumes_sagesse', labelFr: 'Psaumes & Sagesse', labelKr: 'Sòm & Sajès', icon: '🌿' },
    { id: 'actes_epitres', labelFr: 'Actes & Épîtres', labelKr: 'Travay & Lèt yo', icon: '✉️' },
    { id: 'pentateuque', labelFr: 'Pentateuque (Loi)', labelKr: 'Lalwa (Moyiz)', icon: '📜' },
    { id: 'histoire', labelFr: 'Histoire d\'Israël', labelKr: 'Istwa Pèp la', icon: '🛡️' },
    { id: 'prophetes', labelFr: 'Prophètes', labelKr: 'Pwofèt yo', icon: '🎺' },
    { id: 'apocalypse', labelFr: 'Apocalypse', labelKr: 'Revelasyon', icon: '👑' },
    { id: 'doctrines_personnages', labelFr: 'Doctrines & Héros', labelKr: 'Doktrin & Ewo', icon: '⭐' },
    { id: 'historique_livres', labelFr: 'Histoire des livres', labelKr: 'Istwa liv biblik yo', icon: '🗺️' },
  ];

  const difficulties: { id: QuizDifficulty; labelFr: string; labelKr: string }[] = [
    { id: 'all', labelFr: 'Tous niveaux', labelKr: 'Tout nivo' },
    { id: 'easy', labelFr: 'Débutant', labelKr: 'Debutan' },
    { id: 'medium', labelFr: 'Intermédiaire', labelKr: 'Mwayen' },
    { id: 'hard', labelFr: 'Avancé', labelKr: 'Apwofondi' },
  ];

  // Start a new dynamic quiz session
  const startQuiz = () => {
    const list = quizService.getQuestionsSession({
      category: selectedCategory,
      difficulty: selectedDifficulty,
      count: questionCount,
    });
    setQuestions(list);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setSessionScore(0);
    setSessionStreak(0);
    setUserAnswers([]);
    setGameState('playing');
  };

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
    setIsAnswered(true);

    const currentQ = questions[currentIndex];
    const isCorrect = index === currentQ.correctIndex;

    if (isCorrect) {
      setSessionScore(prev => prev + 1);
      setSessionStreak(prev => prev + 1);
    } else {
      setSessionStreak(0);
    }

    // Save to user history
    setUserAnswers(prev => [...prev, { question: currentQ, chosenIndex: index, isCorrect }]);

    // Update global persistent stats
    const updatedStats = quizService.recordAnswer(isCorrect, currentQ.category);
    setStats(updatedStats);
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setGameState('completed');
    }
  };

  // Open Bible quick preview
  const handleOpenVersePreview = async (q: QuizQuestion) => {
    if (!q.bookId) return;
    setLoadingPreview(true);
    try {
      const chData = await bibleService.getChapitre(q.bookId, 1);
      // Look for passage verse or first verse
      const v = chData.verses[0];
      setPreviewVerse({
        ref: isKr ? q.referenceKr : q.referenceFr,
        textFr: q.explanationFr,
        textKr: q.explanationKr,
      });
    } catch {
      setPreviewVerse({
        ref: isKr ? q.referenceKr : q.referenceFr,
        textFr: q.explanationFr,
        textKr: q.explanationKr,
      });
    } finally {
      setLoadingPreview(false);
    }
  };

  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-3xl mx-auto px-4 pb-24 pt-2 space-y-4">
      {/* Top Header with Back Button */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={onBack}
          className="px-3.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-semibold text-xs flex items-center gap-2 transition active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-amber-500" />
          <span>{isKr ? '← Tounen nan Akèy' : '← Retour à l\'Accueil'}</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs">
            <Trophy className="w-3.5 h-3.5" />
            <span>{stats.correctCount} {isKr ? 'repons' : 'pts'}</span>
          </div>
          {stats.bestStreak > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-500/10 text-rose-500 font-bold text-xs">
              <Flame className="w-3.5 h-3.5 fill-rose-500" />
              <span>{stats.bestStreak} max</span>
            </div>
          )}
        </div>
      </div>

      {/* 1. SETUP SCREEN: Choose Books, Categories & Questions count */}
      {gameState === 'setup' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#12263F] via-[#0E2036] to-[#0A1626] p-6 text-white border border-amber-500/30 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 text-2xl">
                🧠
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold uppercase tracking-wider">
                  {isKr ? 'Antrènman & Konesans Biblik' : 'Entraînement Biblique Dynamique'}
                </span>
                <h2 className="text-xl font-cinzel font-bold text-white mt-1">
                  {isKr ? 'Etidye & Teste Konesans Ou nan Labib' : 'Testez et Approfondissez votre Foi'}
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  {isKr
                    ? 'Kesyon dinamik sou tout 66 liv yo, avèk eksplikasyon pwofesè a ak vèsè an kreyòl e franse pou w grandi nan Pawòl la.'
                    : 'Questions renouvelées sur les 66 livres de la Bible, avec explications doctrinales et textes parallèles FR/KR.'}
                </p>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0D1C30] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-amber-500" />
              <span>{isKr ? 'Chwazi Pati oswa Liv Biblik la' : 'Choisir la Section ou les Livres'}</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`p-2.5 rounded-xl text-left border transition flex items-center gap-2.5 ${
                    selectedCategory === c.id
                      ? 'bg-amber-500/15 border-amber-500/60 text-slate-900 dark:text-white font-bold ring-2 ring-amber-500/20'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:border-slate-400'
                  }`}
                >
                  <span className="text-base">{c.icon}</span>
                  <span className="text-xs truncate">{isKr ? c.labelKr : c.labelFr}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty & Count */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Difficulty */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0D1C30] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {isKr ? 'Nivo Difikilte' : 'Niveau de Difficulté'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {difficulties.map(d => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDifficulty(d.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition ${
                      selectedDifficulty === d.id
                        ? 'bg-amber-500 text-slate-950 font-bold border-amber-500 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {isKr ? d.labelKr : d.labelFr}
                  </button>
                ))}
              </div>
            </div>

            {/* Questions count */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0D1C30] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {isKr ? 'Kantite Kesyon pou Sesyon an' : 'Nombre de Questions'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[5, 10, 20].map(cnt => (
                  <button
                    key={cnt}
                    onClick={() => setQuestionCount(cnt)}
                    className={`py-2 rounded-xl text-xs font-bold border text-center transition ${
                      questionCount === cnt
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {cnt} {isKr ? 'kesyon' : 'questions'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Start Quiz Action */}
          <button
            onClick={startQuiz}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:brightness-110 active:scale-[0.99] transition"
          >
            <Sparkles className="w-5 h-5 fill-slate-950" />
            <span>{isKr ? 'Kòmanse Antrènman Biblik la' : 'Commencer l\'Entraînement'}</span>
          </button>
        </div>
      )}

      {/* 2. PLAYING SCREEN */}
      {gameState === 'playing' && currentQ && (
        <div className="space-y-4 animate-fadeIn">
          {/* Progress & Live Streak */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 px-1">
            <span>
              {isKr ? 'Kesyon' : 'Question'} {currentIndex + 1} / {questions.length}
            </span>
            <div className="flex items-center gap-3">
              {sessionStreak > 1 && (
                <span className="flex items-center gap-1 text-rose-500 animate-pulse">
                  <Flame className="w-3.5 h-3.5 fill-rose-500" />
                  <span>{sessionStreak} {isKr ? 'an liy !' : 'd\'affilée !'}</span>
                </span>
              )}
              <span className="text-amber-500 font-bold">
                {isKr ? 'Pwen' : 'Score'} : {sessionScore}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question Box */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#0D1C30] border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[11px] uppercase tracking-wider">
                {isKr ? currentQ.referenceKr : currentQ.referenceFr}
              </span>
              <span className="text-[11px] font-semibold text-slate-400">
                {currentQ.difficulty === 'easy'
                  ? isKr ? 'Debutan' : 'Facile'
                  : currentQ.difficulty === 'medium'
                  ? isKr ? 'Mwayen' : 'Moyen'
                  : isKr ? 'Apwofondi' : 'Difficile'}
              </span>
            </div>

            {/* Question Text in BOTH French and Haitian Creole */}
            <div className="space-y-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                {currentQ.questionFr}
              </h3>
              <p className="text-sm font-medium text-amber-700 dark:text-amber-300/90 italic bg-amber-500/5 p-2.5 rounded-xl border border-amber-500/10">
                « {currentQ.questionKr} »
              </p>
            </div>

            {/* 4 Multiple Choice Options */}
            <div className="space-y-2.5 pt-2">
              {currentQ.optionsFr.map((optFr, idx) => {
                const optKr = currentQ.optionsKr[idx] || optFr;
                const isSelected = selectedAnswer === idx;
                const isCorrect = idx === currentQ.correctIndex;

                let btnStyle = 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 hover:border-amber-500/50';

                if (isAnswered) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-500/15 border-emerald-500 text-emerald-800 dark:text-emerald-200 ring-2 ring-emerald-500/30';
                  } else if (isSelected) {
                    btnStyle = 'bg-rose-500/15 border-rose-500 text-rose-800 dark:text-rose-200 ring-2 ring-rose-500/30';
                  } else {
                    btnStyle = 'opacity-40 bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full p-3.5 rounded-2xl border text-left transition flex items-center justify-between gap-3 ${btnStyle}`}
                  >
                    <div className="space-y-0.5 flex-1">
                      <div className="text-xs sm:text-sm font-semibold">{optFr}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                        {optKr}
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isAnswered && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      )}
                      {isAnswered && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-rose-500" />
                      )}
                      {!isAnswered && (
                        <div className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-[10px] font-bold text-slate-400">
                          {String.fromCharCode(65 + idx)}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Answer Explanation & Scripture Reference */}
            {isAnswered && (
              <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 space-y-3 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-500" />
                  <span className="font-bold text-xs uppercase tracking-wider text-amber-800 dark:text-amber-300">
                    {isKr ? 'Eksplikasyon Pwofesè a & Ansèyman' : 'Explication Théologique du Professeur'}
                  </span>
                </div>

                <div className="text-xs text-slate-800 dark:text-slate-200 space-y-1.5 leading-relaxed">
                  <p>{currentQ.explanationFr}</p>
                  <p className="text-amber-800 dark:text-amber-300/90 italic font-medium">
                    « {currentQ.explanationKr} »
                  </p>
                </div>

                <div className="pt-1 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleOpenVersePreview(currentQ)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{isKr ? 'Gade Vèsè a an Kreyòl & Franse' : 'Consulter le Verset en FR & KR'}</span>
                  </button>

                  {onNavigateToBible && currentQ.bookId && (
                    <button
                      onClick={() => onNavigateToBible(currentQ.bookId, 1)}
                      className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isKr ? 'Li Chapit la' : 'Ouvrir dans la Bible'}</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Next Button */}
          {isAnswered && (
            <button
              onClick={handleNextQuestion}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:brightness-110 active:scale-[0.99] transition"
            >
              <span>
                {currentIndex + 1 < questions.length
                  ? isKr ? 'Kesyon Swivan an' : 'Question Suivante'
                  : isKr ? 'Wè Rezilta Sesyon an' : 'Voir les Résultats'}
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* 3. COMPLETED SCREEN */}
      {gameState === 'completed' && (
        <div className="space-y-5 animate-fadeIn">
          <div className="text-center p-8 rounded-3xl bg-white dark:bg-[#0D1C30] border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/20 text-amber-500 flex items-center justify-center text-3xl">
              {sessionScore >= questions.length * 0.8 ? '🏆' : sessionScore >= questions.length * 0.5 ? '👏' : '🌱'}
            </div>

            <div>
              <h2 className="text-2xl font-cinzel font-bold text-slate-900 dark:text-white">
                {isKr ? 'Felisitasyon pou Antrènman an !' : 'Entraînement Terminé !'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isKr
                  ? 'Chak fwa ou etidye Pawòl la, se yon grenn ou simen nan kè ou.'
                  : 'Chaque temps passé à scruter l\'Écriture fortifie votre homme intérieur.'}
              </p>
            </div>

            {/* Score Ring / Pill */}
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300">
              <Award className="w-6 h-6 text-amber-500" />
              <div className="text-left">
                <div className="text-2xl font-bold font-mono">
                  {sessionScore} / {questions.length}
                </div>
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  {Math.round((sessionScore / questions.length) * 100)}% {isKr ? 'bon repons' : 'de réussite'}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <button
                onClick={startQuiz}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:brightness-110 active:scale-95 transition"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{isKr ? 'Refè yon Lòt Seri Kesyon Dinamik' : 'Nouvelle Série de Questions'}</span>
              </button>

              <button
                onClick={() => setGameState('setup')}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                <Filter className="w-4 h-4" />
                <span>{isKr ? 'Chanje Liv oswa Nivo' : 'Changer de Livres ou Niveau'}</span>
              </button>
            </div>
          </div>

          {/* Review of questions answered */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0D1C30] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isKr ? 'Revizyon Kesyon Sesyon an' : 'Récapitulatif des Questions'}
            </h3>

            <div className="space-y-2">
              {userAnswers.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                    item.isCorrect
                      ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                      : 'bg-rose-500/5 border-rose-500/30 text-rose-900 dark:text-rose-200'
                  }`}
                >
                  <div className="mt-0.5">
                    {item.isCorrect ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="font-bold">
                      {isKr ? item.question.referenceKr : item.question.referenceFr} : {item.question.questionFr}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {isKr ? 'Bon repons :' : 'Réponse exacte :'} <span className="font-semibold text-slate-800 dark:text-slate-100">{item.question.optionsFr[item.question.correctIndex]}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Scripture Preview Modal */}
      {previewVerse && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-white dark:bg-[#0D1C30] border border-amber-500/30 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-amber-500">
                <BookOpen className="w-5 h-5" />
                <h4 className="font-cinzel font-bold text-sm text-slate-900 dark:text-white">
                  {previewVerse.ref}
                </h4>
              </div>
              <button
                onClick={() => setPreviewVerse(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Français (Louis Segond 1910)
                </span>
                <p className="text-xs text-slate-800 dark:text-slate-200 mt-1">
                  {previewVerse.textFr}
                </p>
              </div>

              {previewVerse.textKr && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    Kreyòl Ayisyen
                  </span>
                  <p className="text-xs text-amber-950 dark:text-amber-200 mt-1 italic font-medium">
                    « {previewVerse.textKr} »
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => setPreviewVerse(null)}
              className="w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
            >
              {isKr ? 'Fèmen' : 'Compris'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
