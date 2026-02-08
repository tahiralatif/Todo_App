// User preferences management

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  viewMode: 'list' | 'kanban' | 'timeline';
  sidebarCollapsed: boolean;
  fontSize: 'small' | 'normal' | 'large';
  reducedMotion: boolean;
  notificationsEnabled: boolean;
  language: string;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'auto',
  viewMode: 'list',
  sidebarCollapsed: false,
  fontSize: 'normal',
  reducedMotion: false,
  notificationsEnabled: true,
  language: 'en',
};

const PREFERENCES_KEY = 'todo_app_preferences';

export class PreferencesManager {
  private static instance: PreferencesManager;
  private preferences: UserPreferences;
  private listeners: Array<(prefs: UserPreferences) => void> = [];

  private constructor() {
    this.preferences = this.loadPreferences();
  }

  static getInstance(): PreferencesManager {
    if (!PreferencesManager.instance) {
      PreferencesManager.instance = new PreferencesManager();
    }
    return PreferencesManager.instance;
  }

  private loadPreferences(): UserPreferences {
    if (typeof window === 'undefined') {
      return DEFAULT_PREFERENCES;
    }

    try {
      const saved = localStorage.getItem(PREFERENCES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_PREFERENCES, ...parsed };
      }
    } catch (e) {
      console.warn('Failed to load preferences:', e);
    }

    return DEFAULT_PREFERENCES;
  }

  private savePreferences(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(this.preferences));
    } catch (e) {
      console.warn('Failed to save preferences:', e);
    }
  }

  getPreferences(): UserPreferences {
    return { ...this.preferences };
  }

  setPreference<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ): void {
    this.preferences = {
      ...this.preferences,
      [key]: value,
    };

    this.savePreferences();
    this.notifyListeners();
  }

  setPreferences(prefs: Partial<UserPreferences>): void {
    this.preferences = {
      ...this.preferences,
      ...prefs,
    };

    this.savePreferences();
    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getPreferences()));
  }

  subscribe(listener: (prefs: UserPreferences) => void): () => void {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Specific getter/setter methods for convenience
  getTheme(): 'light' | 'dark' | 'auto' {
    return this.preferences.theme;
  }

  setTheme(theme: 'light' | 'dark' | 'auto'): void {
    this.setPreference('theme', theme);
  }

  getViewMode(): 'list' | 'kanban' | 'timeline' {
    return this.preferences.viewMode;
  }

  setViewMode(mode: 'list' | 'kanban' | 'timeline'): void {
    this.setPreference('viewMode', mode);
  }

  isSidebarCollapsed(): boolean {
    return this.preferences.sidebarCollapsed;
  }

  setSidebarCollapsed(collapsed: boolean): void {
    this.setPreference('sidebarCollapsed', collapsed);
  }

  getFontSize(): 'small' | 'normal' | 'large' {
    return this.preferences.fontSize;
  }

  setFontSize(size: 'small' | 'normal' | 'large'): void {
    this.setPreference('fontSize', size);
  }

  getReducedMotion(): boolean {
    return this.preferences.reducedMotion;
  }

  setReducedMotion(reduced: boolean): void {
    this.setPreference('reducedMotion', reduced);
  }

  areNotificationsEnabled(): boolean {
    return this.preferences.notificationsEnabled;
  }

  setNotificationsEnabled(enabled: boolean): void {
    this.setPreference('notificationsEnabled', enabled);
  }
}

// Hook for React components to access preferences
import { useState, useEffect } from 'react';

export const usePreferences = (): [
  UserPreferences,
  (prefs: Partial<UserPreferences>) => void
] => {
  const [preferences, setPreferences] = useState<UserPreferences>(
    PreferencesManager.getInstance().getPreferences()
  );

  useEffect(() => {
    const manager = PreferencesManager.getInstance();
    return manager.subscribe(setPreferences);
  }, []);

  const updatePreferences = (prefs: Partial<UserPreferences>) => {
    PreferencesManager.getInstance().setPreferences(prefs);
  };

  return [preferences, updatePreferences];
};