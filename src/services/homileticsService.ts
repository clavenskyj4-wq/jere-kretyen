import { SAMPLE_TEACHING_SERMON } from '../data/homileticsData';
import { SermonDraft, SermonType } from '../types';

const SERMONS_STORAGE_KEY = 'jere_kretyen_sermons_drafts';

class HomileticsService {
  // Get all drafts
  getSermons(): SermonDraft[] {
    try {
      const stored = localStorage.getItem(SERMONS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    // Return sample draft if empty
    return [SAMPLE_TEACHING_SERMON];
  }

  // Get sermon by ID
  getSermonById(id: string): SermonDraft | undefined {
    const list = this.getSermons();
    return list.find(s => s.id === id);
  }

  // Save sermon draft
  saveSermon(draft: SermonDraft): SermonDraft {
    const list = this.getSermons();
    const index = list.findIndex(s => s.id === draft.id);
    const updatedDraft: SermonDraft = {
      ...draft,
      updatedAt: Date.now(),
    };

    if (index >= 0) {
      list[index] = updatedDraft;
    } else {
      list.unshift(updatedDraft);
    }

    try {
      localStorage.setItem(SERMONS_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Failed to save sermon draft', e);
    }

    return updatedDraft;
  }

  // Delete sermon draft
  deleteSermon(id: string): void {
    const list = this.getSermons().filter(s => s.id !== id);
    try {
      localStorage.setItem(SERMONS_STORAGE_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }
  }

  // Create new blank draft with guided scaffolding
  createNewDraft(options?: {
    type?: SermonType;
    bookId?: string;
    chapter?: number;
    referenceText?: string;
    title?: string;
    theme?: string;
  }): SermonDraft {
    const type = options?.type || 'expositif';
    const bookId = options?.bookId || 'JHN';
    const chapter = options?.chapter || 3;
    const referenceText = options?.referenceText || 'Jean 3:1-16 / Jan 3:1-16';
    const title = options?.title || (type === 'meditation' ? 'Nouvelle Méditation' : 'Nouveau Message');
    const theme = options?.theme || '';

    return {
      id: `sermon-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title,
      theme,
      type,
      primaryPassage: {
        bookId,
        chapter,
        referenceText,
      },
      audience: 'Assemblée du dimanche / Groupe d\'étude biblique',
      bigIdea: '',
      introduction: {
        hook: '',
        needOrProblem: '',
        context: '',
      },
      observationNotes: {
        who: '',
        whereWhen: '',
        keywords: '',
        keyThemes: '',
      },
      interpretationNotes: {
        originalMeaning: '',
        theologicalTruth: '',
        crossReferences: '',
      },
      points: [
        {
          id: 'point-1',
          title: 'Point 1 : ',
          scriptureRef: '',
          explanation: '',
          illustration: '',
          application: '',
        },
        {
          id: 'point-2',
          title: 'Point 2 : ',
          scriptureRef: '',
          explanation: '',
          illustration: '',
          application: '',
        },
      ],
      conclusion: {
        summary: '',
        callToAction: '',
        prayer: '',
      },
      evaluation: {
        biblicalFaithfulness: false,
        clearCentralIdea: false,
        practicalApplication: false,
        gospelCentered: false,
        timeTarget: '20-25 min',
        notes: '',
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  // Export sermon text nicely formatted for print/clipboard
  formatForExport(sermon: SermonDraft, language: 'fr' | 'kr'): string {
    const isKr = language === 'kr';
    return `
=========================================
${isKr ? 'PLAN PREDIKASYON & MEDITASYON BIBLIK' : 'PLAN DE PRÉDICATION & MÉDITATION BIBLIQUE'}
=========================================
${isKr ? 'TIT' : 'TITRE'} : ${sermon.title}
${isKr ? 'TÈM' : 'THÈME'} : ${sermon.theme || (isKr ? 'Pa espesifye' : 'Non spécifié')}
${isKr ? 'PASAJ' : 'PASSAGE'} : ${sermon.primaryPassage.referenceText}
${isKr ? 'METÒD' : 'MÉTHODE'} : ${sermon.type.toUpperCase()}
${isKr ? 'ODYANS' : 'AUDITOIRE'} : ${sermon.audience || 'Général'}

-----------------------------------------
${isKr ? '1. IDE SANTRAL LA (BIG IDEA)' : '1. IDÉE CENTRALE (BIG IDEA)'}
-----------------------------------------
${sermon.bigIdea || (isKr ? '(Poko ranpli)' : '(Non renseignée)')}

-----------------------------------------
${isKr ? '2. ENTWODIKSYON' : '2. INTRODUCTION'}
-----------------------------------------
• ${isKr ? 'Akwoch' : 'Accroche'} : ${sermon.introduction.hook || '-'}
• ${isKr ? 'Pwoblèm / Bezwen' : 'Problème / Besoin'} : ${sermon.introduction.needOrProblem || '-'}
• ${isKr ? 'Kontèks istorik' : 'Contexte historique'} : ${sermon.introduction.context || '-'}

-----------------------------------------
${isKr ? '3. DEVLOPMAN (PWEN PRENSIPAL YO)' : '3. DÉVELOPPEMENT DU MESSAGE'}
-----------------------------------------
${sermon.points
  .map(
    (p, idx) => `
[${idx + 1}] ${p.title} (${p.scriptureRef || sermon.primaryPassage.referenceText})
- ${isKr ? 'Eksplikasyon' : 'Explication'} : ${p.explanation || '-'}
- ${isKr ? 'Ilistrasyon' : 'Illustration'} : ${p.illustration || '-'}
- ${isKr ? 'Aplikasyon' : 'Application'} : ${p.application || '-'}
`
  )
  .join('\n')}

-----------------------------------------
${isKr ? '4. KONKLIZYON & APÈL' : '4. CONCLUSION & APPEL'}
-----------------------------------------
• ${isKr ? 'Rezime' : 'Résumé'} : ${sermon.conclusion.summary || '-'}
• ${isKr ? 'Apèl / Desizyon' : 'Appel à l\'action'} : ${sermon.conclusion.callToAction || '-'}
• ${isKr ? 'Lapriyè' : 'Prière'} : ${sermon.conclusion.prayer || '-'}

=========================================
Jere Kretyen — Chante et vis la Parole
`;
  }
}

export const homileticsService = new HomileticsService();
