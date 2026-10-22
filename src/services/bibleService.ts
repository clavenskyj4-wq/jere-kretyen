import { BIBLE_BOOKS } from '../data/bibleBooks';
import { DAILY_VERSES, getTodayVerse } from '../data/dailyVerses';
import { OFFLINE_BIBLE_CHAPTERS } from '../data/sampleBibleText';
import { BibleBook, ChapterData, DailyVerse, Language, Testament, Verse } from '../types';

export interface SearchResult {
  book: BibleBook;
  chapter: number;
  verse: number;
  text: string;
  textKr?: string;
}

interface HaitianBibleBook {
  abbrev: string;
  name: string;
  chapters: string[][];
}

class BibleService {
  private cache: Map<string, ChapterData> = new Map();
  private haitianBibleData: HaitianBibleBook[] | null = null;
  private loadingHaitianPromise: Promise<HaitianBibleBook[] | null> | null = null;

  constructor() {
    // Pre-populate cache with built-in chapters
    Object.entries(OFFLINE_BIBLE_CHAPTERS).forEach(([key, data]) => {
      this.cache.set(key, data);
    });
  }

  // Load the complete 66-book Haitian Creole Bible
  private async getHaitianBible(): Promise<HaitianBibleBook[] | null> {
    if (this.haitianBibleData) return this.haitianBibleData;
    if (this.loadingHaitianPromise) return this.loadingHaitianPromise;

    this.loadingHaitianPromise = (async () => {
      try {
        const res = await fetch('/data/bible_ht.json');
        if (res.ok) {
          const json = await res.json();
          this.haitianBibleData = json;
          return json;
        }
      } catch (e) {
        console.warn('Could not load local bible_ht.json', e);
      }
      return null;
    })();

    return this.loadingHaitianPromise;
  }

  // Get Haitian Creole text for a specific book, chapter and verse
  private getCreoleVerseText(
    htBible: HaitianBibleBook[] | null,
    bookNumber: number,
    chapter: number,
    verse: number
  ): string | undefined {
    if (!htBible) return undefined;
    const bookIndex = bookNumber - 1;
    if (bookIndex < 0 || bookIndex >= htBible.length) return undefined;

    const book = htBible[bookIndex];
    const chapterIndex = chapter - 1;
    if (chapterIndex < 0 || chapterIndex >= book.chapters.length) return undefined;

    const verseIndex = verse - 1;
    const ch = book.chapters[chapterIndex];
    if (verseIndex < 0 || verseIndex >= ch.length) return undefined;

    return ch[verseIndex];
  }

  // Get all books, optionally filtered by testament
  getLivres(testament?: Testament): BibleBook[] {
    if (!testament) return BIBLE_BOOKS;
    return BIBLE_BOOKS.filter(b => b.testament === testament);
  }

  // Get single book by ID or abbreviation
  getLivreById(bookId: string): BibleBook | undefined {
    return BIBLE_BOOKS.find(
      b => b.id.toUpperCase() === bookId.toUpperCase() || 
           b.shortNameFr.toLowerCase() === bookId.toLowerCase() ||
           b.shortNameKr.toLowerCase() === bookId.toLowerCase()
    );
  }

  // Get single book by name query
  findBookByName(query: string): BibleBook | undefined {
    const q = query.trim().toLowerCase();
    return BIBLE_BOOKS.find(b => 
      b.nameFr.toLowerCase().includes(q) || 
      b.nameKr.toLowerCase().includes(q) ||
      b.shortNameFr.toLowerCase() === q ||
      b.shortNameKr.toLowerCase() === q
    );
  }

  // Get Chapter data with BOTH French Louis Segond 1910 AND Haitian Creole verses
  async getChapitre(bookId: string, chapter: number): Promise<ChapterData> {
    const key = `${bookId.toUpperCase()}_${chapter}`;
    const book = this.getLivreById(bookId);
    const htBible = await this.getHaitianBible();

    // 1. Check in-memory cache
    if (this.cache.has(key)) {
      const cached = this.cache.get(key)!;
      // Ensure Haitian Creole is filled
      if (book && htBible) {
        cached.verses.forEach(v => {
          if (!v.textKr) {
            v.textKr = this.getCreoleVerseText(htBible, book.number, chapter, v.verse);
          }
        });
      }
      return cached;
    }

    // 2. Check localStorage
    try {
      const localData = localStorage.getItem(`bible_chapter_${key}`);
      if (localData) {
        const parsed: ChapterData = JSON.parse(localData);
        if (parsed.verses && parsed.verses.length > 0) {
          if (book && htBible) {
            parsed.verses.forEach(v => {
              if (!v.textKr) {
                v.textKr = this.getCreoleVerseText(htBible, book.number, chapter, v.verse);
              }
            });
          }
          this.cache.set(key, parsed);
          return parsed;
        }
      }
    } catch {
      // ignore
    }

    // 3. Fetch French Louis Segond 1910 text via Bolls API (FRLSG)
    if (book) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const response = await fetch(
          `https://bolls.life/get-chapter/FRLSG/${book.number}/${chapter}/`,
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);

        if (response.ok) {
          const apiJson = await response.json();
          if (Array.isArray(apiJson) && apiJson.length > 0) {
            const verses: Verse[] = apiJson.map((item: { verse: number; text: string }) => {
              const cleanText = item.text
                .replace(/<[^>]*>/g, '')
                .replace(/&nbsp;/g, ' ')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .trim();

              const creoleText = this.getCreoleVerseText(htBible, book.number, chapter, item.verse);

              return {
                verse: item.verse,
                text: cleanText,
                textKr: creoleText,
              };
            });

            const chapterData: ChapterData = {
              bookId: book.id,
              chapter,
              translation: 'LSG1910',
              verses,
            };

            this.cache.set(key, chapterData);
            try {
              localStorage.setItem(`bible_chapter_${key}`, JSON.stringify(chapterData));
            } catch {
              // Local storage quota exceeded
            }
            return chapterData;
          }
        }
      } catch (e) {
        console.warn('Network fetch error for chapter:', e);
      }
    }

    // 4. Fallback to Haitian Bible alone if offline and no LSG cached yet
    if (book && htBible) {
      const bookIndex = book.number - 1;
      const chIndex = chapter - 1;
      if (bookIndex >= 0 && bookIndex < htBible.length && chIndex >= 0 && chIndex < htBible[bookIndex].chapters.length) {
        const chVerses = htBible[bookIndex].chapters[chIndex];
        const verses: Verse[] = chVerses.map((krText, idx) => ({
          verse: idx + 1,
          text: `[LSG 1910 ${book.nameFr} ${chapter}:${idx + 1}]`,
          textKr: krText,
        }));

        const chData: ChapterData = {
          bookId: book.id,
          chapter,
          translation: 'LSG1910',
          verses,
        };
        this.cache.set(key, chData);
        return chData;
      }
    }

    // 5. Pre-cached offline fallback
    if (OFFLINE_BIBLE_CHAPTERS[key]) {
      return OFFLINE_BIBLE_CHAPTERS[key];
    }

    return {
      bookId: book?.id || bookId,
      chapter,
      translation: 'LSG1910',
      verses: [
        {
          verse: 1,
          text: `Lecture de ${book?.nameFr || bookId} chapitre ${chapter} (Louis Segond 1910).`,
          textKr: `Lekti nan ${book?.nameKr || bookId} chapit ${chapter} (Kreyòl Ayisyen).`,
        }
      ],
    };
  }

  // Search by reference or keyword across French AND Haitian Creole
  searchVerses(query: string, lang: Language): SearchResult[] {
    const q = query.trim().toLowerCase();
    if (!q || q.length < 2) return [];

    const results: SearchResult[] = [];

    // Check reference query like "Jean 3:16" or "Jan 3"
    const refMatch = q.match(/^([a-zà-ÿ0-9\s]+?)\s*(\d+)(?::(\d+))?$/i);
    if (refMatch) {
      const bookQuery = refMatch[1].trim();
      const chapterNum = parseInt(refMatch[2], 10);
      const verseNum = refMatch[3] ? parseInt(refMatch[3], 10) : undefined;

      const book = this.findBookByName(bookQuery);
      if (book) {
        const key = `${book.id}_${chapterNum}`;
        const chapterData = this.cache.get(key) || OFFLINE_BIBLE_CHAPTERS[key];
        if (chapterData) {
          chapterData.verses.forEach(v => {
            if (!verseNum || v.verse === verseNum) {
              results.push({
                book,
                chapter: chapterNum,
                verse: v.verse,
                text: v.text,
                textKr: v.textKr
              });
            }
          });
        }
      }
    }

    // Search across cached chapters
    this.cache.forEach((ch) => {
      const book = this.getLivreById(ch.bookId);
      if (!book) return;

      ch.verses.forEach(v => {
        const matchesFr = v.text.toLowerCase().includes(q);
        const matchesKr = v.textKr ? v.textKr.toLowerCase().includes(q) : false;

        if (matchesFr || matchesKr) {
          if (!results.some(r => r.book.id === book.id && r.chapter === ch.chapter && r.verse === v.verse)) {
            results.push({
              book,
              chapter: ch.chapter,
              verse: v.verse,
              text: v.text,
              textKr: v.textKr,
            });
          }
        }
      });
    });

    // Also search daily verses collection
    DAILY_VERSES.forEach(dv => {
      const book = this.getLivreById(dv.bookId);
      if (!book) return;

      const matchesFr = dv.textFr.toLowerCase().includes(q) || dv.themeFr.toLowerCase().includes(q);
      const matchesKr = dv.textKr.toLowerCase().includes(q) || dv.themeKr.toLowerCase().includes(q);

      if (matchesFr || matchesKr) {
        if (!results.some(r => r.book.id === book.id && r.chapter === dv.chapter && r.verse === dv.verse)) {
          results.push({
            book,
            chapter: dv.chapter,
            verse: dv.verse,
            text: dv.textFr,
            textKr: dv.textKr
          });
        }
      }
    });

    return results.slice(0, 30);
  }

  getVersetDuJour(): DailyVerse {
    return getTodayVerse();
  }

  async downloadCoreChapters(onProgress?: (progress: number) => void): Promise<number> {
    const keys = Object.keys(OFFLINE_BIBLE_CHAPTERS);
    let count = 0;
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const data = OFFLINE_BIBLE_CHAPTERS[key];
      try {
        localStorage.setItem(`bible_chapter_${key}`, JSON.stringify(data));
        count++;
      } catch {
        // quota limit
      }
      if (onProgress) {
        onProgress(Math.round(((i + 1) / keys.length) * 100));
      }
    }
    return count;
  }
}

export const bibleService = new BibleService();
