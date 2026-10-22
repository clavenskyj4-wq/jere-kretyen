import { Bookmark, Language, VerseHighlight, VerseNote } from '../types';

const STORAGE_KEYS = {
  LANG: 'jere_kretyen_lang',
  THEME: 'jere_kretyen_theme',
  BOOKMARK: 'jere_kretyen_last_bookmark',
  HIGHLIGHTS: 'jere_kretyen_highlights',
  NOTES: 'jere_kretyen_notes',
  PLAN_PROGRESS: 'jere_kretyen_plan_progress',
  FONT_SIZE: 'jere_kretyen_bible_font_size',
  OFFLINE_CHAPTERS: 'jere_kretyen_offline_chapters',
  SONG_FAVORITES: 'jere_kretyen_song_favorites',
};

export const storageService = {
  // Language
  getLanguage(): Language {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LANG);
      if (stored === 'kr' || stored === 'fr') return stored;
      // Default to French
      return 'fr';
    } catch {
      return 'fr';
    }
  },

  setLanguage(lang: Language): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LANG, lang);
    } catch (e) {
      console.warn('Failed to save language', e);
    }
  },

  // Dark Theme
  getTheme(): 'dark' | 'light' {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.THEME);
      if (stored === 'dark' || stored === 'light') return stored;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'dark';
    }
  },

  setTheme(theme: 'dark' | 'light'): void {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch (e) {
      console.warn('Failed to save theme', e);
    }
  },

  // Last Bookmark (Reprendre la lecture)
  getLastBookmark(): Bookmark {
    try {
      const item = localStorage.getItem(STORAGE_KEYS.BOOKMARK);
      if (item) return JSON.parse(item);
    } catch {
      // fallback
    }
    // Default bookmark: Jean 3
    return { bookId: 'JHN', chapter: 3, verse: 16, timestamp: Date.now() };
  },

  setLastBookmark(bookmark: Bookmark): void {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKMARK, JSON.stringify(bookmark));
    } catch (e) {
      console.warn('Failed to save bookmark', e);
    }
  },

  // Verse Highlights
  getHighlights(): VerseHighlight[] {
    try {
      const item = localStorage.getItem(STORAGE_KEYS.HIGHLIGHTS);
      if (item) return JSON.parse(item);
    } catch {
      // fallback
    }
    return [];
  },

  setHighlight(bookId: string, chapter: number, verse: number, color: VerseHighlight['color']): void {
    const list = this.getHighlights();
    const filtered = list.filter(h => !(h.bookId === bookId && h.chapter === chapter && h.verse === verse));
    filtered.push({
      id: `${bookId}_${chapter}_${verse}`,
      bookId,
      chapter,
      verse,
      color,
      updatedAt: Date.now()
    });
    try {
      localStorage.setItem(STORAGE_KEYS.HIGHLIGHTS, JSON.stringify(filtered));
    } catch (e) {
      console.warn('Failed to save highlight', e);
    }
  },

  removeHighlight(bookId: string, chapter: number, verse: number): void {
    const list = this.getHighlights().filter(h => !(h.bookId === bookId && h.chapter === chapter && h.verse === verse));
    try {
      localStorage.setItem(STORAGE_KEYS.HIGHLIGHTS, JSON.stringify(list));
    } catch (e) {
      console.warn('Failed to remove highlight', e);
    }
  },

  // Verse Notes
  getNotes(): VerseNote[] {
    try {
      const item = localStorage.getItem(STORAGE_KEYS.NOTES);
      if (item) return JSON.parse(item);
    } catch {
      // fallback
    }
    return [];
  },

  saveNote(bookId: string, chapter: number, verse: number, text: string): void {
    const list = this.getNotes().filter(n => !(n.bookId === bookId && n.chapter === chapter && n.verse === verse));
    if (text.trim()) {
      list.push({
        id: `${bookId}_${chapter}_${verse}`,
        bookId,
        chapter,
        verse,
        text: text.trim(),
        updatedAt: Date.now()
      });
    }
    try {
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(list));
    } catch (e) {
      console.warn('Failed to save note', e);
    }
  },

  deleteNote(bookId: string, chapter: number, verse: number): void {
    const list = this.getNotes().filter(n => !(n.bookId === bookId && n.chapter === chapter && n.verse === verse));
    try {
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(list));
    } catch (e) {
      console.warn('Failed to delete note', e);
    }
  },

  // Reading Plans progress
  getPlanProgress(planId: string): number[] {
    try {
      const raw = localStorage.getItem(`${STORAGE_KEYS.PLAN_PROGRESS}_${planId}`);
      if (raw) return JSON.parse(raw);
    } catch {
      // fallback
    }
    return [];
  },

  togglePlanDay(planId: string, day: number): number[] {
    const current = this.getPlanProgress(planId);
    let updated: number[];
    if (current.includes(day)) {
      updated = current.filter(d => d !== day);
    } else {
      updated = [...current, day];
    }
    try {
      localStorage.setItem(`${STORAGE_KEYS.PLAN_PROGRESS}_${planId}`, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save plan progress', e);
    }
    return updated;
  },

  // Font size setting (16px default)
  getFontSize(): number {
    try {
      const s = localStorage.getItem(STORAGE_KEYS.FONT_SIZE);
      if (s) return parseInt(s, 10);
    } catch {
      // fallback
    }
    return 18;
  },

  setFontSize(size: number): void {
    try {
      localStorage.setItem(STORAGE_KEYS.FONT_SIZE, size.toString());
    } catch (e) {
      console.warn('Failed to save font size', e);
    }
  },

  // User Profile
  getUserProfile(): import('../types').UserProfile {
    try {
      const item = localStorage.getItem('jere_kretyen_user_profile');
      if (item) return JSON.parse(item);
    } catch {
      // ignore
    }
    return {
      name: 'Pèlerin Chrétien',
      isGuest: true,
      avatar: '🕊️',
      memberSince: Date.now(),
      cloudSyncEnabled: false,
      lastSongId: 'ce-fr-1',
    };
  },

  updateUserProfile(updates: Partial<import('../types').UserProfile>): import('../types').UserProfile {
    const current = this.getUserProfile();
    const merged = { ...current, ...updates };
    try {
      localStorage.setItem('jere_kretyen_user_profile', JSON.stringify(merged));
    } catch {
      // ignore
    }
    return merged;
  },

  // Last Song visited
  getLastSongId(): string {
    return this.getUserProfile().lastSongId || 'ce-fr-1';
  },

  setLastSongId(songId: string): void {
    this.updateUserProfile({ lastSongId: songId });
  },

  // Export full user data backup (notes, highlights, favorites, playlists)
  exportBackup(): string {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      profile: this.getUserProfile(),
      highlights: this.getHighlights(),
      notes: this.getNotes(),
      plan_year: this.getPlanProgress('year'),
      plan_nt90: this.getPlanProgress('nt90'),
      plan_psalms: this.getPlanProgress('psalms_proverbs'),
      song_favorites: JSON.parse(localStorage.getItem('jere_kretyen_song_favorites') || '[]'),
      worship_lists: JSON.parse(localStorage.getItem('jere_kretyen_worship_lists') || '[]'),
    };
    return JSON.stringify(backup, null, 2);
  },

  // Restore backup
  importBackup(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.profile) localStorage.setItem('jere_kretyen_user_profile', JSON.stringify(parsed.profile));
      if (parsed.highlights) localStorage.setItem(STORAGE_KEYS.HIGHLIGHTS, JSON.stringify(parsed.highlights));
      if (parsed.notes) localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(parsed.notes));
      if (parsed.plan_year) localStorage.setItem(`${STORAGE_KEYS.PLAN_PROGRESS}_year`, JSON.stringify(parsed.plan_year));
      if (parsed.plan_nt90) localStorage.setItem(`${STORAGE_KEYS.PLAN_PROGRESS}_nt90`, JSON.stringify(parsed.plan_nt90));
      if (parsed.plan_psalms) localStorage.setItem(`${STORAGE_KEYS.PLAN_PROGRESS}_psalms_proverbs`, JSON.stringify(parsed.plan_psalms));
      if (parsed.song_favorites) localStorage.setItem('jere_kretyen_song_favorites', JSON.stringify(parsed.song_favorites));
      if (parsed.worship_lists) localStorage.setItem('jere_kretyen_worship_lists', JSON.stringify(parsed.worship_lists));
      return true;
    } catch {
      return false;
    }
  },

  // Clear all data
  clearAll(): void {
    try {
      localStorage.clear();
    } catch (e) {
      console.warn('Failed to clear storage', e);
    }
  }
};

