import { HYMNAL_SECTIONS, SAMPLE_SONGS } from '../data/sampleSongs';
import { adminBackendService } from './adminBackendService';
import { HymnalSection, Song, SongCategory, SongRightsMetadata, WorshipList } from '../types';

const STORAGE_KEYS = {
  FAVORITES: 'jere_kretyen_song_favorites',
  WORSHIP_LISTS: 'jere_kretyen_worship_lists',
  CUSTOM_SONGS: 'jere_kretyen_custom_songs',
};

// Normalize string for accent-insensitive and case-insensitive search
function normalize(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function normalizeSongRights(song: Song): Song {
  const rights = song.rights;
  const hasSource = Boolean(
    rights &&
    ((typeof rights.sourceUrl === 'string' && /^https?:\/\//i.test(rights.sourceUrl.trim())) ||
      (typeof rights.sourceTitle === 'string' && rights.sourceTitle.trim()))
  );
  const hasEvidence = typeof rights?.evidence === 'string' && rights.evidence.trim().length > 0;
  let status: SongRightsMetadata['status'] = 'unverified';
  if (
    rights &&
    (rights.status === 'public_domain' || rights.status === 'licensed') &&
    hasSource &&
    hasEvidence
  ) {
    status = rights.status;
  }

  return {
    ...song,
    rights: rights ? { ...rights, status } : { status },
    copyrightStatus: status === 'public_domain'
      ? 'Domaine public'
      : status === 'licensed'
        ? 'Autorisé'
        : 'À vérifier',
  };
}

class SongService {
  private sharedSongs: Song[] = [];

  // Get all available songs (built-in + user added)
  getAllSongs(): Song[] {
    let customSongs: Song[] = [];
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_SONGS);
      if (stored) {
        customSongs = JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    const songsById = new Map<string, Song>();
    [...SAMPLE_SONGS, ...this.sharedSongs, ...customSongs].forEach(song => {
      songsById.set(song.id, normalizeSongRights(song));
    });
    const sectionOrder = new Map(HYMNAL_SECTIONS.map((section, index) => [section.code, index]));
    return [...songsById.values()].sort((a, b) => {
      const sectionDifference =
        (sectionOrder.get(a.sectionCode) ?? HYMNAL_SECTIONS.length) -
        (sectionOrder.get(b.sectionCode) ?? HYMNAL_SECTIONS.length);
      return sectionDifference || a.number - b.number || a.sectionCode.localeCompare(b.sectionCode);
    });
  }

  async refreshSharedSongs(): Promise<Song[]> {
    this.sharedSongs = await adminBackendService.getSharedSongs();
    return this.getAllSongs();
  }

  // Get single song by ID
  getSongById(id: string): Song | undefined {
    return this.getAllSongs().find((s) => s.id === id);
  }

  // Get song by exact section and number
  getSongByNumber(number: number, sectionCode?: HymnalSection): Song | undefined {
    const songs = this.getAllSongs();
    if (sectionCode) {
      return songs.find((s) => s.number === number && s.sectionCode === sectionCode);
    }
    return songs.find((s) => s.number === number);
  }

  // Accent-tolerant and number search
  searchSongs(
    query: string,
    category?: SongCategory | 'all',
    sectionCode?: HymnalSection | 'all'
  ): Song[] {
    const q = normalize(query);
    const all = this.getAllSongs();

    return all.filter((song) => {
      // Filter by section
      if (sectionCode && sectionCode !== 'all' && song.sectionCode !== sectionCode) {
        return false;
      }

      // Filter by category
      if (category && category !== 'all' && song.category !== category) {
        return false;
      }

      if (!q) return true;

      // Match number
      if (song.number.toString() === q) return true;

      // Match title
      if (normalize(song.title).includes(q)) return true;
      if (song.titleKr && normalize(song.titleKr).includes(q)) return true;

      // Match section name
      if (normalize(song.section).includes(q)) return true;

      // Match author
      if (song.author && normalize(song.author).includes(q)) return true;

      // Match verses text
      const matchVerses = song.verses.some((v) =>
        v.text.some((line) => normalize(line).includes(q))
      );
      if (matchVerses) return true;

      // Match chorus
      if (song.chorus && song.chorus.some((line) => normalize(line).includes(q))) {
        return true;
      }

      return false;
    });
  }

  // Favorites
  getFavorites(): string[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  toggleFavorite(songId: string): string[] {
    const current = this.getFavorites();
    let updated: string[];
    if (current.includes(songId)) {
      updated = current.filter((id) => id !== songId);
    } else {
      updated = [...current, songId];
    }
    try {
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
    } catch {
      // ignore
    }
    return updated;
  }

  // Worship Lists / Playlists
  getWorshipLists(): WorshipList[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.WORSHIP_LISTS);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    // Default starter worship list
    return [
      {
        id: 'list_sunday_worship',
        title: 'Culte de Dimanche',
        description: 'Chants d\'adoration et de louange pour le service dominical',
        date: new Date().toLocaleDateString(),
        songIds: ['ce-fr-1', 'ce-fr-18', 'ce-kr-1', 'ce-fr-136'],
        createdAt: Date.now() - 86400000,
        updatedAt: Date.now(),
      },
    ];
  }

  saveWorshipList(list: WorshipList): WorshipList[] {
    const current = this.getWorshipLists();
    const idx = current.findIndex((l) => l.id === list.id);
    let updated: WorshipList[];
    if (idx >= 0) {
      updated = [...current];
      updated[idx] = { ...list, updatedAt: Date.now() };
    } else {
      updated = [list, ...current];
    }
    try {
      localStorage.setItem(STORAGE_KEYS.WORSHIP_LISTS, JSON.stringify(updated));
    } catch {
      // ignore
    }
    return updated;
  }

  deleteWorshipList(listId: string): WorshipList[] {
    const updated = this.getWorshipLists().filter((l) => l.id !== listId);
    try {
      localStorage.setItem(STORAGE_KEYS.WORSHIP_LISTS, JSON.stringify(updated));
    } catch {
      // ignore
    }
    return updated;
  }

  // Add custom song (for Admin and manual contribution)
  async addCustomSong(song: Song): Promise<void> {
    const normalizedSong = normalizeSongRights(song);
    let customList: Song[] = [];
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_SONGS);
      if (stored) customList = JSON.parse(stored);
    } catch {
      // ignore
    }
    const customIndex = customList.findIndex(s => s.id === normalizedSong.id);
    if (customIndex >= 0) customList[customIndex] = normalizedSong;
    else customList.push(normalizedSong);

    if (adminBackendService.isConfigured()) {
      await adminBackendService.saveSharedSong(normalizedSong);
      this.sharedSongs = [
        ...this.sharedSongs.filter(existing => existing.id !== normalizedSong.id),
        normalizedSong,
      ];
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_SONGS, JSON.stringify(customList));
    } catch {
      throw new Error('Le chant a été enregistré, mais sa copie locale n’a pas pu être mise à jour.');
    }
  }
}

export const songService = new SongService();
