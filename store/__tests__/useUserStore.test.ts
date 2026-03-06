// Mock authService so tests don't hit Supabase
jest.mock('@/services/authService', () => ({
  authService: {
    signInWithEmail: jest.fn().mockResolvedValue({}),
    signUpWithEmail: jest.fn().mockResolvedValue({}),
    signInWithApple: jest.fn().mockResolvedValue({}),
    signOut: jest.fn().mockResolvedValue(undefined),
    getSession: jest.fn().mockResolvedValue(null),
    syncProfile: jest.fn(),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } },
    })),
  },
}));

import { useUserStore } from '../useUserStore';
import type { Charity, ConnectedAccount, User } from '@/types';
import { authService } from '@/services/authService';

const MOCK_USER: User = {
  id: 'u1',
  name: 'test',
  email: 'test@example.com',
  defaultCharity: null,
  connectedAccounts: [],
  notifications: { violations: true, weeklySummary: true },
};

function resetStore() {
  useUserStore.setState({ user: null, isAuthenticated: false, isOnboarded: false });
}

function setLoggedIn(overrides?: Partial<User>) {
  useUserStore.setState({ user: { ...MOCK_USER, ...overrides }, isAuthenticated: true });
}

const charity: Charity = {
  id: 'c1',
  name: 'Red Cross',
  category: 'humanitarian',
  isVerified: true,
};

const account: ConnectedAccount = {
  id: 'acc1',
  institutionName: 'Chase',
  name: 'Checking',
  mask: '1234',
  type: 'checking',
};

describe('useUserStore', () => {
  beforeEach(resetStore);

  describe('login', () => {
    it('calls authService.signInWithEmail with the provided credentials', async () => {
      await useUserStore.getState().login('test@example.com', 'password');
      expect(authService.signInWithEmail).toHaveBeenCalledWith('test@example.com', 'password');
    });
  });

  describe('signup', () => {
    it('calls authService.signUpWithEmail with name, email, password', async () => {
      await useUserStore.getState().signup('Alice', 'alice@example.com', 'pw');
      expect(authService.signUpWithEmail).toHaveBeenCalledWith('Alice', 'alice@example.com', 'pw');
    });
  });

  describe('signInWithApple', () => {
    it('calls authService.signInWithApple', async () => {
      await useUserStore.getState().signInWithApple();
      expect(authService.signInWithApple).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('calls authService.signOut', async () => {
      await useUserStore.getState().logout();
      expect(authService.signOut).toHaveBeenCalled();
    });
  });

  describe('completeOnboarding', () => {
    it('sets isOnboarded to true', () => {
      useUserStore.getState().completeOnboarding();
      expect(useUserStore.getState().isOnboarded).toBe(true);
    });
  });

  describe('setDefaultCharity', () => {
    it('sets defaultCharity on user', () => {
      setLoggedIn();
      useUserStore.getState().setDefaultCharity(charity);
      expect(useUserStore.getState().user?.defaultCharity).toEqual(charity);
    });

    it('does nothing when user is null', () => {
      useUserStore.getState().setDefaultCharity(charity);
      expect(useUserStore.getState().user).toBeNull();
    });
  });

  describe('addConnectedAccount', () => {
    it('adds an account to the user', () => {
      setLoggedIn();
      useUserStore.getState().addConnectedAccount(account);
      expect(useUserStore.getState().user?.connectedAccounts).toHaveLength(1);
    });

    it('does not add duplicate accounts', () => {
      setLoggedIn();
      useUserStore.getState().addConnectedAccount(account);
      useUserStore.getState().addConnectedAccount(account);
      expect(useUserStore.getState().user?.connectedAccounts).toHaveLength(1);
    });

    it('does nothing when user is null', () => {
      useUserStore.getState().addConnectedAccount(account);
      expect(useUserStore.getState().user).toBeNull();
    });
  });

  describe('updateNotifications', () => {
    it('merges notification preferences', () => {
      setLoggedIn();
      useUserStore.getState().updateNotifications({ weeklySummary: false });
      expect(useUserStore.getState().user?.notifications.violations).toBe(true);
      expect(useUserStore.getState().user?.notifications.weeklySummary).toBe(false);
    });

    it('does nothing when user is null', () => {
      useUserStore.getState().updateNotifications({ violations: false });
      expect(useUserStore.getState().user).toBeNull();
    });
  });
});
