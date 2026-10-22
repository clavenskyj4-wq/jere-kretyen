import { BibleBook } from '../types';

export const BIBLE_BOOKS: BibleBook[] = [
  // --- ANCIEN TESTAMENT (39 Livres) ---
  // Pentateuque (Lalwa)
  { id: 'GEN', number: 1, nameFr: 'Genèse', nameKr: 'Jenèz', shortNameFr: 'Gen', shortNameKr: 'Jen', testament: 'AT', chaptersCount: 50, category: 'pentateuque' },
  { id: 'EXO', number: 2, nameFr: 'Exode', nameKr: 'Egzòd', shortNameFr: 'Exo', shortNameKr: 'Egz', testament: 'AT', chaptersCount: 40, category: 'pentateuque' },
  { id: 'LEV', number: 3, nameFr: 'Lévitique', nameKr: 'Levitik', shortNameFr: 'Lév', shortNameKr: 'Lev', testament: 'AT', chaptersCount: 27, category: 'pentateuque' },
  { id: 'NUM', number: 4, nameFr: 'Nombres', nameKr: 'Nonb', shortNameFr: 'Nom', shortNameKr: 'Non', testament: 'AT', chaptersCount: 36, category: 'pentateuque' },
  { id: 'DEU', number: 5, nameFr: 'Deutéronome', nameKr: 'Deteronòm', shortNameFr: 'Deu', shortNameKr: 'Det', testament: 'AT', chaptersCount: 34, category: 'pentateuque' },
  
  // Livres historiques (Istwa)
  { id: 'JOS', number: 6, nameFr: 'Josué', nameKr: 'Jozye', shortNameFr: 'Jos', shortNameKr: 'Joz', testament: 'AT', chaptersCount: 24, category: 'historique' },
  { id: 'JDG', number: 7, nameFr: 'Juges', nameKr: 'Jij', shortNameFr: 'Jug', shortNameKr: 'Jij', testament: 'AT', chaptersCount: 21, category: 'historique' },
  { id: 'RUT', number: 8, nameFr: 'Ruth', nameKr: 'Rit', shortNameFr: 'Rut', shortNameKr: 'Rit', testament: 'AT', chaptersCount: 4, category: 'historique' },
  { id: '1SA', number: 9, nameFr: '1 Samuel', nameKr: '1 Samyèl', shortNameFr: '1Sa', shortNameKr: '1Sa', testament: 'AT', chaptersCount: 31, category: 'historique' },
  { id: '2SA', number: 10, nameFr: '2 Samuel', nameKr: '2 Samyèl', shortNameFr: '2Sa', shortNameKr: '2Sa', testament: 'AT', chaptersCount: 24, category: 'historique' },
  { id: '1KI', number: 11, nameFr: '1 Rois', nameKr: '1 Wa', shortNameFr: '1Ro', shortNameKr: '1Wa', testament: 'AT', chaptersCount: 22, category: 'historique' },
  { id: '2KI', number: 12, nameFr: '2 Rois', nameKr: '2 Wa', shortNameFr: '2Ro', shortNameKr: '2Wa', testament: 'AT', chaptersCount: 25, category: 'historique' },
  { id: '1CH', number: 13, nameFr: '1 Chroniques', nameKr: '1 Kwonik', shortNameFr: '1Ch', shortNameKr: '1Kw', testament: 'AT', chaptersCount: 29, category: 'historique' },
  { id: '2CH', number: 14, nameFr: '2 Chroniques', nameKr: '2 Kwonik', shortNameFr: '2Ch', shortNameKr: '2Kw', testament: 'AT', chaptersCount: 36, category: 'historique' },
  { id: 'EZR', number: 15, nameFr: 'Esdras', nameKr: 'Esdras', shortNameFr: 'Esd', shortNameKr: 'Esd', testament: 'AT', chaptersCount: 10, category: 'historique' },
  { id: 'NEH', number: 16, nameFr: 'Néhémie', nameKr: 'Neemi', shortNameFr: 'Néh', shortNameKr: 'Nee', testament: 'AT', chaptersCount: 13, category: 'historique' },
  { id: 'EST', number: 17, nameFr: 'Esther', nameKr: 'Estè', shortNameFr: 'Est', shortNameKr: 'Est', testament: 'AT', chaptersCount: 10, category: 'historique' },
  
  // Poétiques et Sagesse (Pwezi & Sajès)
  { id: 'JOB', number: 18, nameFr: 'Job', nameKr: 'Jòb', shortNameFr: 'Job', shortNameKr: 'Jòb', testament: 'AT', chaptersCount: 42, category: 'poetique' },
  { id: 'PSA', number: 19, nameFr: 'Psaumes', nameKr: 'Sòm', shortNameFr: 'Psa', shortNameKr: 'Sòm', testament: 'AT', chaptersCount: 150, category: 'poetique' },
  { id: 'PRO', number: 20, nameFr: 'Proverbes', nameKr: 'Pwovèb', shortNameFr: 'Pro', shortNameKr: 'Pwo', testament: 'AT', chaptersCount: 31, category: 'poetique' },
  { id: 'ECC', number: 21, nameFr: 'Ecclésiaste', nameKr: 'Eklezyas', shortNameFr: 'Ecc', shortNameKr: 'Ekl', testament: 'AT', chaptersCount: 12, category: 'poetique' },
  { id: 'SNG', number: 22, nameFr: 'Cantique des Cantiques', nameKr: 'Chante Salomon', shortNameFr: 'Ct', shortNameKr: 'ChS', testament: 'AT', chaptersCount: 8, category: 'poetique' },
  
  // Grands Prophètes (Gwo Pwofèt)
  { id: 'ISA', number: 23, nameFr: 'Ésaïe', nameKr: 'Ezayi', shortNameFr: 'Ésa', shortNameKr: 'Eza', testament: 'AT', chaptersCount: 66, category: 'grands_prophetes' },
  { id: 'JER', number: 24, nameFr: 'Jérémie', nameKr: 'Jeremi', shortNameFr: 'Jér', shortNameKr: 'Jer', testament: 'AT', chaptersCount: 52, category: 'grands_prophetes' },
  { id: 'LAM', number: 25, nameFr: 'Lamentations', nameKr: 'Plenn', shortNameFr: 'Lam', shortNameKr: 'Ple', testament: 'AT', chaptersCount: 5, category: 'grands_prophetes' },
  { id: 'EZK', number: 26, nameFr: 'Ézéchiel', nameKr: 'Ezekyèl', shortNameFr: 'Ézé', shortNameKr: 'Eze', testament: 'AT', chaptersCount: 48, category: 'grands_prophetes' },
  { id: 'DAN', number: 27, nameFr: 'Daniel', nameKr: 'Danyèl', shortNameFr: 'Dan', shortNameKr: 'Dan', testament: 'AT', chaptersCount: 12, category: 'grands_prophetes' },
  
  // Petits Prophètes (Ti Pwofèt)
  { id: 'HOS', number: 28, nameFr: 'Osée', nameKr: 'Oze', shortNameFr: 'Osé', shortNameKr: 'Oze', testament: 'AT', chaptersCount: 14, category: 'petits_prophetes' },
  { id: 'JOL', number: 29, nameFr: 'Joël', nameKr: 'Jowèl', shortNameFr: 'Joë', shortNameKr: 'Jow', testament: 'AT', chaptersCount: 3, category: 'petits_prophetes' },
  { id: 'AMO', number: 30, nameFr: 'Amos', nameKr: 'Amòs', shortNameFr: 'Amo', shortNameKr: 'Amò', testament: 'AT', chaptersCount: 9, category: 'petits_prophetes' },
  { id: 'OBD', number: 31, nameFr: 'Abdias', nameKr: 'Abdyas', shortNameFr: 'Abd', shortNameKr: 'Abd', testament: 'AT', chaptersCount: 1, category: 'petits_prophetes' },
  { id: 'JON', number: 32, nameFr: 'Jonas', nameKr: 'Jonas', shortNameFr: 'Jon', shortNameKr: 'Jon', testament: 'AT', chaptersCount: 4, category: 'petits_prophetes' },
  { id: 'MIC', number: 33, nameFr: 'Michée', nameKr: 'Miche', shortNameFr: 'Mic', shortNameKr: 'Mic', testament: 'AT', chaptersCount: 7, category: 'petits_prophetes' },
  { id: 'NAM', number: 34, nameFr: 'Nahum', nameKr: 'Nawoum', shortNameFr: 'Nah', shortNameKr: 'Naw', testament: 'AT', chaptersCount: 3, category: 'petits_prophetes' },
  { id: 'HAB', number: 35, nameFr: 'Habacuc', nameKr: 'Abakik', shortNameFr: 'Hab', shortNameKr: 'Aba', testament: 'AT', chaptersCount: 3, category: 'petits_prophetes' },
  { id: 'ZEP', number: 36, nameFr: 'Sophonie', nameKr: 'Sofoni', shortNameFr: 'Sop', shortNameKr: 'Sof', testament: 'AT', chaptersCount: 3, category: 'petits_prophetes' },
  { id: 'HAG', number: 37, nameFr: 'Aggée', nameKr: 'Aje', shortNameFr: 'Agg', shortNameKr: 'Aje', testament: 'AT', chaptersCount: 2, category: 'petits_prophetes' },
  { id: 'ZEC', number: 38, nameFr: 'Zacharie', nameKr: 'Zakari', shortNameFr: 'Zac', shortNameKr: 'Zak', testament: 'AT', chaptersCount: 14, category: 'petits_prophetes' },
  { id: 'MAL', number: 39, nameFr: 'Malachie', nameKr: 'Malachi', shortNameFr: 'Mal', shortNameKr: 'Mal', testament: 'AT', chaptersCount: 4, category: 'petits_prophetes' },
  
  // --- NOUVEAU TESTAMENT (27 Livres) ---
  // Évangiles (Evanjil)
  { id: 'MAT', number: 40, nameFr: 'Matthieu', nameKr: 'Matye', shortNameFr: 'Mat', shortNameKr: 'Mat', testament: 'NT', chaptersCount: 28, category: 'evangiles' },
  { id: 'MRK', number: 41, nameFr: 'Marc', nameKr: 'Mak', shortNameFr: 'Mar', shortNameKr: 'Mak', testament: 'NT', chaptersCount: 16, category: 'evangiles' },
  { id: 'LUK', number: 42, nameFr: 'Luc', nameKr: 'Lik', shortNameFr: 'Luc', shortNameKr: 'Lik', testament: 'NT', chaptersCount: 24, category: 'evangiles' },
  { id: 'JHN', number: 43, nameFr: 'Jean', nameKr: 'Jan', shortNameFr: 'Jean', shortNameKr: 'Jan', testament: 'NT', chaptersCount: 21, category: 'evangiles' },
  
  // Actes des Apôtres (Travay Apòt yo)
  { id: 'ACT', number: 44, nameFr: 'Actes', nameKr: 'Travay Apòt yo', shortNameFr: 'Act', shortNameKr: 'Tra', testament: 'NT', chaptersCount: 28, category: 'actes' },
  
  // Épîtres de Paul (Lèt Pòl yo)
  { id: 'ROM', number: 45, nameFr: 'Romains', nameKr: 'Women', shortNameFr: 'Rom', shortNameKr: 'Wom', testament: 'NT', chaptersCount: 16, category: 'epitres_paul' },
  { id: '1CO', number: 46, nameFr: '1 Corinthiens', nameKr: '1 Korent', shortNameFr: '1Co', shortNameKr: '1Ko', testament: 'NT', chaptersCount: 16, category: 'epitres_paul' },
  { id: '2CO', number: 47, nameFr: '2 Corinthiens', nameKr: '2 Korent', shortNameFr: '2Co', shortNameKr: '2Ko', testament: 'NT', chaptersCount: 13, category: 'epitres_paul' },
  { id: 'GAL', number: 48, nameFr: 'Galates', nameKr: 'Galat', shortNameFr: 'Gal', shortNameKr: 'Gal', testament: 'NT', chaptersCount: 6, category: 'epitres_paul' },
  { id: 'EPH', number: 49, nameFr: 'Éphésiens', nameKr: 'Efez', shortNameFr: 'Éph', shortNameKr: 'Efe', testament: 'NT', chaptersCount: 6, category: 'epitres_paul' },
  { id: 'PHP', number: 50, nameFr: 'Philippiens', nameKr: 'Filip', shortNameFr: 'Phl', shortNameKr: 'Fil', testament: 'NT', chaptersCount: 4, category: 'epitres_paul' },
  { id: 'COL', number: 51, nameFr: 'Colossiens', nameKr: 'Kolòs', shortNameFr: 'Col', shortNameKr: 'Kol', testament: 'NT', chaptersCount: 4, category: 'epitres_paul' },
  { id: '1TH', number: 52, nameFr: '1 Thessaloniciens', nameKr: '1 Tesalonik', shortNameFr: '1Th', shortNameKr: '1Te', testament: 'NT', chaptersCount: 5, category: 'epitres_paul' },
  { id: '2TH', number: 53, nameFr: '2 Thessaloniciens', nameKr: '2 Tesalonik', shortNameFr: '2Th', shortNameKr: '2Te', testament: 'NT', chaptersCount: 3, category: 'epitres_paul' },
  { id: '1TI', number: 54, nameFr: '1 Timothée', nameKr: '1 Timote', shortNameFr: '1Ti', shortNameKr: '1Ti', testament: 'NT', chaptersCount: 6, category: 'epitres_paul' },
  { id: '2TI', number: 55, nameFr: '2 Timothée', nameKr: '2 Timote', shortNameFr: '2Ti', shortNameKr: '2Ti', testament: 'NT', chaptersCount: 4, category: 'epitres_paul' },
  { id: 'TIT', number: 56, nameFr: 'Tite', nameKr: 'Tit', shortNameFr: 'Tit', shortNameKr: 'Tit', testament: 'NT', chaptersCount: 3, category: 'epitres_paul' },
  { id: 'PHM', number: 57, nameFr: 'Philémon', nameKr: 'Filemon', shortNameFr: 'Phm', shortNameKr: 'Fil', testament: 'NT', chaptersCount: 1, category: 'epitres_paul' },
  
  // Épîtres Générales (Lèt Jeneral)
  { id: 'HEB', number: 58, nameFr: 'Hébreux', nameKr: 'Ebre', shortNameFr: 'Héb', shortNameKr: 'Ebr', testament: 'NT', chaptersCount: 13, category: 'epitres_generales' },
  { id: 'JAS', number: 59, nameFr: 'Jacques', nameKr: 'Jak', shortNameFr: 'Jac', shortNameKr: 'Jak', testament: 'NT', chaptersCount: 5, category: 'epitres_generales' },
  { id: '1PE', number: 60, nameFr: '1 Pierre', nameKr: '1 Pyè', shortNameFr: '1Pi', shortNameKr: '1Py', testament: 'NT', chaptersCount: 5, category: 'epitres_generales' },
  { id: '2PE', number: 61, nameFr: '2 Pierre', nameKr: '2 Pyè', shortNameFr: '2Pi', shortNameKr: '2Py', testament: 'NT', chaptersCount: 3, category: 'epitres_generales' },
  { id: '1JN', number: 62, nameFr: '1 Jean', nameKr: '1 Jan', shortNameFr: '1Jn', shortNameKr: '1Jan', testament: 'NT', chaptersCount: 5, category: 'epitres_generales' },
  { id: '2JN', number: 63, nameFr: '2 Jean', nameKr: '2 Jan', shortNameFr: '2Jn', shortNameKr: '2Jan', testament: 'NT', chaptersCount: 1, category: 'epitres_generales' },
  { id: '3JN', number: 64, nameFr: '3 Jean', nameKr: '3 Jan', shortNameFr: '3Jn', shortNameKr: '3Jan', testament: 'NT', chaptersCount: 1, category: 'epitres_generales' },
  { id: 'JUD', number: 65, nameFr: 'Jude', nameKr: 'Jid', shortNameFr: 'Jud', shortNameKr: 'Jid', testament: 'NT', chaptersCount: 1, category: 'epitres_generales' },
  
  // Révélation / Prophétie (Revelasyon)
  { id: 'REV', number: 66, nameFr: 'Apocalypse', nameKr: 'Revelasyon', shortNameFr: 'Apo', shortNameKr: 'Rev', testament: 'NT', chaptersCount: 22, category: 'apocalypse' },
];

export const CATEGORY_LABELS: Record<string, { fr: string; kr: string }> = {
  pentateuque: { fr: 'Pentateuque (La Loi)', kr: 'Lalwa (5 liv Moyiz yo)' },
  historique: { fr: 'Livres Historiques', kr: 'Liv Istwa yo' },
  poetique: { fr: 'Livres Poétiques & Sagesse', kr: 'Liv Pwezi & Sajès' },
  grands_prophetes: { fr: 'Grands Prophètes', kr: 'Gwo Pwofèt yo' },
  petits_prophetes: { fr: 'Petits Prophètes', kr: 'Ti Pwofèt yo' },
  evangiles: { fr: 'Évangiles', kr: 'Evanjil yo' },
  actes: { fr: 'Actes des Apôtres', kr: 'Travay Apòt yo' },
  epitres_paul: { fr: 'Épîtres de Paul', kr: 'Lèt Pòl yo' },
  epitres_generales: { fr: 'Épîtres Générales', kr: 'Lèt Jeneral yo' },
  apocalypse: { fr: 'Révélation / Prophétie', kr: 'Revelasyon / Pwofesi' },
};
