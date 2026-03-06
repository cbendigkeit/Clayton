import { usePledgeStore } from '../usePledgeStore';

const addInput = {
  habitId: 'h1',
  habitName: 'No Coffee',
  merchantName: 'Starbucks',
  transactionAmount: 5.5,
  amount: 0.55,
  triggeredAt: '2024-01-15',
};

function resetStore() {
  usePledgeStore.setState({ pledges: [] });
}

describe('usePledgeStore', () => {
  beforeEach(resetStore);

  describe('addPledge', () => {
    it('adds a pledge with status pending', () => {
      usePledgeStore.getState().addPledge(addInput);
      const { pledges } = usePledgeStore.getState();
      expect(pledges).toHaveLength(1);
      expect(pledges[0].status).toBe('pending');
      expect(pledges[0].habitId).toBe('h1');
      expect(pledges[0].amount).toBe(0.55);
    });

    it('prepends new pledges to the list', () => {
      usePledgeStore.getState().addPledge({ ...addInput, amount: 1 });
      usePledgeStore.getState().addPledge({ ...addInput, amount: 2 });
      const { pledges } = usePledgeStore.getState();
      expect(pledges[0].amount).toBe(2);
      expect(pledges[1].amount).toBe(1);
    });

    it('generates a unique id for each pledge', () => {
      usePledgeStore.getState().addPledge(addInput);
      usePledgeStore.getState().addPledge(addInput);
      const { pledges } = usePledgeStore.getState();
      expect(pledges[0].id).not.toBe(pledges[1].id);
    });
  });

  describe('updatePledgeStatus', () => {
    it('updates the status of the specified pledge', () => {
      usePledgeStore.getState().addPledge(addInput);
      const id = usePledgeStore.getState().pledges[0].id;
      usePledgeStore.getState().updatePledgeStatus(id, 'fulfilled');
      expect(usePledgeStore.getState().pledges[0].status).toBe('fulfilled');
    });

    it('does not affect other pledges', () => {
      usePledgeStore.getState().addPledge(addInput);
      usePledgeStore.getState().addPledge(addInput);
      const pledges = usePledgeStore.getState().pledges;
      usePledgeStore.getState().updatePledgeStatus(pledges[0].id, 'skipped');
      expect(usePledgeStore.getState().pledges[1].status).toBe('pending');
    });
  });

  describe('clearFulfilledPledges', () => {
    it('removes fulfilled pledges', () => {
      usePledgeStore.getState().addPledge(addInput);
      usePledgeStore.getState().addPledge(addInput);
      const id = usePledgeStore.getState().pledges[0].id;
      usePledgeStore.getState().updatePledgeStatus(id, 'fulfilled');
      usePledgeStore.getState().clearFulfilledPledges();
      expect(usePledgeStore.getState().pledges).toHaveLength(1);
      expect(usePledgeStore.getState().pledges[0].status).toBe('pending');
    });

    it('does nothing when no fulfilled pledges', () => {
      usePledgeStore.getState().addPledge(addInput);
      usePledgeStore.getState().clearFulfilledPledges();
      expect(usePledgeStore.getState().pledges).toHaveLength(1);
    });
  });

  describe('getPendingTotal', () => {
    it('sums amounts of pending pledges only', () => {
      usePledgeStore.getState().addPledge({ ...addInput, amount: 5 });
      usePledgeStore.getState().addPledge({ ...addInput, amount: 10 });
      const id = usePledgeStore.getState().pledges[0].id;
      usePledgeStore.getState().updatePledgeStatus(id, 'fulfilled');
      expect(usePledgeStore.getState().getPendingTotal()).toBe(5);
    });

    it('returns 0 when no pledges', () => {
      expect(usePledgeStore.getState().getPendingTotal()).toBe(0);
    });
  });
});
