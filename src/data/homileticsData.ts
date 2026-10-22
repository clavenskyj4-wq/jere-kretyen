import { SermonDraft, SermonType } from '../types';

export interface PreachingMethodInfo {
  type: SermonType;
  titleFr: string;
  titleKr: string;
  subtitleFr: string;
  subtitleKr: string;
  descriptionFr: string;
  descriptionKr: string;
  stepsFr: string[];
  stepsKr: string[];
  recommendedPassages: { refFr: string; refKr: string; bookId: string; chapter: number }[];
}

export const PREACHING_METHODS: PreachingMethodInfo[] = [
  {
    type: 'expositif',
    titleFr: 'Prédication Expositive',
    titleKr: 'Predikasyon Ekspozitif',
    subtitleFr: 'Fidélité au texte verset par verset',
    subtitleKr: 'Eksplike tèks la vèsè pa vèsè',
    descriptionFr: 'La méthode reine : le texte biblique fournit à la fois le sujet, la structure et les points principaux du message.',
    descriptionKr: 'Metòd ki pi solid la : pasaj Labib la bay sijè a, plan an ak tout pwen prensipal mesaj la.',
    stepsFr: [
      '1. Lecture répétée du passage (3 à 5 fois en FR et KR)',
      '2. Observation détaillée (qui, quoi, où, pourquoi, mots-clés)',
      '3. Interprétation contextuelle (sens historique et théologique)',
      '4. Formulation de l\'Idée Centrale (la Big Idea en 1 phrase)',
      '5. Rédaction des 3 points issus directement du texte',
      '6. Application concrète pour la vie de l\'auditoire',
    ],
    stepsKr: [
      '1. Li tèks la plizyè fwa (3 a 5 fwa an franse ak kreyòl)',
      '2. Obsèvasyon : ki moun, ki kote, kisa k\'ap pase, mo kle yo',
      '3. Entèpretasyon : kisa tèks la te vle di pou premye moun yo',
      '4. Fòmile Ide Santral la an yon sèl bèl fraz klè',
      '5. Ekri 3 pwen ki soti dirèkteman nan pasaj la',
      '6. Aplikasyon pratik pou lavi moun k\'ap koute yo',
    ],
    recommendedPassages: [
      { refFr: 'Jean 3:16-21', refKr: 'Jan 3:16-21', bookId: 'JHN', chapter: 3 },
      { refFr: 'Psaume 23:1-6', refKr: 'Sòm 23:1-6', bookId: 'PSA', chapter: 23 },
      { refFr: 'Romains 8:31-39', refKr: 'Women 8:31-39', bookId: 'ROM', chapter: 8 },
      { refFr: 'Éphésiens 6:10-18', refKr: 'Efez 6:10-18', bookId: 'EPH', chapter: 6 },
    ],
  },
  {
    type: 'thematique',
    titleFr: 'Prédication Thématique',
    titleKr: 'Predikasyon Tematik',
    subtitleFr: 'Explorer un grand thème biblique',
    subtitleKr: 'Etidye yon gwo sijè nan plizyè pasaj',
    descriptionFr: 'Développer une doctrine ou un thème chrétien (ex: le pardon, la foi, l\'espérance) en rassemblant la perspective globale des Écritures.',
    descriptionKr: 'Devlope yon tèm (tankou padon, lafwa, priyè) pandan w\'ap rasanble plizyè vèsè nan Bib la ki konfime l.',
    stepsFr: [
      '1. Définition claire du sujet et de son importance spirituelle',
      '2. Recherche des passages bibliques clés qui traitent du sujet',
      '3. Éviter d\'isoler un verset de son contexte d\'origine',
      '4. Structurer une progression logique (Problème -> Solution en Christ -> Vivre la vérité)',
      '5. Appel clair à l\'action et prière de consécration',
    ],
    stepsKr: [
      '1. Defini sijè a aklè e poukisa li enpòtan pou lafwa nou',
      '2. Chache vèsè kle ki pale sou sijè a san wete yo nan kontèks yo',
      '3. Fè yon plan ki lojik (Pwoblèm nan -> Solisyon nan Kris la -> Aksyon jodi a)',
      '4. Fè yon apèl klè pou moun pran desizyon pou Bondye',
      '5. Fini ak yon bèl priyè angajman',
    ],
    recommendedPassages: [
      { refFr: 'Le Pardon chrétien (Matthieu 18:21-35)', refKr: 'Padon kretyen (Matye 18:21-35)', bookId: 'MAT', chapter: 18 },
      { refFr: 'La Prière fervente (Jacques 5:13-18)', refKr: 'Lapriyè ak lafwa (Jak 5:13-18)', bookId: 'JAS', chapter: 5 },
      { refFr: 'La Victoire sur la peur (Ésaïe 41:10)', refKr: 'Viktwa sou lape (Ezayi 41:10)', bookId: 'ISA', chapter: 41 },
    ],
  },
  {
    type: 'biographique',
    titleFr: 'Prédication Biographique',
    titleKr: 'Predikasyon sou Pèsonaj Biblik',
    subtitleFr: 'Tirer les leçons de la vie d\'un héros de la foi',
    subtitleKr: 'Aprann nan lavi yon moun nan Bib la',
    descriptionFr: 'Analyser le parcours d\'un personnage (succès, échecs, foi, repentance) pour en tirer des leçons spirituelles directes pour aujourd\'hui.',
    descriptionKr: 'Gade lavi yon pèsonaj (kote l te byen fè, erè l te fè, lafwa li) pou tire bèl leson pou lavi nou jodi a.',
    stepsFr: [
      '1. Tracer la chronologie de sa vie et de ses épreuves',
      '2. Identifier son point fort spirituel et son talon d\'Achille',
      '3. Souligner la fidélité et la grâce de Dieu envers lui',
      '4. Appliquer : comment ne pas répéter ses fautes et imiter sa foi',
    ],
    stepsKr: [
      '1. Gade istwa lavi li ak gwo batay li te pase',
      '2. Idantifye kote li te fò nan lafwa ak kote l te fè feblès',
      '3. Montre kijan favè Bondye te soutni li',
      '4. Aplike nan lavi nou pou n pa fè menm fot yo',
    ],
    recommendedPassages: [
      { refFr: 'Joseph : De la prison au palais (Genèse 37-50)', refKr: 'Jozèf : Soti nan prizon rive nan palè (Jenèz 37-50)', bookId: 'GEN', chapter: 37 },
      { refFr: 'David : Un cœur selon Dieu (1 Samuel 16-17)', refKr: 'David : Yon moun ki renmen Bondye (1 Samyèl 16-17)', bookId: '1SA', chapter: 16 },
      { refFr: 'Ruth : La fidélité récompensée (Ruth 1-4)', refKr: 'Rit : Yon fanm fidèl (Rit 1-4)', bookId: 'RUT', chapter: 1 },
    ],
  },
  {
    type: 'meditation',
    titleFr: 'Méditation Dévotionnelle Personnelle',
    titleKr: 'Meditasyon Pèsonèl Dévosyonèl',
    subtitleFr: 'Nourrir son âme et écouter la voix de Dieu',
    subtitleKr: 'Nouri nanm nou e koute vwa Senyè a',
    descriptionFr: 'Un temps calme dans le secret pour laisser la Parole renouveler nos pensées, guérir nos blessures et ranimer notre zèle.',
    descriptionKr: 'Yon moman trankil anndan chanm ou pou kite Pawòl la renouvle lespri ou, pote lapè ak ranfòse relasyon w ak Bondye.',
    stepsFr: [
      '1. Silence intérieur et prière d\'ouverture : « Parle, Seigneur, ton serviteur écoute »',
      '2. Lecture méditative lente (Lectio Divina)',
      '3. Quel mot ou verset touche mon cœur aujourd\'hui ?',
      '4. Quel péché dois-je confesser ? Quelle promesse dois-je saisir ?',
      '5. Résolution concrète pour la journée et louange',
    ],
    stepsKr: [
      '1. Fè silans nan kè w epi lapriyè : « Pale Senyè, sèvitè w la ap koute »',
      '2. Li dousman ak atansyon',
      '3. Ki mo oswa ki vèsè ki touche kè m jodi a ?',
      '4. Ki peche m dwe konfese ? Ki bèl pwomès m dwe kenbe ?',
      '5. Yon bèl desizyon pou jounen an epi louwanj pou Bondye',
    ],
    recommendedPassages: [
      { refFr: 'Psaume 1:1-6 (L\'arbre planté près d\'un courant d\'eau)', refKr: 'Sòm 1:1-6 (Pyebwa bò larivyè)', bookId: 'PSA', chapter: 1 },
      { refFr: 'Jean 15:1-8 (Le Cep et les Sarments)', refKr: 'Jan 15:1-8 (Pye rezen an ak branch yo)', bookId: 'JHN', chapter: 15 },
      { refFr: 'Lamentations 3:22-26 (Les bontés de l\'Éternel)', refKr: 'Plenn 3:22-26 (Bonté Seyè a pa janm fini)', bookId: 'LAM', chapter: 3 },
    ],
  },
];

// Sample initial sermon draft as a pedagogical template
export const SAMPLE_TEACHING_SERMON: SermonDraft = {
  id: 'sample-sermon-1',
  title: 'La Paix qui surpasse toute intelligence',
  theme: 'Vaincre l\'anxiété par la prière et la reconnaissance',
  type: 'expositif',
  primaryPassage: {
    bookId: 'PHP',
    chapter: 4,
    verseStart: 4,
    verseEnd: 7,
    referenceText: 'Philippiens 4:4-7 / Filipyen 4:4-7',
  },
  audience: 'L\'Église locale, familles éprouvées, jeunes confrontés au stress',
  bigIdea: 'La paix surnaturelle de Dieu ne s\'achète pas : elle nous est accordée lorsque nous déposons nos fardeaux à ses pieds dans la prière avec actions de grâces.',
  introduction: {
    hook: 'Avez-vous remarqué comment une petite pensée d\'inquiétude à 3h du matin peut voler tout notre sommeil ? Le monde entier cherche la paix intérieure dans les divertissements ou les richesses, mais le cœur humain reste agité.',
    needOrProblem: 'Nous vivons dans une génération submergée par l\'angoisse du lendemain et les mauvaises nouvelles.',
    context: 'L\'apôtre Paul écrit cette lettre depuis une prison romaine étroite, enchaîné à un soldat. Pourtant, c\'est l\'épître de la joie par excellence !',
  },
  observationNotes: {
    who: 'Paul écrit aux chrétiens fidèles de Philippe en Macédoine.',
    whereWhen: 'Vers l\'an 61 après J.-C., en captivité à Rome.',
    keywords: '« Réjouissez-vous » (répété 2 fois), « En rien ne vous inquiétez », « Prières et supplications », « Actions de grâces », « La paix de Dieu ».',
    keyThemes: 'La joie surnaturelle indépendante des circonstances, la prière substituée au souci, la garde protectrice du cœur par Dieu.',
  },
  interpretationNotes: {
    originalMeaning: 'Le verbe grec pour « gardera » (phroureo) est un terme militaire : comme une garnison de soldats romains qui monte la garde autour d\'une ville, la paix divine monte la garde autour de l\'esprit du croyant.',
    theologicalTruth: 'Dieu ne promet pas d\'enlever toutes les tempêtes extérieures immédiatement, mais Il promet une paix intérieure qui transcende toute explication humaine.',
    crossReferences: 'Ésaïe 26:3 (« À celui qui est ferme dans ses sentiments, tu assures la paix »), Jean 14:27 (« Je vous laisse la paix, je vous donne ma paix »).',
  },
  points: [
    {
      id: 'p-1',
      title: '1. Une Joie enracinée dans le Seigneur (v. 4-5)',
      scriptureRef: 'Philippiens 4:4-5',
      explanation: 'La joie chrétienne ne dépend pas de la météo ou des finances, mais de la présence constante du Christ (« Le Seigneur est proche »).',
      illustration: 'Une ancre de navire n\'est pas fixée au bateau, mais plonge profondément dans le roc sous l\'océan pour que le navire ne dérive pas pendant la tempête.',
      application: 'Chaque matin, choisissons de remercier Dieu pour son salut avant même d\'allumer notre téléphone portable.',
    },
    {
      id: 'p-2',
      title: '2. L\'Antidote Divin à l\'Anxiété : La Prière Reconnaissante (v. 6)',
      scriptureRef: 'Philippiens 4:6',
      explanation: 'Paul ne nous demande pas de nier nos soucis, mais de les transférer à Dieu par des supplications accompagnées d\'actions de grâces.',
      illustration: 'Quand un enfant a peur dans le noir, il ne rédige pas un rapport financier : il crie simplement vers son père et se jette dans ses bras.',
      application: 'Faites la liste de vos 3 plus grandes peurs aujourd\'hui et transformez chacune d\'elles en une prière d\'abandon.',
    },
    {
      id: 'p-3',
      title: '3. La Sentinelle Céleste : La Paix de Dieu (v. 7)',
      scriptureRef: 'Philippiens 4:7',
      explanation: 'La paix de Dieu n\'est pas seulement l\'absence de conflit, c\'est le Shalom divin qui garde notre cœur (nos émotions) et nos pensées (notre intellect).',
      illustration: 'Une forteresse assiégée de l\'extérieur, mais qui possède à l\'intérieur une source d\'eau fraîche intarissable.',
      application: 'Recevez cette paix aujourd\'hui : refusez de porter seul le poids de la semaine qui vient.',
    },
  ],
  conclusion: {
    summary: 'La joie dans le Seigneur, le refus de l\'inquiétude par la prière reconnaissante, et la garde imprenable de la paix divine.',
    callToAction: 'Y a-t-il quelqu\'un ici ce matin qui porte un fardeau d\'angoisse ? Ne repartez pas avec ce sac lourd. Venez le déposer à l\'autel de la prière.',
    prayer: 'Seigneur Jésus, nous renonçons à l\'esprit d\'anxiété. Nous remettons notre santé, nos enfants, nos lendemains entre tes mains fidèles. Que ta paix inonde nos cœurs dès maintenant. Amen !',
  },
  evaluation: {
    biblicalFaithfulness: true,
    clearCentralIdea: true,
    practicalApplication: true,
    gospelCentered: true,
    timeTarget: '25 min',
    notes: 'Excellente balance entre exégèse rigoureuse et application pastorale directe.',
  },
  createdAt: Date.now() - 86400000 * 3,
  updatedAt: Date.now() - 86400000 * 3,
};
