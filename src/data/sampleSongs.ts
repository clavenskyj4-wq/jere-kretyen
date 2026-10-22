import { Song, HymnalSection } from '../types';

export const HYMNAL_SECTIONS: { code: HymnalSection; labelFr: string; labelKr: string; short: string }[] = [
  { code: 'CE_FR', labelFr: "Chants d'Espérance (Français)", labelKr: "Chants d'Espérance (Fransè)", short: 'CE-FR' },
  { code: 'CE_KR', labelFr: "Chants d'Espérance (Créole)", labelKr: "Chants d'Espérance (Kreyòl)", short: 'CE-KR' },
  { code: 'MELODIES_FR', labelFr: 'Mélodies Joyeuses (Français)', labelKr: 'Mélodies Joyeuses (Fransè)', short: 'MJ-FR' },
  { code: 'MELODIES_KR', labelFr: 'Mélodies Joyeuses (Créole)', labelKr: 'Mélodies Joyeuses (Kreyòl)', short: 'MJ-KR' },
  { code: 'REVEILLONS_NOUS', labelFr: 'Réveillons-Nous Chrétiens', labelKr: 'Leve Non Kretyen', short: 'RN' },
  { code: 'HAITI_CHANTE', labelFr: 'Haïti Chante avec Radio Lumière', labelKr: 'Ayiti Chante ak Radyo Limyè', short: 'HCRL' },
  { code: 'VOIX_DU_REVEIL', labelFr: 'La Voix du Réveil', labelKr: 'Vwa Reveye a', short: 'VR' },
  { code: 'NOUVO_KE', labelFr: 'Nouvo Kè & Chœurs de Louange', labelKr: 'Nouvo Kè & Koral Louwanj', short: 'KÈ' },
];

export const SAMPLE_SONGS: Song[] = [
  // --- CHANTS D'ESPÉRANCE FRANÇAIS (CE_FR) ---
  {
    id: 'ce-fr-1',
    number: 1,
    title: 'Grand Dieu, nous te bénissons',
    titleKr: 'Granmèt, nou beni Non w',
    section: "Chants d'Espérance Français",
    sectionCode: 'CE_FR',
    author: 'Ignaz Franz / H. A. C. Malan (1771)',
    category: 'adoration',
    copyrightStatus: 'Domaine public',
    keySignature: 'Fa Majeur (F)',
    tempo: 'Solennel et majestueux',
    verses: [
      {
        number: 1,
        text: [
          'Grand Dieu, nous te bénissons,',
          'Nous célébrons tes louanges;',
          'Éternel, nous t\'exaltons,',
          'De concert avec les anges,',
          'Et, prosternés devant toi,',
          'Nous te proclamons grand Roi!'
        ]
      },
      {
        number: 2,
        text: [
          'Les saints et les séraphins,',
          'Les chérubins pleins de zèle,',
          'Chantent, les regards sereins,',
          'Ta sainteté perpétuelle:',
          'Saint! saint! saint est l\'Éternel,',
          'Le Seigneur, Dieu d\'Israël!'
        ]
      },
      {
        number: 3,
        text: [
          'Sauve ton peuple, ô Seigneur,',
          'Bénis ton saint héritage!',
          'Que ta grâce et ta splendeur',
          'Soient son guide et son partage!',
          'Conduis-le par ton amour',
          'Jusqu\'au céleste séjour!'
        ]
      }
    ]
  },
  {
    id: 'ce-fr-18',
    number: 18,
    title: 'Quel ami fidèle et tendre',
    titleKr: 'Ala yon bon zanmi nou genyen',
    section: "Chants d'Espérance Français",
    sectionCode: 'CE_FR',
    author: 'Joseph Scriven (1855) / Charles Rochedieu',
    category: 'foi',
    copyrightStatus: 'Domaine public',
    keySignature: 'Fa Majeur (F)',
    tempo: 'Chaleureux et doux',
    verses: [
      {
        number: 1,
        text: [
          'Quel ami fidèle et tendre',
          'Nous avons en Jésus-Christ,',
          'Toujours prêt à nous entendre,',
          'À répondre à notre cri!',
          'Il connaît nos défaillances,',
          'Nos fardeaux de chaque jour.',
          'À genoux, en confiance,',
          'Déposons-les en son amour.'
        ]
      },
      {
        number: 2,
        text: [
          'Quel ami fidèle et tendre',
          'Nous avons en Jésus-Christ,',
          'Toujours prêt à nous comprendre',
          'Quand nous sommes dans l\'ennui!',
          'Disons-lui toutes nos peines,',
          'Confions-lui nos soucis;',
          'Car sa grâce souveraine',
          'Est l\'abri de tous ses fils.'
        ]
      },
      {
        number: 3,
        text: [
          'Quel ami fidèle et tendre',
          'Nous avons en Jésus-Christ,',
          'Toujours prêt à nous défendre',
          'Quand nous presse l\'ennemi!',
          'Si nous cherchons un refuge,',
          'C\'est en Lui que nous l\'avons;',
          'Car Il est le juste Juge,',
          'Et le Sauveur que nous aimons.'
        ]
      }
    ]
  },
  {
    id: 'ce-fr-21',
    number: 21,
    title: 'À Golgotha',
    titleKr: 'Nan Gòlgota',
    section: "Chants d'Espérance Français",
    sectionCode: 'CE_FR',
    author: 'Traditionnel évangélique / Domaine public',
    category: 'paques',
    copyrightStatus: 'Domaine public',
    keySignature: 'Sol Majeur (G)',
    tempo: 'Lent et recueilli',
    verses: [
      {
        number: 1,
        text: [
          'À Golgotha mon Sauveur a souffert,',
          'Sur une croix son sang a coulé;',
          'Pour me racheter du péché, de l\'enfer,',
          'C\'est par amour qu\'Il s\'est donné.'
        ]
      },
      {
        number: 2,
        text: [
          'Agneau de Dieu, brisé pour nos péchés,',
          'Tu as porté le poids de nos douleurs;',
          'Par tes meurtrissures nous sommes guéris,',
          'Gloire et louange à notre Rédempteur!'
        ]
      }
    ],
    chorus: [
      'Golgotha, lieu de grâce et d\'amour,',
      'Où Jésus paya ma rançon;',
      'Je chanterai sa bonté chaque jour,',
      'Et proclamerai son grand Nom!'
    ]
  },
  {
    id: 'ce-fr-30',
    number: 30,
    title: 'Roc séculaire',
    titleKr: 'Wòch depi tout tan',
    section: "Chants d'Espérance Français",
    sectionCode: 'CE_FR',
    author: 'Augustus Toplady (1776) / Thomas Hastings',
    category: 'foi',
    copyrightStatus: 'Domaine public',
    keySignature: 'Si Bémol (Bb)',
    tempo: 'Solennel et humble',
    verses: [
      {
        number: 1,
        text: [
          'Roc séculaire, frappé pour moi,',
          'Sur le Calvaire, je viens à toi;',
          'De ton côté percé, sanglant,',
          'Coula le flot purifiant;',
          'Sois de mon cœur le souverain,',
          'Guéris-moi de tout mon malin.'
        ]
      },
      {
        number: 2,
        text: [
          'Tous les travaux de mes deux mains',
          'Sont des efforts faibles et vains;',
          'Mon zèle le plus enflammé,',
          'Mes pleurs de repentir versés,',
          'Ne sauraient laver mon péché:',
          'Toi seul peux sauver mon passé!'
        ]
      }
    ]
  },
  {
    id: 'ce-fr-40',
    number: 40,
    title: 'Tel que je suis',
    titleKr: 'Jan mwen ye a, mwen vin jwenn ou',
    section: "Chants d'Espérance Français",
    sectionCode: 'CE_FR',
    author: 'Charlotte Elliott (1835) / William Bradbury',
    category: 'consecration',
    copyrightStatus: 'Domaine public',
    keySignature: 'Mi Bémol (Eb)',
    tempo: 'Prière profonde',
    verses: [
      {
        number: 1,
        text: [
          'Tel que je suis, sans rien à moi,',
          'Sinon ton sang versé pour moi,',
          'Et ta voix qui m\'appelle à toi,',
          'Agneau de Dieu, je viens, je viens!'
        ]
      },
      {
        number: 2,
        text: [
          'Tel que je suis, bien vacillant,',
          'En proie au doute à chaque instant,',
          'Lutte au dehors, crainte au dedans,',
          'Agneau de Dieu, je viens, je viens!'
        ]
      },
      {
        number: 3,
        text: [
          'Tel que je suis, ton saint amour',
          'A banni ma peur sans retour;',
          'Pour être à toi dès ce grand jour,',
          'Agneau de Dieu, je viens, je viens!'
        ]
      }
    ]
  },
  {
    id: 'ce-fr-52',
    number: 52,
    title: 'Mon Dieu, plus près de toi',
    titleKr: 'Bondye mwen, pi pre ou',
    section: "Chants d'Espérance Français",
    sectionCode: 'CE_FR',
    author: 'Sarah F. Adams (1841) / Lowell Mason',
    category: 'adoration',
    copyrightStatus: 'Domaine public',
    keySignature: 'Sol Majeur (G)',
    tempo: 'Adoration paisible',
    verses: [
      {
        number: 1,
        text: [
          'Mon Dieu, plus près de toi,',
          'Plus près de toi!',
          'C\'est le mot de ma foi:',
          'Plus près de toi!',
          'Dans le jour où l\'épreuve',
          'Déborde comme un fleuve,',
          'Garde-moi plus près de toi,',
          'Plus près de toi!'
        ]
      },
      {
        number: 2,
        text: [
          'Plus près de toi, Seigneur,',
          'Plus près de toi!',
          'Donne à mon pauvre cœur',
          'Plus de foi!',
          'Quand l\'ombre est sur la plaine,',
          'Et que s\'éteint mon jour,',
          'Fais-moi reposer en paix,',
          'Dans ton amour!'
        ]
      }
    ]
  },
  {
    id: 'ce-fr-80',
    number: 80,
    title: 'Douce nuit, sainte nuit',
    titleKr: 'Nwèl la rive, lannwit sen',
    section: "Chants d'Espérance Français",
    sectionCode: 'CE_FR',
    author: 'Joseph Mohr (1818) / Franz Gruber',
    category: 'noel',
    copyrightStatus: 'Domaine public',
    keySignature: 'Si Bémol (Bb)',
    tempo: 'Calme et mystique',
    verses: [
      {
        number: 1,
        text: [
          'Douce nuit, sainte nuit!',
          'Dans les cieux l\'astre luit.',
          'Le mystère annoncé s\'accomplit,',
          'Cet enfant sur la paille endormi,',
          'C\'est l\'amour infini!',
          'C\'est l\'amour infini!'
        ]
      },
      {
        number: 2,
        text: [
          'Saint Enfant, doux Agneau!',
          'Qu\'il est grand! Qu\'il est beau!',
          'Entendez résonner les pipeaux',
          'Des bergers conduisant leurs troupeaux',
          'Vers son humble berceau!',
          'Vers son humble berceau!'
        ]
      }
    ]
  },
  {
    id: 'ce-fr-92',
    number: 92,
    title: 'Il est né le divin Enfant',
    titleKr: 'Pitit Bondye a fèt jodi a',
    section: "Chants d'Espérance Français",
    sectionCode: 'CE_FR',
    author: 'Traditionnel français / Domaine public',
    category: 'noel',
    copyrightStatus: 'Domaine public',
    keySignature: 'Fa Majeur (F)',
    tempo: 'Joyeux et rythmé',
    verses: [
      {
        number: 1,
        text: [
          'Depuis plus de quatre mille ans,',
          'Nous le promettaient les prophètes;',
          'Depuis plus de quatre mille ans,',
          'Nous attendions cet heureux temps.'
        ]
      },
      {
        number: 2,
        text: [
          'Une étable est son logement,',
          'Un peu de paille est sa couchette;',
          'Une étable est son logement,',
          'Pour un Dieu quel abaissement!'
        ]
      }
    ],
    chorus: [
      'Il est né, le divin Enfant,',
      'Jouez hautbois, résonnez musettes!',
      'Il est né, le divin Enfant,',
      'Chantons tous son avènement!'
    ]
  },
  {
    id: 'ce-fr-105',
    number: 105,
    title: 'Debout, sainte cohorte',
    titleKr: 'Kanpe pou Jezikri',
    section: "Chants d'Espérance Français",
    sectionCode: 'CE_FR',
    author: 'George Duffield (1858) / George J. Webb',
    category: 'combat_spirituel',
    copyrightStatus: 'Domaine public',
    keySignature: 'Si Bémol (Bb)',
    tempo: 'Marche victorieuse',
    verses: [
      {
        number: 1,
        text: [
          'Debout, sainte cohorte,',
          'Soldats du Roi des rois!',
          'Tenez d\'une main forte',
          'L\'étendard de la croix!',
          'Au grand jour de la lutte,',
          'Forts de votre Seigneur,',
          'Vers la gloire marchez tous,',
          'Plus que vainqueurs!'
        ]
      },
      {
        number: 2,
        text: [
          'Debout! le clairon sonne,',
          'Debout et combattez!',
          'C\'est Jésus qui pardonne',
          'Et brise l\'ennemi.',
          'Avec Christ pour bannière,',
          'Qui pourra s\'ébranler?',
          'Il donne la victoire,',
          'À ses enfants!'
        ]
      }
    ]
  },
  {
    id: 'ce-fr-136',
    number: 136,
    title: 'Jésus soit avec vous à jamais',
    titleKr: 'Se pou Jezi toujou rete avèk ou',
    section: "Chants d'Espérance Français",
    sectionCode: 'CE_FR',
    author: 'Jeremiah E. Rankin (1880) / William G. Tomer',
    category: 'esperance',
    copyrightStatus: 'Domaine public',
    keySignature: 'Do Majeur (C)',
    tempo: 'Bénédiction finale',
    verses: [
      {
        number: 1,
        text: [
          'Jésus soit avec vous à jamais!',
          'Que sa grâce en vos cœurs demeure;',
          'Qu\'il vous garde à toute heure,',
          'Dans sa douce et parfaite paix!'
        ]
      },
      {
        number: 2,
        text: [
          'Jésus soit avec vous à jamais!',
          'Sur vos pas qu\'il veille sans cesse,',
          'Console votre tristesse,',
          'Et vous donne ses bienfaits!'
        ]
      }
    ],
    chorus: [
      'Jusqu\'au jour du rendez-vous,',
      'Où nous serons réunis tous,',
      'Jésus soit toujours avec vous,',
      'Oui, toujours, toujours avec vous!'
    ]
  },
  {
    id: 'ce-fr-150',
    number: 150,
    title: 'J\'ai soif de ta présence',
    titleKr: 'Mwen swaf prezans ou, Senyè',
    section: "Chants d'Espérance Français",
    sectionCode: 'CE_FR',
    author: 'Annie S. Hawks / Robert Lowry (1872)',
    category: 'priere',
    copyrightStatus: 'Domaine public',
    keySignature: 'La Bémol (Ab)',
    tempo: 'Dévotion intime',
    verses: [
      {
        number: 1,
        text: [
          'J\'ai soif de ta présence,',
          'Divin chef de ma foi;',
          'Auprès de toi commence',
          'Le vrai bonheur pour moi.'
        ]
      },
      {
        number: 2,
        text: [
          'Des soins de cette terre',
          'Éloigne mon esprit;',
          'Qu\'en toi seul je n\'espère,',
          'Seigneur, ô Jésus-Christ!'
        ]
      }
    ],
    chorus: [
      'Chaque jour, à chaque heure,',
      'Oh! j\'ai besoin de toi!',
      'Viens, Jésus, et demeure',
      'Toujours auprès de moi!'
    ]
  },

  // --- CHANTS D'ESPÉRANCE CRÉOLE (CE_KR) ---
  {
    id: 'ce-kr-1',
    number: 1,
    title: 'Granmèt, nou beni Non w',
    titleKr: 'Granmèt, nou beni Non w',
    section: "Chants d'Espérance Créole",
    sectionCode: 'CE_KR',
    author: 'Adaptation haïtienne / Domaine public',
    category: 'louange',
    copyrightStatus: 'Domaine public',
    keySignature: 'Fa Majeur (F)',
    tempo: 'Vivan e avèk lajwa',
    verses: [
      {
        number: 1,
        text: [
          'Granmèt, nou beni Non ou,',
          'Nou chante pou fè lwanj ou;',
          'Egzalte w, se sa n ap fè,',
          'Tout zanj nan syèl ap adore w.',
          'Devan fotèy ou n ap pwostène,',
          'Paske se ou ki Gran Wa a!'
        ]
      },
      {
        number: 2,
        text: [
          'Tout sen yo ak serafen yo,',
          'Cheriben yo ak tout kè yo,',
          'Ap chante ak kè poze:',
          'Sen! Sen! Sen se Senyè a!',
          'Bondye ki gen tout pouvwa,',
          'Se ou ki Bondye pèp Izrayèl!'
        ]
      },
      {
        number: 3,
        text: [
          'Sove pèp ou a, Granmèt,',
          'Beni tout sa ki pou ou!',
          'Se pou gras ou ak glwa ou',
          'Mache avèk nou chak jou!',
          'Kondwi nou nan renmen ou',
          'Jiska nou rive nan syèl la!'
        ]
      }
    ]
  },
  {
    id: 'ce-kr-4',
    number: 4,
    title: 'Lè m gade bèl syèl la',
    titleKr: 'Lè m gade bèl syèl la',
    section: "Chants d'Espérance Créole",
    sectionCode: 'CE_KR',
    author: 'Carl Boberg (1885) / Traduction haïtienne',
    category: 'adoration',
    copyrightStatus: 'Domaine public',
    keySignature: 'Si Bémol (Bb)',
    tempo: 'Gwo adorasyon',
    verses: [
      {
        number: 1,
        text: [
          'Lè m gade bèl syèl la ak tout etwal yo,',
          'Zèv men ou fè yo ki tèlman bèl;',
          'Loray k ap gwonde, solèy k ap klere,',
          'Tout bagay sa yo montre pouvwa ou.'
        ]
      },
      {
        number: 2,
        text: [
          'Lè m sonje Jezi te mouri pou mwen,',
          'Kè mwen kontan, dlo koule nan je m;',
          'Sou lakwa a li te pran tout peche m yo,',
          'Li vide san l pou l ban m lavi a.'
        ]
      }
    ],
    chorus: [
      'Lè sa a nanm mwen ap chante pou ou:',
      'Ala ou gran, Bondye! Ala ou gran!',
      'Wi, tout nanm mwen ap chante pou ou:',
      'Ala ou gran, Senyè! Ala ou gran!'
    ]
  },
  {
    id: 'ce-kr-12',
    number: 12,
    title: 'Jezi renmen m, mwen konn sa',
    titleKr: 'Jezi renmen m, mwen konn sa',
    section: "Chants d'Espérance Créole",
    sectionCode: 'CE_KR',
    author: 'Anna B. Warner (1860) / William Bradbury',
    category: 'enfants',
    copyrightStatus: 'Domaine public',
    keySignature: 'Do Majeur (C)',
    tempo: 'Dous pou timoun',
    verses: [
      {
        number: 1,
        text: [
          'Jezi renmen m, mwen konn sa,',
          'Paske Labib di mwen sa;',
          'Tout timoun piti se pou li,',
          'Yo fèb men li menm li fò!'
        ]
      },
      {
        number: 2,
        text: [
          'Jezi renmen m, li mouri,',
          'Pou louvri pòt syèl la ban mwen;',
          'L ap lave tout peche mwen yo,',
          'L ap kite ti pitit li antre!'
        ]
      }
    ],
    chorus: [
      'Wi, Jezi renmen m!',
      'Wi, Jezi renmen m!',
      'Wi, Jezi renmen m!',
      'Labib di mwen sa!'
    ]
  },
  {
    id: 'ce-kr-25',
    number: 25,
    title: 'Pran lavi mwen, pran li nèt',
    titleKr: 'Pran lavi mwen, pran li nèt',
    section: "Chants d'Espérance Créole",
    sectionCode: 'CE_KR',
    author: 'Frances R. Havergal (1874) / Traduction haïtienne',
    category: 'consecration',
    copyrightStatus: 'Domaine public',
    keySignature: 'Fa Majeur (F)',
    tempo: 'Konsèkrasyon sensè',
    verses: [
      {
        number: 1,
        text: [
          'Pran lavi mwen, pran li nèt,',
          'Mwen konsakre l ba ou, Mèt;',
          'Pran tout moman ak tout jou m yo,',
          'Pou yo pase nan lwanj ou!'
        ]
      },
      {
        number: 2,
        text: [
          'Pran de men mwen, pou yo fè',
          'Sa ki fè ou plezi, Senyè;',
          'Pran de pye mwen, pou yo mache',
          'Nan chemen ou te trase a!'
        ]
      }
    ],
    chorus: [
      'Pran mwen, Jezi, se pou ou m ye,',
      'Pou tout tan e pou lavi;',
      'Kè mwen se fotèy wayal ou,',
      'Gouvène sou tout vi mwen!'
    ]
  },
  {
    id: 'ce-kr-32',
    number: 32,
    title: 'Mwen gen yon bon zanmi',
    titleKr: 'Mwen gen yon bon zanmi',
    section: "Chants d'Espérance Créole",
    sectionCode: 'CE_KR',
    author: 'Tradition évangélique haïtienne / Domaine public',
    category: 'foi',
    copyrightStatus: 'Domaine public',
    keySignature: 'Fa Majeur (F)',
    tempo: 'Dous e plen lapè',
    verses: [
      {
        number: 1,
        text: [
          'Mwen gen yon bon zanmi nan Jezi,',
          'Li toujou prèt pou l tande mwen,',
          'Pou l reponn lè m ap rele l,',
          'Li konnen tout feblès mwen yo.',
          'Tout chay ki twò lou pou mwen,',
          'Mwen depoze yo nan pye li,',
          'Paske li renmen mwen anpil.'
        ]
      },
      {
        number: 2,
        text: [
          'Lè lapenn ap peze kè mwen,',
          'Mwen jwenn konsolasyon nan Li;',
          'Lè lènmi vle kraze lafwa m,',
          'Jezi kanpe pou defann mwen.',
          'Gras li sifi pou tout lavi m,',
          'M ap fè l konfyans jiska lafen!'
        ]
      }
    ]
  },
  {
    id: 'ce-kr-44',
    number: 44,
    title: 'Ala yon bèl peyi ki genyen',
    titleKr: 'Ala yon bèl peyi ki genyen',
    section: "Chants d'Espérance Créole",
    sectionCode: 'CE_KR',
    author: 'Sanford F. Bennett / Joseph P. Webster (1868)',
    category: 'esperance',
    copyrightStatus: 'Domaine public',
    keySignature: 'Sol Majeur (G)',
    tempo: 'Espwa syèl la',
    verses: [
      {
        number: 1,
        text: [
          'Gen yon bèl peyi kote nou prale,',
          'Ak je lafwa nou ka wè li byen lwen;',
          'Kote Papa nou an ap tann nou tout,',
          'Li prepare yon bèl kay pou nou la.'
        ]
      },
      {
        number: 2,
        text: [
          'Nou va chante sou bèl rivaj sa a,',
          'Bèl chante tout moun ki sove yo;',
          'Kè nou p ap janm nan lapenn ankò,',
          'Okenn soupi p ap janm soti nan bouch nou.'
        ]
      }
    ],
    chorus: [
      'Pita, talè konsa,',
      'Nou va kontre sou bèl rivaj la;',
      'Pita, talè konsa,',
      'Nou va reyini ansanm ak Jezi!'
    ]
  },
  {
    id: 'ce-kr-75',
    number: 75,
    title: 'Kris la resisite vre',
    titleKr: 'Kris la resisite vre',
    section: "Chants d'Espérance Créole",
    sectionCode: 'CE_KR',
    author: 'Charles Wesley (1739) / Traduction créole',
    category: 'paques',
    copyrightStatus: 'Domaine public',
    keySignature: 'Do Majeur (C)',
    tempo: 'Triyonf ak viktwa',
    verses: [
      {
        number: 1,
        text: [
          'Kris la resisite vre, Alelouya!',
          'Se yon jou viktwa pou nou, Alelouya!',
          'Li kraze pouvwa lanmò, Alelouya!',
          'Tonbo a vid, li vivan, Alelouya!'
        ]
      },
      {
        number: 2,
        text: [
          'Jezi vivan pou tout tan, Alelouya!',
          'Li se Wa ki gen tout glwa, Alelouya!',
          'Se li menm ki Sovè nou, Alelouya!',
          'Nou va viv avè l nan syèl, Alelouya!'
        ]
      }
    ]
  },

  // --- MÉLODIES JOYEUSES (MELODIES_FR & MELODIES_KR) ---
  {
    id: 'mj-fr-1',
    number: 1,
    title: 'Vers le ciel, vers le ciel',
    titleKr: 'Nan direksyon syèl la',
    section: 'Mélodies Joyeuses Français',
    sectionCode: 'MELODIES_FR',
    author: 'Recueil évangélique / Domaine public',
    category: 'esperance',
    copyrightStatus: 'Domaine public',
    keySignature: 'Fa Majeur (F)',
    tempo: 'Joyeux et rythmé',
    verses: [
      {
        number: 1,
        text: [
          'Vers le ciel, vers le ciel, j\'ai tourné mes regards,',
          'Car là-haut est mon doux pays;',
          'Où Jésus mon Sauveur a dressé mon rempart,',
          'Dans son glorieux paradis.'
        ]
      },
      {
        number: 2,
        text: [
          'Ici-bas pèlerin, voyageur étranger,',
          'Je poursuis ma route avec foi;',
          'Car Jésus est fidèle, Il sait me protéger,',
          'Et marcher toujours près de moi.'
        ]
      }
    ],
    chorus: [
      'Vers le ciel, je m\'avance,',
      'Rempli d\'une sainte espérance!',
      'Bientôt chez mon Sauveur,',
      'Je goûterai le vrai bonheur!'
    ]
  },
  {
    id: 'mj-fr-14',
    number: 14,
    title: 'Joyeux anniversaire avec Jésus',
    titleKr: 'Bòn fèt anba gras Jezi',
    section: 'Mélodies Joyeuses Français',
    sectionCode: 'MELODIES_FR',
    author: 'Cantique pour enfants et célébration / Domaine public',
    category: 'enfants',
    copyrightStatus: 'Domaine public',
    keySignature: 'Sol Majeur (G)',
    tempo: 'Fête et joie',
    verses: [
      {
        number: 1,
        text: [
          'Qu\'en ce jour de fête et de paix,',
          'Dieu répande sur toi ses bienfaits;',
          'Que sa sainte parole éclaire tes pas,',
          'Et qu\'Il veille toujours sur toi!'
        ]
      }
    ],
    chorus: [
      'Joyeux anniversaire!',
      'Sous la grâce du Père!',
      'Que Jésus te bénisse,',
      'Et te garde pour toujours!'
    ]
  },
  {
    id: 'mj-kr-8',
    number: 8,
    title: 'Mwen se yon ti mouton Jezi',
    titleKr: 'Mwen se yon ti mouton Jezi',
    section: 'Mélodies Joyeuses Créole',
    sectionCode: 'MELODIES_KR',
    author: 'Chant d\'enfants haïtien / Domaine public',
    category: 'enfants',
    copyrightStatus: 'Domaine public',
    keySignature: 'Do Majeur (C)',
    tempo: 'Lejè ak senp',
    verses: [
      {
        number: 1,
        text: [
          'Mwen se yon ti mouton Jezi,',
          'Li se Bon Gadò mwen;',
          'Li mennen m bò kote dlo fre,',
          'Li pwoteje lavi m chak jou!'
        ]
      }
    ],
    chorus: [
      'Mwen pa pè anyen bò kote Jezi,',
      'Li renmen ti mouton l yo!',
      'M ap chante pou li tout lajounen,',
      'Paske li pran swen mwen!'
    ]
  },

  // --- RÉVEILLONS-NOUS & HAÏTI CHANTE ---
  {
    id: 'rn-1',
    number: 1,
    title: 'Réveillons-nous, le jour s\'apprête',
    titleKr: 'Leve non, solèy la leve',
    section: 'Réveillons-Nous Chrétiens',
    sectionCode: 'REVEILLONS_NOUS',
    author: 'Chant de réveil / Domaine public',
    category: 'priere',
    copyrightStatus: 'Domaine public',
    keySignature: 'Fa Majeur (F)',
    tempo: 'Vigoureux',
    verses: [
      {
        number: 1,
        text: [
          'Réveillons-nous, le jour s\'apprête,',
          'Voici l\'Époux qui va venir!',
          'Chrétiens, levez bien haut la tête,',
          'C\'est l\'heure de se réjouir!'
        ]
      },
      {
        number: 2,
        text: [
          'Remplissons nos lampes d\'huile,',
          'Veillons et prions sans faiblir;',
          'La grâce divine scintille,',
          'Jésus vient bientôt nous ravir!'
        ]
      }
    ]
  },
  {
    id: 'hcrl-5',
    number: 5,
    title: 'Nan pye Jezi m vle chita',
    titleKr: 'Nan pye Jezi m vle chita',
    section: 'Haïti Chante avec Radio Lumière',
    sectionCode: 'HAITI_CHANTE',
    author: 'Radio Lumière Haïti / Domaine public',
    category: 'consecration',
    copyrightStatus: 'Domaine public',
    keySignature: 'Ré Majeur (D)',
    tempo: 'Lapriyè ak adorasyon',
    verses: [
      {
        number: 1,
        text: [
          'Nan pye Jezi m vle chita,',
          'Pou m koute pawòl li;',
          'Se la sèlman mwen jwenn lapè,',
          'Pou lespri m ak tout kè m.',
          'Mwen livre tout vi m ba li,',
          'Pou l ka itilize m.'
        ]
      },
      {
        number: 2,
        text: [
          'Nan pye Jezi m jwenn kouraj,',
          'Pou m kontinye batay;',
          'Li pran men m, li gide pa m,',
          'Nan mitan tout eprèv.',
          'M p ap janm separe avè l,',
          'Se li ki Sovè mwen!'
        ]
      }
    ],
    chorus: [
      'Wi nan pye li, nan pye Jezi,',
      'Mwen jwenn padon, mwen jwenn lavi;',
      'Tout sa m ye, tout sa m posede,',
      'Mwen lage yo nan pye Jezi!'
    ]
  },
  {
    id: 'hcrl-18',
    number: 18,
    title: 'Travay pou Jezi, jou a prèt pou fini',
    titleKr: 'Travay pou Jezi, jou a prèt pou fini',
    section: 'Haïti Chante avec Radio Lumière',
    sectionCode: 'HAITI_CHANTE',
    author: 'Anna L. Coghill (1854) / Lowell Mason',
    category: 'louange',
    copyrightStatus: 'Domaine public',
    keySignature: 'Fa Majeur (F)',
    tempo: 'Zèl ak enèji',
    verses: [
      {
        number: 1,
        text: [
          'Travay pou Jezi depi nan granmmaten,',
          'Travay toutotan solèy la klere;',
          'Lannwit ap vini kote pèsonn p ap ka travay,',
          'Se pou nou fè tout sa nou kapab kounye a!'
        ]
      }
    ],
    chorus: [
      'Travay pou Jezi! Travay ak kè kontan!',
      'Rekonpans la ap vini nan syèl la;',
      'Tout moun ki te fidèl va antre nan repo,',
      'Ak Jezi Senyè nou an!'
    ]
  },
  {
    id: 'vr-7',
    number: 7,
    title: 'Saint-Esprit, descends sur nous',
    titleKr: 'Sentespri, desann sou nou',
    section: 'La Voix du Réveil',
    sectionCode: 'VOIX_DU_REVEIL',
    author: 'Chant évangélique de prière / Domaine public',
    category: 'priere',
    copyrightStatus: 'Domaine public',
    keySignature: 'Mi Bémol (Eb)',
    tempo: 'Supplication solennelle',
    verses: [
      {
        number: 1,
        text: [
          'Saint-Esprit, descends sur nous,',
          'Remplis nos cœurs de ta flamme;',
          'Nous t\'attendons à genoux,',
          'Viens sanctifier notre âme!'
        ]
      }
    ],
    chorus: [
      'Descends, Esprit de Dieu!',
      'Rends témoignage en nous;',
      'Fais briller ton saint feu,',
      'Rends-nous purs et fidèles!'
    ]
  },

  // --- NOUVO KÈ & CHŒURS DE LOUANGE ---
  {
    id: 'nouvo-ke-1',
    number: 1,
    title: 'Ala yon bèl Sovè mwen genyen',
    titleKr: 'Ala yon bèl Sovè mwen genyen',
    section: 'Nouvo Kè & Chœurs de Louange',
    sectionCode: 'NOUVO_KE',
    author: 'Chœur traditionnel haïtien / Domaine public',
    category: 'louange',
    copyrightStatus: 'Domaine public',
    keySignature: 'Sol Majeur (G)',
    tempo: 'Lafwa ak lajwa',
    verses: [
      {
        number: 1,
        text: [
          'Ala yon bèl Sovè mwen genyen,',
          'Li pa janm kite m poukont mwen;',
          'Nan lajwa kou nan lafliksyon,',
          'Jezi toujou la bò kote m.',
          'Lwanj pou Non li! Glwa pou Non li!',
          'Li se tout espwa m sou latè.'
        ]
      }
    ],
    chorus: [
      'Jezi vivan, li pa nan tonbo a ankò!',
      'Li gen tout pouvwa nan men li;',
      'M ap chante pou li tout lajounen,',
      'Paske li sove nanm mwen!'
    ]
  },
  {
    id: 'nouvo-ke-2',
    number: 2,
    title: 'Bondye ou fidèl, ou pa janm chanje',
    titleKr: 'Bondye ou fidèl, ou pa janm chanje',
    section: 'Nouvo Kè & Chœurs de Louange',
    sectionCode: 'NOUVO_KE',
    author: 'Chœur de réveil haïtien / Domaine public',
    category: 'adoration',
    copyrightStatus: 'Domaine public',
    keySignature: 'Fa Majeur (F)',
    tempo: 'Adorasyon pwofon',
    verses: [
      {
        number: 1,
        text: [
          'Bondye ou fidèl, ou pa janm chanje,',
          'Sa ou di w ap fè, ou toujou fè l;',
          'Syèl la ak tè a kapab pase,',
          'Men pawòl ou rete la pou tout tan!'
        ]
      }
    ],
    chorus: [
      'Ou fidèl, Senyè! Ou fidèl!',
      'Fidelite w depase tout sa nou ka konprann;',
      'Chak maten gras ou renouvle nan lavi nou,',
      'Lwanj pou Non ou ki sen!'
    ]
  },
  {
    id: 'nouvo-ke-3',
    number: 3,
    title: 'Mwen pa poukont mwen, Jezi mache avè m',
    titleKr: 'Mwen pa poukont mwen, Jezi mache avè m',
    section: 'Nouvo Kè & Chœurs de Louange',
    sectionCode: 'NOUVO_KE',
    author: 'Chœur de combat spirituel / Domaine public',
    category: 'combat_spirituel',
    copyrightStatus: 'Domaine public',
    keySignature: 'Ré Majeur (D)',
    tempo: 'Konviksyon ak fòs',
    verses: [
      {
        number: 1,
        text: [
          'Mwen pa poukont mwen, Jezi mache avè m,',
          'Nan dife kou nan dlo, l ap kenbe men mwen;',
          'Menm si satan ta vle fè mwen pè,',
          'Mwen konnen Senyè a gen dènye mo a!'
        ]
      }
    ],
    chorus: [
      'Viktwa a se pou mwen nan Jezikri!',
      'Okenn zam lènmi p ap ka kanpe devan m;',
      'Mwen kache anba san Ti Mouton an,',
      'Jezi se fòs mwen ak ranpa mwen!'
    ]
  }
];
