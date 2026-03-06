import {
  transactionMatchesHabit,
  findViolatingTransactions,
  groupByMerchant,
  sumTransactions,
} from '../transactions';
import type { Transaction, Habit } from '@/types';

const baseHabit: Habit = {
  id: 'h1',
  name: 'No Coffee',
  targetType: 'merchant',
  targetValue: 'starbucks',
  pledgeType: 'fixed',
  pledgeAmount: 5,
  isActive: true,
  createdAt: new Date().toISOString(),
  totalSpent: 0,
  violationCount: 0,
  currentStreak: 0,
  bestStreak: 0,
};

const baseTx: Transaction = {
  id: 'tx1',
  accountId: 'acc1',
  amount: 5.5,
  merchantName: 'Starbucks',
  category: ['coffee_shops'],
  date: '2024-01-15',
  pending: false,
};

describe('transactionMatchesHabit', () => {
  it('returns false for inactive habit', () => {
    expect(transactionMatchesHabit(baseTx, { ...baseHabit, isActive: false })).toBe(false);
  });

  describe('merchant matching', () => {
    it('matches when merchant contains target', () => {
      expect(transactionMatchesHabit(baseTx, baseHabit)).toBe(true);
    });

    it('is case-insensitive', () => {
      expect(
        transactionMatchesHabit({ ...baseTx, merchantName: 'STARBUCKS' }, baseHabit)
      ).toBe(true);
    });

    it('does not match unrelated merchant', () => {
      expect(
        transactionMatchesHabit({ ...baseTx, merchantName: 'McDonalds' }, baseHabit)
      ).toBe(false);
    });

    it('handles null merchantName (empty string, target contains it so it matches)', () => {
      // null → '' and 'starbucks'.includes('') is true
      expect(
        transactionMatchesHabit({ ...baseTx, merchantName: null }, baseHabit)
      ).toBe(true);
    });

    it('matches when target contains merchant', () => {
      const habit: Habit = { ...baseHabit, targetValue: 'starbucks coffee' };
      expect(transactionMatchesHabit({ ...baseTx, merchantName: 'starbucks' }, habit)).toBe(true);
    });
  });

  describe('category matching', () => {
    const categoryHabit: Habit = {
      ...baseHabit,
      targetType: 'category',
      targetValue: 'coffee_shops',
    };

    it('matches when category includes target', () => {
      expect(transactionMatchesHabit(baseTx, categoryHabit)).toBe(true);
    });

    it('normalizes spaces to underscores', () => {
      const tx: Transaction = { ...baseTx, category: ['coffee shops'] };
      expect(transactionMatchesHabit(tx, categoryHabit)).toBe(true);
    });

    it('does not match different category', () => {
      const tx: Transaction = { ...baseTx, category: ['restaurants'] };
      expect(transactionMatchesHabit(tx, categoryHabit)).toBe(false);
    });
  });

  it('returns false for unknown targetType', () => {
    const habit = { ...baseHabit, targetType: 'unknown' as any };
    expect(transactionMatchesHabit(baseTx, habit)).toBe(false);
  });
});

describe('findViolatingTransactions', () => {
  it('returns empty array when no violations', () => {
    const tx: Transaction = { ...baseTx, merchantName: 'Walmart' };
    expect(findViolatingTransactions([tx], [baseHabit])).toHaveLength(0);
  });

  it('skips pending transactions', () => {
    const tx: Transaction = { ...baseTx, pending: true };
    expect(findViolatingTransactions([tx], [baseHabit])).toHaveLength(0);
  });

  it('returns violation when habit matches', () => {
    const violations = findViolatingTransactions([baseTx], [baseHabit]);
    expect(violations).toHaveLength(1);
    expect(violations[0].transaction).toBe(baseTx);
    expect(violations[0].habit).toBe(baseHabit);
  });

  it('can match same transaction against multiple habits', () => {
    const habit2: Habit = {
      ...baseHabit,
      id: 'h2',
      targetType: 'category',
      targetValue: 'coffee_shops',
    };
    const violations = findViolatingTransactions([baseTx], [baseHabit, habit2]);
    expect(violations).toHaveLength(2);
  });

  it('handles empty inputs', () => {
    expect(findViolatingTransactions([], [baseHabit])).toHaveLength(0);
    expect(findViolatingTransactions([baseTx], [])).toHaveLength(0);
  });
});

describe('groupByMerchant', () => {
  it('groups transactions by merchantName', () => {
    const tx1: Transaction = { ...baseTx, id: 'tx1', merchantName: 'Starbucks' };
    const tx2: Transaction = { ...baseTx, id: 'tx2', merchantName: 'Starbucks' };
    const tx3: Transaction = { ...baseTx, id: 'tx3', merchantName: 'McDonalds' };
    const groups = groupByMerchant([tx1, tx2, tx3]);
    expect(groups['Starbucks']).toHaveLength(2);
    expect(groups['McDonalds']).toHaveLength(1);
  });

  it('groups null merchantName under "Unknown"', () => {
    const tx: Transaction = { ...baseTx, merchantName: null };
    const groups = groupByMerchant([tx]);
    expect(groups['Unknown']).toHaveLength(1);
  });

  it('returns empty object for empty array', () => {
    expect(groupByMerchant([])).toEqual({});
  });
});

describe('sumTransactions', () => {
  it('sums all transaction amounts', () => {
    const txs: Transaction[] = [
      { ...baseTx, amount: 5 },
      { ...baseTx, amount: 10.5 },
      { ...baseTx, amount: 3.25 },
    ];
    expect(sumTransactions(txs)).toBeCloseTo(18.75, 5);
  });

  it('returns 0 for empty array', () => {
    expect(sumTransactions([])).toBe(0);
  });

  it('handles negative amounts', () => {
    const txs: Transaction[] = [
      { ...baseTx, amount: 10 },
      { ...baseTx, amount: -3 },
    ];
    expect(sumTransactions(txs)).toBeCloseTo(7, 5);
  });
});
