import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/utils/constants';

type ThemeMode = 'light' | 'dark' | 'auto';
type EffectiveTheme = 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  effectiveTheme: EffectiveTheme;
  setMode: (mode: ThemeMode) => void;
  initializeTheme: () => void;
}

/**
 * Get system color scheme preference
 */
function getSystemPreference(): EffectiveTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Apply theme to document
 */
function applyTheme(theme: EffectiveTheme) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

/**
 * Calculate effective theme based on mode
 */
function calculateEffectiveTheme(mode: ThemeMode): EffectiveTheme {
  if (mode === 'auto') {
    return getSystemPreference();
  }
  return mode;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'auto',
      effectiveTheme: 'light',

      setMode: (mode: ThemeMode) => {
        const effectiveTheme = calculateEffectiveTheme(mode);
        applyTheme(effectiveTheme);
        set({ mode, effectiveTheme });
      },

      initializeTheme: () => {
        const { mode } = get();
        const effectiveTheme = calculateEffectiveTheme(mode);
        applyTheme(effectiveTheme);
        set({ effectiveTheme });

        // Listen for system preference changes when in auto mode
        if (typeof window !== 'undefined') {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
          mediaQuery.addEventListener('change', (e) => {
            const { mode: currentMode } = get();
            if (currentMode === 'auto') {
              const newEffectiveTheme = e.matches ? 'dark' : 'light';
              applyTheme(newEffectiveTheme);
              set({ effectiveTheme: newEffectiveTheme });
            }
          });
        }
      },
    }),
    {
      name: STORAGE_KEYS.THEME,
      partialize: (state) => ({ mode: state.mode }),
    }
  )
);
