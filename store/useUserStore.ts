import { create } from 'zustand';
import type { User, Charity, NotificationPreferences, ConnectedAccount } from '@/types';

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;

  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  completeOnboarding: () => void;
  setDefaultCharity: (charity: Charity) => void;
  addConnectedAccount: (account: ConnectedAccount) => void;
  updateNotifications: (prefs: Partial<NotificationPreferences>) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isOnboarded: false,

  login: async (email: string, _password: string) => {
    // TODO: replace with real API call
    const user: User = {
      id: `user_${Date.now()}`,
      name: email.split('@')[0],
      email,
      defaultCharity: null,
      connectedAccounts: [],
      notifications: { violations: true, weeklySummary: true },
    };
    set({ user, isAuthenticated: true, isOnboarded: true });
  },

  signup: async (name: string, email: string, _password: string) => {
    // TODO: replace with real API call
    const user: User = {
      id: `user_${Date.now()}`,
      name,
      email,
      defaultCharity: null,
      connectedAccounts: [],
      notifications: { violations: true, weeklySummary: true },
    };
    set({ user, isAuthenticated: true, isOnboarded: false });
  },

  logout: () => {
    set({ user: null, isAuthenticated: false, isOnboarded: false });
  },

  completeOnboarding: () => {
    set({ isOnboarded: true });
  },

  setDefaultCharity: (charity: Charity) => {
    const { user } = get();
    if (!user) return;
    set({ user: { ...user, defaultCharity: charity } });
  },

  addConnectedAccount: (account: ConnectedAccount) => {
    const { user } = get();
    if (!user) return;
    const existing = user.connectedAccounts.find((a) => a.id === account.id);
    if (existing) return;
    set({
      user: {
        ...user,
        connectedAccounts: [...user.connectedAccounts, account],
      },
    });
  },

  updateNotifications: (prefs: Partial<NotificationPreferences>) => {
    const { user } = get();
    if (!user) return;
    set({
      user: {
        ...user,
        notifications: { ...user.notifications, ...prefs },
      },
    });
  },
}));
