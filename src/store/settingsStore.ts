import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ScreenType } from '@/types/Settings';

interface SettingsState {
  currentScreen: ScreenType;
  setCurrentScreen: (screen: ScreenType) => void;
  resetToMain: () => void;
  clearStorage: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get, api) => ({
      currentScreen: 'main',
      setCurrentScreen: (screen) => set({ currentScreen: screen }),
      resetToMain: () => set({ currentScreen: 'main' }),
      clearStorage: () => {
        set({ currentScreen: 'main' });
        api.persist.clearStorage();
      },
    }),
    {
      name: 'settings-storage',
      partialize: (state) => ({ currentScreen: state.currentScreen }),
    },
  ),
);
