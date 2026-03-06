import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Habit, CreateHabitInput, Transaction } from '@/types';
import { findViolatingTransactions } from '@/utils/transactions';
import { calculatePledgeAmount } from '@/utils/tvm';
import { usePledgeStore } from './usePledgeStore';
import { useToastStore } from './useToastStore';
import { hapticSuccess, hapticLight } from '@/utils/haptics';

interface HabitState {
  habits: Habit[];
  recentTransactions: Transaction[];
  isLoadingTransactions: boolean;

  createHabit: (input: CreateHabitInput) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleHabit: (id: string) => void;
  fetchTransactions: () => Promise<void>;
  processTransactions: (transactions: Transaction[]) => void;
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [],
      recentTransactions: [],
      isLoadingTransactions: false,

      createHabit: (input: CreateHabitInput) => {
        const habit: Habit = {
          id: `habit_${Date.now()}`,
          ...input,
          isActive: true,
          createdAt: new Date().toISOString(),
          totalSpent: 0,
          violationCount: 0,
          currentStreak: 0,
          bestStreak: 0,
        };
        set((state) => ({ habits: [...state.habits, habit] }));
        hapticSuccess();
        useToastStore.getState().show('Habit created');
      },

      updateHabit: (id: string, updates: Partial<Habit>) => {
        set((state) => ({
          habits: state.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
        }));
      },

      deleteHabit: (id: string) => {
        usePledgeStore.getState().clearPledgesForHabit(id);
        set((state) => ({ habits: state.habits.filter((h) => h.id !== id) }));
        hapticLight();
      },

      toggleHabit: (id: string) => {
        set((state) => ({
          habits: state.habits.map((h) =>
            h.id === id ? { ...h, isActive: !h.isActive } : h
          ),
        }));
        hapticLight();
      },

      fetchTransactions: async () => {
        set({ isLoadingTransactions: true });
        try {
          // TODO: replace with real Plaid API call via backend
          // const transactions = await plaidService.getTransactions();
          // get().processTransactions(transactions);
        } catch (err) {
          console.error('Failed to fetch transactions:', err);
        } finally {
          set({ isLoadingTransactions: false });
        }
      },

      processTransactions: (transactions: Transaction[]) => {
        const { habits } = get();
        const violations = findViolatingTransactions(transactions, habits);
        const { addPledge } = usePledgeStore.getState();

        // Update habit stats
        const habitUpdates: Record<string, Partial<Habit>> = {};
        for (const { transaction, habit } of violations) {
          const existing = habitUpdates[habit.id] ?? {
            totalSpent: habit.totalSpent,
            violationCount: habit.violationCount,
          };
          habitUpdates[habit.id] = {
            totalSpent: (existing.totalSpent ?? 0) + transaction.amount,
            violationCount: (existing.violationCount ?? 0) + 1,
            currentStreak: 0, // reset streak on violation
          };

          // Create a pledge for this violation
          addPledge({
            habitId: habit.id,
            habitName: habit.name,
            merchantName: transaction.merchantName ?? 'Unknown',
            transactionAmount: transaction.amount,
            amount: calculatePledgeAmount(
              transaction.amount,
              habit.pledgeType,
              habit.pledgeAmount
            ),
            charityId: habit.charityId,
            triggeredAt: transaction.date,
          });
        }

        // Apply updates
        set((state) => ({
          habits: state.habits.map((h) =>
            habitUpdates[h.id] ? { ...h, ...habitUpdates[h.id] } : h
          ),
          recentTransactions: transactions,
        }));
      },
    }),
    {
      name: 'covenant-habits',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        habits: state.habits,
        recentTransactions: state.recentTransactions,
      }),
    }
  )
);
