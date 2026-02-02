import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Pal } from '../types';

interface AppState {
  // Auth
  user: User | null;
  setUser: (user: User | null) => void;

  // Current active pal
  activePal: Pal | null;
  setActivePal: (pal: Pal | null) => void;

  // Pals list
  pals: Pal[];
  setPals: (pals: Pal[]) => void;
  addPal: (pal: Pal) => void;

  // UI state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Auth
      user: null,
      setUser: (user) => set({ user }),

      // Active pal
      activePal: null,
      setActivePal: (pal) => set({ activePal: pal }),

      // Pals
      pals: [],
      setPals: (pals) => set({ pals }),
      addPal: (pal) => set((state) => ({ pals: [...state.pals, pal] })),

      // UI
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'palpal-storage',
    }
  )
);
