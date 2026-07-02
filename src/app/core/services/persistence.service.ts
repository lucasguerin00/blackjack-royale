import { Injectable } from '@angular/core';

/**
 * Point d'accès unique au stockage. C'est la « couture » (port) qu'on
 * remplacera plus tard par un adapter IndexedDB (Dexie) puis Supabase,
 * sans toucher au reste de l'application.
 */
@Injectable({ providedIn: 'root' })
export class PersistenceService {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      return raw == null ? fallback : (JSON.parse(raw) as T);
    } catch {
      return fallback;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* quota dépassé ou navigation privée : on ignore silencieusement */
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
}
