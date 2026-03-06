import { useHabitStore } from '../useHabitStore';
import { usePledgeStore } from '../usePledgeStore';
import type { CreateHabitInput, Transaction } from '@/types';

const habitInput: CreateHabitInput = {
  name: 'No Coffee',
  targetType: 'merchant',
  targetValue: 'starbucks',
  pledgeType: 'fixed',
  pledgeAmount: 5,
};

function resetStores() {
  useHabitStore.setState({ habits: [], recentTransactions: [], isLoadingTransactions: false });
  usePledgeStore.setState({ pledges: [] });
}

describe('useHabitStore', () => {
  beforeEach(resetStores);

  describe('createHabit', () => {
    it('adds a new active habit', () => {
      useHabitStore.getState().createHabit(habitInput);
      const { habits } = useHabitStore.getState();
      expect(habits).toHaveLength(1);
      expect(habits[0].name).toBe('No Coffee');
      expect(habits[0].isActive).toBe(true);
      expect(habits[0].totalSpent).toBe(0);
      expect(habits[0].violationCount).toBe(0);
    });

    it('generates a unique id starting with habit_', () => {
      useHabitStore.getState().createHabit(habitInput);
      expect(useHabitStore.getState().habits[0].id).toMatch(/^habit_/);
    });
  });

  describe('updateHabit', () => {
    it('updates specified fields on the habit', () => {
      useHabitStore.getState().createHabit(habitInput);
      const id = useHabitStore.getState().habits[0].id;
      useHabitStore.getState().updateHabit(id, { name: 'Updated Name' });
      expect(useHabitStore.getState().habits[0].name).toBe('Updated Name');
    });

    it('does not affect other habits', () => {
      // Use distinct pledge amounts so habits can be told apart even with same id
      useHabitStore.getState().createHabit({ ...habitInput, pledgeAmount: 1 });
      // Ensure a different Date.now() by faking the id after creation
      const firstId = useHabitStore.getState().habits[0].id;
      useHabitStore.getState().updateHabit(firstId, { id: 'habit_first' });
      useHabitStore.getState().createHabit({ ...habitInput, name: 'Second', pledgeAmount: 2 });
      useHabitStore.getState().updateHabit(
        useHabitStore.getState().habits.find(h => h.pledgeAmount === 2)!.id,
        { id: 'habit_second' }
      );
      useHabitStore.getState().updateHabit('habit_first', { name: 'Changed' });
      const second = useHabitStore.getState().habits.find(h => h.id === 'habit_second');
      expect(second?.name).toBe('Second');
    });
  });

  describe('deleteHabit', () => {
    it('removes the habit by id', () => {
      useHabitStore.getState().createHabit(habitInput);
      const id = useHabitStore.getState().habits[0].id;
      useHabitStore.getState().deleteHabit(id);
      expect(useHabitStore.getState().habits).toHaveLength(0);
    });

    it('does not remove other habits', () => {
      useHabitStore.getState().createHabit({ ...habitInput, pledgeAmount: 1 });
      const firstId = useHabitStore.getState().habits[0].id;
      useHabitStore.getState().updateHabit(firstId, { id: 'habit_del_first' });
      useHabitStore.getState().createHabit({ ...habitInput, name: 'Second', pledgeAmount: 2 });
      const secondId = useHabitStore.getState().habits.find(h => h.pledgeAmount === 2)!.id;
      useHabitStore.getState().updateHabit(secondId, { id: 'habit_del_second' });
      useHabitStore.getState().deleteHabit('habit_del_first');
      expect(useHabitStore.getState().habits).toHaveLength(1);
      expect(useHabitStore.getState().habits[0].name).toBe('Second');
    });
  });

  describe('toggleHabit', () => {
    it('toggles isActive from true to false', () => {
      useHabitStore.getState().createHabit(habitInput);
      const id = useHabitStore.getState().habits[0].id;
      useHabitStore.getState().toggleHabit(id);
      expect(useHabitStore.getState().habits[0].isActive).toBe(false);
    });

    it('toggles isActive back to true', () => {
      useHabitStore.getState().createHabit(habitInput);
      const id = useHabitStore.getState().habits[0].id;
      useHabitStore.getState().toggleHabit(id);
      useHabitStore.getState().toggleHabit(id);
      expect(useHabitStore.getState().habits[0].isActive).toBe(true);
    });
  });

  describe('fetchTransactions', () => {
    it('sets isLoadingTransactions to false after completion', async () => {
      await useHabitStore.getState().fetchTransactions();
      expect(useHabitStore.getState().isLoadingTransactions).toBe(false);
    });
  });

  describe('processTransactions', () => {
    const matchingTx: Transaction = {
      id: 'tx1',
      accountId: 'acc1',
      amount: 5.5,
      merchantName: 'Starbucks',
      category: ['coffee_shops'],
      date: '2024-01-15',
      pending: false,
    };

    const nonMatchingTx: Transaction = {
      id: 'tx2',
      accountId: 'acc1',
      amount: 12,
      merchantName: 'Walmart',
      category: ['groceries'],
      date: '2024-01-16',
      pending: false,
    };

    it('updates habit stats on violation', () => {
      useHabitStore.getState().createHabit(habitInput);
      useHabitStore.getState().processTransactions([matchingTx]);
      const habit = useHabitStore.getState().habits[0];
      expect(habit.totalSpent).toBe(5.5);
      expect(habit.violationCount).toBe(1);
      expect(habit.currentStreak).toBe(0);
    });

    it('creates a pledge for each violation', () => {
      useHabitStore.getState().createHabit(habitInput);
      useHabitStore.getState().processTransactions([matchingTx]);
      expect(usePledgeStore.getState().pledges).toHaveLength(1);
      expect(usePledgeStore.getState().pledges[0].amount).toBe(5); // fixed pledge
    });

    it('does not update habits for non-matching transactions', () => {
      useHabitStore.getState().createHabit(habitInput);
      useHabitStore.getState().processTransactions([nonMatchingTx]);
      const habit = useHabitStore.getState().habits[0];
      expect(habit.totalSpent).toBe(0);
      expect(habit.violationCount).toBe(0);
    });

    it('stores recentTransactions', () => {
      useHabitStore.getState().processTransactions([matchingTx, nonMatchingTx]);
      expect(useHabitStore.getState().recentTransactions).toHaveLength(2);
    });

    it('skips pending transactions', () => {
      const pending: Transaction = { ...matchingTx, pending: true };
      useHabitStore.getState().createHabit(habitInput);
      useHabitStore.getState().processTransactions([pending]);
      expect(useHabitStore.getState().habits[0].violationCount).toBe(0);
    });
  });
});
