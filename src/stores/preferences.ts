import { create } from 'zustand';
import { persist } from 'zustand/middleware';
type Preferences = {
  companyId: string;
  companyName: string;
  projectId: string;
  projectName: string;
  currency: string;
  timezone: string;
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'ur' | 'ar';
  setLanguage: (language: Preferences['language']) => void;
  collapsed: boolean;
  setCompany: (id: string, name: string) => void;
  setProject: (id: string, name: string, currency?: string, timezone?: string) => void;
  setTheme: (theme: Preferences['theme']) => void;
  toggleSidebar: () => void;
};
export const usePreferences = create<Preferences>()(
  persist(
    (set) => ({
      companyId: '',
      companyName: '',
      projectId: '',
      projectName: '',
      currency: 'PKR',
      timezone: 'Asia/Karachi',
      theme: 'light',
      language: 'en',
      setLanguage: (language) => set({ language }),
      collapsed: false,
      setCompany: (companyId, companyName) =>
        set((state) =>
          state.companyId === companyId
            ? { companyId, companyName }
            : { companyId, companyName, projectId: '', projectName: '' },
        ),
      setProject: (projectId, projectName, currency = 'PKR', timezone = 'Asia/Karachi') =>
        set({ projectId, projectName, currency, timezone }),
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((s) => ({ collapsed: !s.collapsed })),
    }),
    { name: 'estate-preferences-v1' },
  ),
);
