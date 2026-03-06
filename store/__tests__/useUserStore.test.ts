import { useUserStore } from '../useUserStore';
import type { Charity, ConnectedAccount } from '@/types';

function resetStore() {
  useUserStore.setState({ user: null, isAuthenticated: false, isOnboarded: false });
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
    it('sets user and isAuthenticated', async () => {
      await useUserStore.getState().login('test@example.com', 'password');
      const { user, isAuthenticated, isOnboarded } = useUserStore.getState();
      expect(isAuthenticated).toBe(true);
      expect(isOnboarded).toBe(true);
      expect(user?.email).toBe('test@example.com');
      expect(user?.name).toBe('test');
    });
  });

  describe('signup', () => {
    it('sets user and isAuthenticated but not isOnboarded', async () => {
      await useUserStore.getState().signup('Alice', 'alice@example.com', 'pw');
      const { user, isAuthenticated, isOnboarded } = useUserStore.getState();
      expect(isAuthenticated).toBe(true);
      expect(isOnboarded).toBe(false);
      expect(user?.name).toBe('Alice');
      expect(user?.email).toBe('alice@example.com');
    });
  });

  describe('logout', () => {
    it('clears user and auth state', async () => {
      await useUserStore.getState().login('a@b.com', 'pw');
      useUserStore.getState().logout();
      const { user, isAuthenticated, isOnboarded } = useUserStore.getState();
      expect(user).toBeNull();
      expect(isAuthenticated).toBe(false);
      expect(isOnboarded).toBe(false);
    });
  });

  describe('completeOnboarding', () => {
    it('sets isOnboarded to true', async () => {
      await useUserStore.getState().signup('Bob', 'b@b.com', 'pw');
      useUserStore.getState().completeOnboarding();
      expect(useUserStore.getState().isOnboarded).toBe(true);
    });
  });

  describe('setDefaultCharity', () => {
    it('sets defaultCharity on user', async () => {
      await useUserStore.getState().login('a@b.com', 'pw');
      useUserStore.getState().setDefaultCharity(charity);
      expect(useUserStore.getState().user?.defaultCharity).toEqual(charity);
    });

    it('does nothing when user is null', () => {
      useUserStore.getState().setDefaultCharity(charity);
      expect(useUserStore.getState().user).toBeNull();
    });
  });

  describe('addConnectedAccount', () => {
    it('adds an account to the user', async () => {
      await useUserStore.getState().login('a@b.com', 'pw');
      useUserStore.getState().addConnectedAccount(account);
      expect(useUserStore.getState().user?.connectedAccounts).toHaveLength(1);
    });

    it('does not add duplicate accounts', async () => {
      await useUserStore.getState().login('a@b.com', 'pw');
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
    it('merges notification preferences', async () => {
      await useUserStore.getState().login('a@b.com', 'pw');
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
