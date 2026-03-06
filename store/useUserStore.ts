import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '@supabase/supabase-js';
import { authService } from '@/services/authService';
import type { User, Charity, NotificationPreferences, ConnectedAccount } from '@/types';

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;

  /** Called once at app startup — subscribes to Supabase auth changes. */
  initialize: () => () => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  signInWithApple: () => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: () => void;
  setDefaultCharity: (charity: Charity) => void;
  addConnectedAccount: (account: ConnectedAccount) => void;
  updateNotifications: (prefs: Partial<NotificationPreferences>) => void;
}

function userFromSession(session: Session): User {
  const su = session.user;
  return {
    id: su.id,
    name:
      su.user_metadata?.full_name ??
      su.user_metadata?.name ??
      su.email?.split('@')[0] ??
      'User',
    email: su.email ?? '',
    defaultCharity: null,
    connectedAccounts: [],
    notifications: { violations: true, weeklySummary: true },
  };
}

/** Picks only the locally-stored profile extras from the persisted user slice. */
function pickLocalExtras(user: User | null): Partial<User> {
  if (!user) return {};
  return {
    defaultCharity: user.defaultCharity,
    connectedAccounts: user.connectedAccounts,
    notifications: user.notifications,
  };
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isOnboarded: false,

      initialize: () => {
        let unsubscribe = () => {};

        // Restore existing session immediately
        authService.getSession().then((session) => {
          if (session) {
            set({
              user: { ...userFromSession(session), ...pickLocalExtras(get().user) },
              isAuthenticated: true,
            });
          }
        });

        // Keep store in sync with all future auth events
        const { data: { subscription } } = authService.onAuthStateChange(
          (event, session) => {
            if (session) {
              set({
                user: { ...userFromSession(session), ...pickLocalExtras(get().user) },
                isAuthenticated: true,
              });
            } else {
              set({ user: null, isAuthenticated: false, isOnboarded: false });
            }
          }
        );

        unsubscribe = () => subscription.unsubscribe();
        return () => unsubscribe();
      },

      login: async (email, password) => {
        await authService.signInWithEmail(email, password);
        // onAuthStateChange listener above will update the store
      },

      signup: async (name, email, password) => {
        await authService.signUpWithEmail(name, email, password);
        // Note: Supabase may require email confirmation before the session
        // fires. If you disable email confirmation in Supabase dashboard,
        // the SIGNED_IN event fires immediately and the listener handles it.
      },

      signInWithApple: async () => {
        await authService.signInWithApple();
        // onAuthStateChange listener above will update the store
      },

      logout: async () => {
        await authService.signOut();
        // onAuthStateChange listener above will clear the store
      },

      completeOnboarding: () => set({ isOnboarded: true }),

      setDefaultCharity: (charity) => {
        const { user } = get();
        if (!user) return;
        set({ user: { ...user, defaultCharity: charity } });
      },

      addConnectedAccount: (account) => {
        const { user } = get();
        if (!user) return;
        if (user.connectedAccounts.find((a) => a.id === account.id)) return;
        set({ user: { ...user, connectedAccounts: [...user.connectedAccounts, account] } });
      },

      updateNotifications: (prefs) => {
        const { user } = get();
        if (!user) return;
        set({ user: { ...user, notifications: { ...user.notifications, ...prefs } } });
      },
    }),
    {
      name: 'covenant-user',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist per-device profile extras. Supabase manages the session
      // itself in AsyncStorage under its own key.
      partialize: (state) => ({
        isOnboarded: state.isOnboarded,
        user: state.user
          ? {
              defaultCharity: state.user.defaultCharity,
              connectedAccounts: state.user.connectedAccounts,
              notifications: state.user.notifications,
            }
          : null,
      }),
    }
  )
);
