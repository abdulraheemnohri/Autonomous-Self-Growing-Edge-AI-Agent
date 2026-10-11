import { AppSettings } from '../litert/types';

export const DEFAULT_APP_SETTINGS: AppSettings = {
  inference: {
    temperature: 0.7,
    topP: 0.9,
    repetitionPenalty: 1.1,
    contextLimit: 8192,
    backend: 'webgpu',
    threadCount: 4
  },
  voice: {
    whisperSensitivity: 0.85,
    vadSilenceMs: 1200,
    piperVoice: 'piper-ryan-high',
    speechRate: 1.05,
    speechPitch: 1.0,
    autoInterruption: true,
    activeSttModel: 'whisper-tiny-litert'
  },
  growth: {
    growthMode: 'adaptive',
    continuousFactExtraction: true,
    skillAutoSynthesisThreshold: 'balanced',
    growthTickIntervalSec: 30,
    proactiveSuggestions: true,
    autoConsolidateMemories: true
  },
  display: {
    frameMode: 'responsive',
    deviceSkin: 'iphone',
    theme: 'oled_dark',
    hapticFeedback: true
  }
};

const SETTINGS_STORAGE_KEY = 'litert_agent_offline_settings_v2';

export class SettingsManager {
  private currentSettings: AppSettings = { ...DEFAULT_APP_SETTINGS };
  private listeners: Set<() => void> = new Set();

  constructor() {
    // Keep deterministic defaults during initial SSR & hydration render
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.warn('Settings listener error:', e);
      }
    });
  }

  public getSettings(): AppSettings {
    return this.currentSettings;
  }

  public updateSettings(partial: Partial<AppSettings>): AppSettings {
    this.currentSettings = {
      ...this.currentSettings,
      ...partial,
      inference: { ...this.currentSettings.inference, ...(partial.inference || {}) },
      voice: { ...this.currentSettings.voice, ...(partial.voice || {}) },
      growth: { ...this.currentSettings.growth, ...(partial.growth || {}) },
      display: { ...this.currentSettings.display, ...(partial.display || {}) }
    };
    this.saveToStorage();
    this.notify();
    return this.getSettings();
  }

  public resetToDefaults(): AppSettings {
    this.currentSettings = { ...DEFAULT_APP_SETTINGS };
    this.saveToStorage();
    this.notify();
    return this.getSettings();
  }

  public loadFromStorage(): AppSettings {
    if (typeof window === 'undefined') return { ...this.currentSettings };
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.currentSettings = {
          ...DEFAULT_APP_SETTINGS,
          ...parsed,
          inference: { ...DEFAULT_APP_SETTINGS.inference, ...(parsed.inference || {}) },
          voice: { ...DEFAULT_APP_SETTINGS.voice, ...(parsed.voice || {}) },
          growth: { ...DEFAULT_APP_SETTINGS.growth, ...(parsed.growth || {}) },
          display: { ...DEFAULT_APP_SETTINGS.display, ...(parsed.display || {}) }
        };
        this.notify();
      }
    } catch (e) {
      console.warn('Error loading settings from localStorage:', e);
    }
    return this.getSettings();
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(this.currentSettings));
    } catch (e) {
      console.warn('Error saving settings to localStorage:', e);
    }
  }
}

export const settingsManager = new SettingsManager();
