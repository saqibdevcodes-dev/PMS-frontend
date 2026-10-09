import { create } from 'zustand';
import { persist } from 'zustand/middleware';
type Preferences = {
  projectId: string;
  projectName: string;
  currency: string;
  timezone: string;
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'ur' | 'ar';
  setLanguage: (language: Preferences['language']) => void;
  collapsed: boolean;
  setProject: (id: string, name: string, currency?: string, timezone?: string) => void;
  setTheme: (theme: Preferences['theme']) => void;
  toggleSidebar: () => void;
};
export const usePreferences = create<Preferences>()(
  persist(
    (set) => ({
      projectId: '',
      projectName: '',
      currency: 'PKR',
      timezone: 'Asia/Karachi',
      theme: 'light',
      language: 'en',
      setLanguage: (language) => set({ language }),
      collapsed: false,
      setProject: (projectId, projectName, currency = 'PKR', timezone = 'Asia/Karachi') =>
        set({ projectId, projectName, currency, timezone }),
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((s) => ({ collapsed: !s.collapsed })),
    }),
    { name: 'estate-preferences-v1' },
  ),
);
