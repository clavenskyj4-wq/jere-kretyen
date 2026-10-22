export type Language = 'fr' | 'kr';

export type Testament = 'AT' | 'NT';

export type BibleBookCategory = 
  | 'pentateuque'
  | 'historique'
  | 'poetique'
  | 'grands_prophetes'
  | 'petits_prophetes'
  | 'evangiles'
  | 'actes'
  | 'epitres_paul'
  | 'epitres_generales'
  | 'apocalypse';

export interface BibleBook {
  id: string; // e.g., 'GEN', 'JHN', 'PSA'
  number: number;
  nameFr: string;
  nameKr: string;
  shortNameFr: string;
  shortNameKr: string;
  testament: Testament;
  chaptersCount: number;
  category: BibleBookCategory;
}

export interface Verse {
  verse: number;
  text: string;
  textKr?: string;
}

export interface ChapterData {
  bookId: string;
  chapter: number;
  verses: Verse[];
  translation: string; // 'LSG1910'
}

export interface VerseHighlight {
  id: string;
  bookId: string;
  chapter: number;
  verse: number;
  color: 'gold' | 'emerald' | 'azure' | 'rose';
  updatedAt: number;
}

export interface VerseNote {
  id: string;
  bookId: string;
  chapter: number;
  verse: number;
  text: string;
  updatedAt: number;
}

export interface Bookmark {
  bookId: string;
  chapter: number;
  verse?: number;
  timestamp: number;
}

export interface DailyVerse {
  id: string;
  referenceFr: string;
  referenceKr: string;
  bookId: string;
  chapter: number;
  verse: number;
  textFr: string;
  textKr: string;
  themeFr: string;
  themeKr: string;
}

export interface ReadingPlan {
  id: 'year' | 'nt90' | 'psalms_proverbs';
  titleFr: string;
  titleKr: string;
  descFr: string;
  descKr: string;
  durationDays: number;
  items: ReadingPlanDay[];
}

export interface ReadingPlanDay {
  day: number;
  labelFr: string;
  labelKr: string;
  passages: {
    bookId: string;
    chapter: number;
  }[];
}

export type HymnalSection =
  | 'CE_FR' // Chants d'Espérance Français
  | 'CE_KR' // Chants d'Espérance Créole
  | 'MELODIES_FR' // Mélodies Joyeuses Français
  | 'MELODIES_KR' // Mélodies Joyeuses Créole
  | 'REVEILLONS_NOUS' // Réveillons-Nous
  | 'VOIX_DU_REVEIL' // La Voix du Réveil
  | 'HAITI_CHANTE' // Haïti Chante avec Radio Lumière
  | 'NOUVO_KE'; // Nouvo Kè & Chœurs

export type SongCategory = 
  | 'louange' 
  | 'adoration' 
  | 'consecration' 
  | 'foi' 
  | 'esperance' 
  | 'priere'
  | 'combat_spirituel'
  | 'noel' 
  | 'paques' 
  | 'enfants';

export interface SongVerseItem {
  number: number;
  text: string[];
}

export interface Song {
  id: string;
  number: number;
  title: string;
  titleKr?: string;
  section: string;
  sectionCode: HymnalSection;
  author?: string;
  category: SongCategory;
  copyrightStatus: 'Domaine public' | 'Autorisé';
  verses: SongVerseItem[];
  chorus?: string[];
  keySignature?: string;
  tempo?: string;
}

export interface WorshipList {
  id: string;
  title: string;
  description?: string;
  date?: string;
  songIds: string[];
  createdAt: number;
  updatedAt: number;
}

export interface UserProfile {
  name: string;
  email?: string;
  isGuest: boolean;
  avatar: string;
  memberSince: number;
  cloudSyncEnabled: boolean;
  lastSongId?: string;
}

// === Bible Quiz & Training Types ===
export type QuizDifficulty = 'all' | 'easy' | 'medium' | 'hard';

export type QuizCategory = 
  | 'all'
  | 'pentateuque'
  | 'histoire'
  | 'psaumes_sagesse'
  | 'prophetes'
  | 'evangiles'
  | 'actes_epitres'
  | 'apocalypse'
  | 'doctrines_personnages'
  | 'historique_livres';

export interface QuizQuestion {
  id: string;
  category: QuizCategory;
  difficulty: 'easy' | 'medium' | 'hard';
  bookId?: string;
  bookNameFr?: string;
  bookNameKr?: string;
  referenceFr: string;
  referenceKr: string;
  passageFr?: string;
  passageKr?: string;
  questionFr: string;
  questionKr: string;
  optionsFr: string[];
  optionsKr: string[];
  correctIndex: number;
  explanationFr: string;
  explanationKr: string;
}

export interface QuizSessionStats {
  totalAnswered: number;
  correctCount: number;
  bestStreak: number;
  currentStreak: number;
  completedCategories: string[];
  lastPlayed: number;
}

// === Homiletics & Meditation Workshop Types ===
export type SermonType = 'expositif' | 'thematique' | 'biographique' | 'meditation';

export interface SermonPoint {
  id: string;
  title: string;
  scriptureRef: string;
  explanation: string;
  illustration: string;
  application: string;
}

export interface SermonDraft {
  id: string;
  title: string;
  theme: string;
  type: SermonType;
  primaryPassage: {
    bookId: string;
    chapter: number;
    verseStart?: number;
    verseEnd?: number;
    referenceText: string;
  };
  audience?: string;
  bigIdea: string; // Thèse centrale en une phrase
  introduction: {
    hook: string; // Accroche
    needOrProblem: string; // Le problème
    context: string; // Contexte historique & littéraire
  };
  observationNotes: {
    who: string;
    whereWhen: string;
    keywords: string;
    keyThemes: string;
  };
  interpretationNotes: {
    originalMeaning: string;
    theologicalTruth: string;
    crossReferences: string;
  };
  points: SermonPoint[];
  conclusion: {
    summary: string;
    callToAction: string; // Apèl / Décision
    prayer: string; // Prière
  };
  evaluation: {
    biblicalFaithfulness: boolean;
    clearCentralIdea: boolean;
    practicalApplication: boolean;
    gospelCentered: boolean;
    timeTarget: string; // e.g., '20-25 min'
    notes: string;
  };
  createdAt: number;
  updatedAt: number;
}

