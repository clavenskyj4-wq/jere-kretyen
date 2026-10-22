import { BIBLE_BOOKS } from '../data/bibleBooks';
import { STATIC_QUIZ_QUESTIONS, generateDynamicBookQuestion } from '../data/bibleQuizData';
import { QuizCategory, QuizDifficulty, QuizQuestion, QuizSessionStats } from '../types';

const STATS_KEY = 'jere_kretyen_quiz_stats';

class QuizService {
  // Get stored statistics
  getStats(): QuizSessionStats {
    try {
      const stored = localStorage.getItem(STATS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return {
      totalAnswered: 0,
      correctCount: 0,
      bestStreak: 0,
      currentStreak: 0,
      completedCategories: [],
      lastPlayed: Date.now(),
    };
  }

  // Update statistics after an answered question
  recordAnswer(isCorrect: boolean, category: QuizCategory): QuizSessionStats {
    const stats = this.getStats();
    stats.totalAnswered += 1;
    if (isCorrect) {
      stats.correctCount += 1;
      stats.currentStreak += 1;
      if (stats.currentStreak > stats.bestStreak) {
        stats.bestStreak = stats.currentStreak;
      }
      if (!stats.completedCategories.includes(category)) {
        stats.completedCategories.push(category);
      }
    } else {
      stats.currentStreak = 0;
    }
    stats.lastPlayed = Date.now();

    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch {
      // ignore
    }
    return stats;
  }

  // Generate a dynamic session of N questions (mixed or filtered)
  getQuestionsSession(options: {
    category?: QuizCategory;
    difficulty?: QuizDifficulty;
    count?: number;
    bookId?: string;
  } = {}): QuizQuestion[] {
    const { category = 'all', difficulty = 'all', count = 10, bookId } = options;

    let pool = [...STATIC_QUIZ_QUESTIONS];

    // Filter by category
    if (category !== 'all') {
      pool = pool.filter(q => q.category === category);
    }

    // Filter by difficulty
    if (difficulty !== 'all') {
      pool = pool.filter(q => q.difficulty === difficulty);
    }

    // Filter by specific book if requested
    if (bookId) {
      pool = pool.filter(q => q.bookId === bookId);
    }

    // Shuffle static questions
    pool = pool.sort(() => 0.5 - Math.random());

    // Dynamic questions are only suitable for an unfiltered session.
    const neededDynamic = category === 'all' ? Math.max(0, count - pool.length) : 0;
    const dynamicQuestions: QuizQuestion[] = [];

    // Sample random books from 66 books
    const shuffledBooks = [...BIBLE_BOOKS].sort(() => 0.5 - Math.random());
    for (let i = 0; i < neededDynamic + 4; i++) {
      const book = shuffledBooks[i % shuffledBooks.length];
      const dynQ = generateDynamicBookQuestion(
        book.id,
        book.nameFr,
        book.nameKr,
        book.chaptersCount,
        book.testament
      );
      dynamicQuestions.push(dynQ);
    }

    // Combine pool + dynamic questions
    const combined = [...pool, ...dynamicQuestions].sort(() => 0.5 - Math.random());

    // Shuffle options for each question so the correct index varies
    const preparedQuestions = combined.slice(0, count).map(q => {
      // create paired options
      const pairs = q.optionsFr.map((fr, idx) => ({
        fr,
        kr: q.optionsKr[idx] || fr,
        isCorrect: idx === q.correctIndex,
      }));

      // Shuffle pairs
      const shuffledPairs = pairs.sort(() => 0.5 - Math.random());
      const newCorrectIndex = shuffledPairs.findIndex(p => p.isCorrect);

      return {
        ...q,
        optionsFr: shuffledPairs.map(p => p.fr),
        optionsKr: shuffledPairs.map(p => p.kr),
        correctIndex: newCorrectIndex,
      };
    });

    return preparedQuestions;
  }

  // Reset user training stats
  resetStats(): void {
    try {
      localStorage.removeItem(STATS_KEY);
    } catch {
      // ignore
    }
  }
}

export const quizService = new QuizService();
