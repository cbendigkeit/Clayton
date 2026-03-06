import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Pledge } from '@/types';

interface AddPledgeInput {
  habitId: string;
  habitName: string;
  merchantName: string;
  transactionAmount: number;
  amount: number;
  charityId?: string;
  triggeredAt: string;
}

interface PledgeState {
  pledges: Pledge[];
  addPledge: (input: AddPledgeInput) => void;
  updatePledgeStatus: (id: string, status: Pledge['status']) => void;
  clearFulfilledPledges: () => void;
  clearPledgesForHabit: (habitId: string) => void;
  getPendingTotal: () => number;
}

export const usePledgeStore = create<PledgeState>()(
  persist(
    (set, get) => ({
      pledges: [],

      addPledge: (input: AddPledgeInput) => {
        const pledge: Pledge = {
          id: `pledge_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          status: 'pending',
          ...input,
        };
        set((state) => ({ pledges: [pledge, ...state.pledges] }));
      },

      updatePledgeStatus: (id: string, status: Pledge['status']) => {
        set((state) => ({
          pledges: state.pledges.map((p) => (p.id === id ? { ...p, status } : p)),
        }));
      },

      clearFulfilledPledges: () => {
        set((state) => ({
          pledges: state.pledges.filter((p) => p.status !== 'fulfilled'),
        }));
      },

      clearPledgesForHabit: (habitId: string) => {
        set((state) => ({
          pledges: state.pledges.filter((p) => p.habitId !== habitId),
        }));
      },

      getPendingTotal: () => {
        return get()
          .pledges.filter((p) => p.status === 'pending')
          .reduce((sum, p) => sum + p.amount, 0);
      },
    }),
    {
      name: 'covenant-pledges',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
