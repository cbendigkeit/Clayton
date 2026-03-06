import { create } from 'zustand';
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
  getPendingTotal: () => number;
}

export const usePledgeStore = create<PledgeState>((set, get) => ({
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

  getPendingTotal: () => {
    return get()
      .pledges.filter((p) => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0);
  },
}));
