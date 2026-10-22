/**
 * IndexedDB storage service for local vocal recordings.
 * Ensures recordings survive page reloads and browser sessions without quota issues.
 */

export interface StoredAudioRecording {
  id: string;
  title: string;
  songTitle?: string;
  songNumber?: number;
  duration: number; // in seconds
  audioBlob: Blob;
  createdAt: number;
  sizeBytes: number;
  mimeType: string;
  note?: string;
  isFavorite?: boolean;
}

const DB_NAME = 'jere_kretyen_db';
const DB_VERSION = 1;
const STORE_NAME = 'recordings';

class RecordingStorageService {
  private dbPromise: Promise<IDBDatabase>;

  constructor() {
    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB not supported'));
        return;
      }
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll(): Promise<StoredAudioRecording[]> {
    try {
      const db = await this.dbPromise;
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => {
          const list = (req.result || []) as StoredAudioRecording[];
          // Sort newest first
          resolve(list.sort((a, b) => b.createdAt - a.createdAt));
        };
        req.onerror = () => reject(req.error);
      });
    } catch {
      return [];
    }
  }

  async save(rec: StoredAudioRecording): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(rec);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async update(id: string, updates: Partial<StoredAudioRecording>): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const getReq = store.get(id);
      getReq.onsuccess = () => {
        const existing = getReq.result as StoredAudioRecording;
        if (existing) {
          const merged = { ...existing, ...updates };
          store.put(merged);
        }
        resolve();
      };
      getReq.onerror = () => reject(getReq.error);
    });
  }

  async delete(id: string): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async clearAll(): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async getStorageEstimate(): Promise<{ usedBytes: number; quotaBytes: number }> {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
      try {
        const est = await navigator.storage.estimate();
        return {
          usedBytes: est.usage || 0,
          quotaBytes: est.quota || 0,
        };
      } catch {
        // fallback
      }
    }
    return { usedBytes: 0, quotaBytes: 0 };
  }
}

export const recordingStorageService = new RecordingStorageService();
