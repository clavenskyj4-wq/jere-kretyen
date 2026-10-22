import { DailyVerse } from '../types';

export const DAILY_VERSES: DailyVerse[] = [
  {
    id: 'dv-1',
    bookId: 'JHN',
    chapter: 3,
    verse: 16,
    referenceFr: 'Jean 3:16',
    referenceKr: 'Jan 3:16',
    textFr: "Car Dieu a tant aimé le monde qu'il a donné son Fils unique, afin que quiconque croit en lui ne périsse point, mais qu'il ait la vie éternelle.",
    textKr: "Paske, Bondye sitèlman renmen lemonn, li bay sèl Pitit li a pou li, pou tout moun ki mete konfyans yo nan li pa pèdi, men pou yo ka gen lavi ki p ap janm fini an.",
    themeFr: "Amour Divin & Salut",
    themeKr: "Renmen Bondye & Delivrans"
  },
  {
    id: 'dv-2',
    bookId: 'PSA',
    chapter: 23,
    verse: 1,
    referenceFr: 'Psaume 23:1',
    referenceKr: 'Sòm 23:1',
    textFr: "L'Éternel est mon berger: je ne manquerai de rien.",
    textKr: "Senyè a se gadò mwen, mwen p ap manke anyen.",
    themeFr: "Confiance & Provision",
    themeKr: "Konfyans & Pwovizyon"
  },
  {
    id: 'dv-3',
    bookId: 'PHP',
    chapter: 4,
    verse: 13,
    referenceFr: 'Philippiens 4:13',
    referenceKr: 'Filip 4:13',
    textFr: "Je puis tout par celui qui me fortifie.",
    textKr: "Mwen kapab fè tout bagay grasa Kris la ki ban mwen fòs la.",
    themeFr: "Victoire & Force en Christ",
    themeKr: "Viktwa & Fòs nan Kris"
  },
  {
    id: 'dv-4',
    bookId: 'PSA',
    chapter: 91,
    verse: 1,
    referenceFr: 'Psaume 91:1',
    referenceKr: 'Sòm 91:1',
    textFr: "Celui qui demeure sous l'abri du Très-Haut Repose à l'ombre du Tout Puissant.",
    textKr: "Moun ki chita anba pwoteksyon Bondye ki anwo nan syèl la, l ap viv anba lonbray Bondye ki gen tout pouvwa a.",
    themeFr: "Protection Divine",
    themeKr: "Pwoteksyon Bondye"
  },
  {
    id: 'dv-5',
    bookId: 'PRO',
    chapter: 3,
    verse: 5,
    referenceFr: 'Proverbes 3:5-6',
    referenceKr: 'Pwovèb 3:5-6',
    textFr: "Confie-toi en l'Éternel de tout ton cœur, Et ne t'appuie pas sur ta sagesse; Reconnais-le dans toutes tes voies, Et il aplanira tes sentiers.",
    textKr: "Mete tout konfyans ou nan Senyè a ak tout kè w, pa konte sou pwòp konprann pa w; Sonje li nan tout sa w ap fè, l ap louvri bon chemen an devan ou.",
    themeFr: "Sagesse & Guidance",
    themeKr: "Sajès & Gidans"
  },
  {
    id: 'dv-6',
    bookId: 'ROM',
    chapter: 8,
    verse: 28,
    referenceFr: 'Romains 8:28',
    referenceKr: 'Women 8:28',
    textFr: "Nous savons, du reste, que toutes choses concourent au bien de ceux qui aiment Dieu, de ceux qui sont appelés selon son dessein.",
    textKr: "Nou konnen sa byen: tout bagay ap mache ansanm pou byen moun ki renmen Bondye, moun Bondye te chwazi dapre plan li.",
    themeFr: "Espérance & Providence",
    themeKr: "Espwa & Plan Bondye"
  },
  {
    id: 'dv-7',
    bookId: 'PSA',
    chapter: 121,
    verse: 2,
    referenceFr: 'Psaume 121:2',
    referenceKr: 'Sòm 121:2',
    textFr: "Le secours me vient de l'Éternel, Qui a fait les cieux et la terre.",
    textKr: "Sekou mwen soti nan Senyè a, ki fè syèl la ak latè a.",
    themeFr: "Secours infaillible",
    themeKr: "Sekou ki pap febli"
  }
];

export function getTodayVerse(): DailyVerse {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const index = Math.abs(dayOfYear) % DAILY_VERSES.length;
  return DAILY_VERSES[index];
}
