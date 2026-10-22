import { ReadingPlan } from '../types';

export const READING_PLANS: ReadingPlan[] = [
  {
    id: 'year',
    titleFr: 'Bible en un an',
    titleKr: 'Labib nan yon ane',
    descFr: 'Parcourez toute la Parole de Dieu de la Genèse à l\'Apocalypse en 365 jours.',
    descKr: 'Li tout Pawòl Bondye a depi Jenèz rive nan Revelasyon nan 365 jou.',
    durationDays: 365,
    items: [
      { day: 1, labelFr: 'Genèse 1-3 & Matthieu 1', labelKr: 'Jenèz 1-3 & Matye 1', passages: [{ bookId: 'GEN', chapter: 1 }, { bookId: 'MAT', chapter: 1 }] },
      { day: 2, labelFr: 'Genèse 4-6 & Matthieu 2', labelKr: 'Jenèz 4-6 & Matye 2', passages: [{ bookId: 'GEN', chapter: 4 }, { bookId: 'MAT', chapter: 2 }] },
      { day: 3, labelFr: 'Genèse 7-9 & Matthieu 3', labelKr: 'Jenèz 7-9 & Matye 3', passages: [{ bookId: 'GEN', chapter: 7 }, { bookId: 'MAT', chapter: 3 }] },
      { day: 4, labelFr: 'Genèse 10-12 & Matthieu 4', labelKr: 'Jenèz 10-12 & Matye 4', passages: [{ bookId: 'GEN', chapter: 10 }, { bookId: 'MAT', chapter: 4 }] },
      { day: 5, labelFr: 'Genèse 13-15 & Matthieu 5', labelKr: 'Jenèz 13-15 & Matye 5', passages: [{ bookId: 'GEN', chapter: 13 }, { bookId: 'MAT', chapter: 5 }] },
      { day: 6, labelFr: 'Genèse 16-18 & Matthieu 6', labelKr: 'Jenèz 16-18 & Matye 6', passages: [{ bookId: 'GEN', chapter: 16 }, { bookId: 'MAT', chapter: 6 }] },
      { day: 7, labelFr: 'Genèse 19-21 & Matthieu 7', labelKr: 'Jenèz 19-21 & Matye 7', passages: [{ bookId: 'GEN', chapter: 19 }, { bookId: 'MAT', chapter: 7 }] },
      { day: 8, labelFr: 'Genèse 22-24 & Matthieu 8', labelKr: 'Jenèz 22-24 & Matye 8', passages: [{ bookId: 'GEN', chapter: 22 }, { bookId: 'MAT', chapter: 8 }] },
    ]
  },
  {
    id: 'nt90',
    titleFr: 'Nouveau Testament en 90 jours',
    titleKr: 'Nouvo Testaman nan 90 jou',
    descFr: '3 chapitres par jour pour vous immerger dans les paroles et les actes de Jésus et des Apôtres.',
    descKr: '3 chapit chak jou pou nou antre fon nan pawòl ak aksyon Jezi ansanm ak Apòt yo.',
    durationDays: 90,
    items: [
      { day: 1, labelFr: 'Matthieu 1 à 3', labelKr: 'Matye 1 rive 3', passages: [{ bookId: 'MAT', chapter: 1 }] },
      { day: 2, labelFr: 'Matthieu 4 à 6', labelKr: 'Matye 4 rive 6', passages: [{ bookId: 'MAT', chapter: 5 }] },
      { day: 3, labelFr: 'Matthieu 7 à 9', labelKr: 'Matye 7 rive 9', passages: [{ bookId: 'MAT', chapter: 7 }] },
      { day: 4, labelFr: 'Matthieu 10 à 12', labelKr: 'Matye 10 rive 12', passages: [{ bookId: 'MAT', chapter: 10 }] },
      { day: 5, labelFr: 'Jean 1 à 3', labelKr: 'Jan 1 rive 3', passages: [{ bookId: 'JHN', chapter: 1 }, { bookId: 'JHN', chapter: 3 }] },
      { day: 6, labelFr: 'Jean 14 à 16', labelKr: 'Jan 14 rive 16', passages: [{ bookId: 'JHN', chapter: 14 }] },
      { day: 7, labelFr: 'Romains 6 à 8', labelKr: 'Women 6 rive 8', passages: [{ bookId: 'ROM', chapter: 8 }] },
    ]
  },
  {
    id: 'psalms_proverbs',
    titleFr: 'Psaumes & Proverbes en 30 jours',
    titleKr: 'Sòm ak Pwovèb nan 30 jou',
    descFr: 'Nourrissez votre prière et votre sagesse quotidienne avec les louanges de David et les conseils de Salomon.',
    descKr: 'Nouri lapriyè w ak lasajès ou chak jou ak louwanj David yo ansanm ak konsèy Salomon yo.',
    durationDays: 30,
    items: [
      { day: 1, labelFr: 'Psaumes 1 à 5 & Proverbes 1', labelKr: 'Sòm 1 rive 5 & Pwovèb 1', passages: [{ bookId: 'PSA', chapter: 1 }, { bookId: 'PRO', chapter: 1 }] },
      { day: 2, labelFr: 'Psaumes 23 à 27 & Proverbes 2', labelKr: 'Sòm 23 rive 27 & Pwovèb 2', passages: [{ bookId: 'PSA', chapter: 23 }, { bookId: 'PRO', chapter: 2 }] },
      { day: 3, labelFr: 'Psaumes 90 à 92 & Proverbes 3', labelKr: 'Sòm 90 rive 92 & Pwovèb 3', passages: [{ bookId: 'PSA', chapter: 91 }, { bookId: 'PRO', chapter: 3 }] },
      { day: 4, labelFr: 'Psaumes 120 à 125 & Proverbes 4', labelKr: 'Sòm 120 rive 125 & Pwovèb 4', passages: [{ bookId: 'PSA', chapter: 121 }, { bookId: 'PRO', chapter: 4 }] },
    ]
  }
];
