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
        const res = await fetch(`${import.meta.env.BASE_URL}data/bible_ht.json`);
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

  private hasFrenchText(chapter: ChapterData): boolean {
    return chapter.verses.some(
      verse => verse.text.trim().length > 0 && !verse.text.trim().startsWith('[LSG 1910')
    );
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
      if (this.hasFrenchText(cached)) {
        if (book && htBible) {
          cached.verses.forEach(v => {
            if (!v.textKr) {
              v.textKr = this.getCreoleVerseText(htBible, book.number, chapter, v.verse);
            }
          });
        }
        return cached;
      }
      this.cache.delete(key);
    }

    // 2. Check localStorage
    try {
      const localData = localStorage.getItem(`bible_chapter_${key}`);
      if (localData) {
        const parsed: ChapterData = JSON.parse(localData);
        if (parsed.verses && parsed.verses.length > 0 && this.hasFrenchText(parsed)) {
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
        localStorage.removeItem(`bible_chapter_${key}`);
      }
    } catch {
      // ignore
    }

    // 3. Fetch French Louis Segond 1910 text via Bolls API (FRLSG)
    if (book) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        try {
          const response = await fetch(
            `https://bolls.life/get-chapter/FRLSG/${book.number}/${chapter}/`,
            { signal: controller.signal }
          );

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

              if (this.hasFrenchText(chapterData)) {
                this.cache.set(key, chapterData);
                try {
                  localStorage.setItem(`bible_chapter_${key}`, JSON.stringify(chapterData));
                } catch {
                  // Local storage quota exceeded
                }
                return chapterData;
              }
            }
          }
        } finally {
          clearTimeout(timeoutId);
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
          text: '',
          textKr: krText,
        }));

        const chData: ChapterData = {
          bookId: book.id,
          chapter,
          translation: 'LSG1910',
          verses,
        };
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
        // An empty chapter lets the reader explain that it could not be loaded
        // instead of presenting a status message as if it were a Bible verse.
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

  async searchVersesGlobal(
    query: string,
    lang: Language,
    signal?: AbortSignal
  ): Promise<SearchResult[]> {
    const q = query.trim();
    if (q.length < 2) return [];

    const refMatch = q.match(/^([a-zà-ÿ0-9\s]+?)\s*(\d+)(?::(\d+))?$/i);
    if (refMatch) {
      const book = this.findBookByName(refMatch[1]);
      if (book) {
        const chapterNumber = Number(refMatch[2]);
        const verseNumber = refMatch[3] ? Number(refMatch[3]) : undefined;
        if (chapterNumber > 0 && chapterNumber <= book.chaptersCount) {
          const chapter = await this.getChapitre(book.id, chapterNumber);
          const matches = chapter.verses
            .filter(verse => !verseNumber || verse.verse === verseNumber)
            .map(verse => ({
              book,
              chapter: chapterNumber,
              verse: verse.verse,
              text: verse.text,
              textKr: verse.textKr,
            }));
          if (matches.length > 0) return matches.slice(0, 30);
        }
      }
    }

    const localResults = this.searchVerses(q, lang);
    if (lang === 'kr') {
      const htBible = await this.getHaitianBible();
      if (htBible) {
        const normalizedQuery = q.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const creoleResults: SearchResult[] = [];
        htBible.forEach((bookData, bookIndex) => {
          const book = BIBLE_BOOKS[bookIndex];
          if (!book) return;
          bookData.chapters.forEach((verses, chapterIndex) => {
            verses.forEach((textKr, verseIndex) => {
              const normalizedText = textKr.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
              if (normalizedText.includes(normalizedQuery)) {
                const cachedVerse = this.cache.get(`${book.id}_${chapterIndex + 1}`)
                  ?.verses.find(verse => verse.verse === verseIndex + 1);
                creoleResults.push({
                  book,
                  chapter: chapterIndex + 1,
                  verse: verseIndex + 1,
                  text: cachedVerse?.text || '',
                  textKr,
                });
              }
            });
          });
        });
        if (creoleResults.length > 0) return creoleResults.slice(0, 30);
      }
    }
    if (typeof navigator !== 'undefined' && !navigator.onLine) return localResults;

    try {
      const response = await fetch(
        `https://bolls.life/find/FRLSG/${encodeURIComponent(q)}/`,
        { signal }
      );
      if (!response.ok) throw new Error(`Bible search failed with status ${response.status}`);
      const matches = await response.json() as Array<{ book: number; chapter: number; verse: number; text: string }>;
      if (!Array.isArray(matches)) throw new Error('Bible search returned an invalid response');

      const htBible = await this.getHaitianBible();
      const results = matches.flatMap((match) => {
        const book = BIBLE_BOOKS.find(candidate => candidate.number === match.book);
        if (!book) return [];
        const cachedChapter = this.cache.get(`${book.id}_${match.chapter}`);
        const cachedVerse = cachedChapter?.verses.find(verse => verse.verse === match.verse);
        const textKr = cachedVerse?.textKr ||
          this.getCreoleVerseText(htBible, book.number, match.chapter, match.verse);
        return [{
          book,
          chapter: match.chapter,
          verse: match.verse,
          text: match.text.replace(/<[^>]*>/g, '').trim(),
          textKr,
        }];
      });
      const combined: SearchResult[] = [...results];
      localResults.forEach((localResult) => {
        if (!combined.some(result =>
          result.book.id === localResult.book.id &&
          result.chapter === localResult.chapter &&
          result.verse === localResult.verse
        )) {
          combined.push(localResult);
        }
      });
      return combined.slice(0, 30);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') throw error;
      console.warn('Online Bible search failed; showing local results instead.', error);
      return localResults;
    }
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
