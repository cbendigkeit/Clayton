import {
  futureValueAnnuity,
  buildTVMProjection,
  monthlyHabitSavings,
  calculateTotalMonthlySavings,
  dailySpendToFutureValue,
  calculatePledgeAmount,
  formatRate,
  yearlyProjections,
} from '../tvm';
import type { Habit } from '@/types';

const baseHabit: Habit = {
  id: 'h1',
  name: 'Coffee',
  targetType: 'merchant',
  targetValue: 'starbucks',
  pledgeType: 'percentage',
  pledgeAmount: 10,
  isActive: true,
  createdAt: new Date().toISOString(),
  totalSpent: 0,
  violationCount: 0,
  currentStreak: 0,
  bestStreak: 0,
};

describe('futureValueAnnuity', () => {
  it('returns 0 for non-positive payment', () => {
    expect(futureValueAnnuity(0, 0.07, 10)).toBe(0);
    expect(futureValueAnnuity(-100, 0.07, 10)).toBe(0);
  });

  it('returns 0 for non-positive years', () => {
    expect(futureValueAnnuity(100, 0.07, 0)).toBe(0);
    expect(futureValueAnnuity(100, 0.07, -1)).toBe(0);
  });

  it('returns 0 for negative rate', () => {
    expect(futureValueAnnuity(100, -0.01, 5)).toBe(0);
  });

  it('handles 0% rate (simple multiplication)', () => {
    expect(futureValueAnnuity(100, 0, 10)).toBe(100 * 10 * 12);
  });

  it('computes a known FV correctly', () => {
    // $100/month at 7% for 1 year
    const r = 0.07 / 12;
    const n = 12;
    const expected = 100 * ((Math.pow(1 + r, n) - 1) / r);
    expect(futureValueAnnuity(100, 0.07, 1)).toBeCloseTo(expected, 2);
  });

  it('grows with more years', () => {
    const fv10 = futureValueAnnuity(100, 0.07, 10);
    const fv20 = futureValueAnnuity(100, 0.07, 20);
    expect(fv20).toBeGreaterThan(fv10);
  });
});

describe('buildTVMProjection', () => {
  it('returns correct projection shape', () => {
    const proj = buildTVMProjection(100, 0.07, 10);
    expect(proj.years).toBe(10);
    expect(proj.monthlyAmount).toBe(100);
    expect(proj.annualRate).toBe(0.07);
    expect(proj.totalContributions).toBe(100 * 12 * 10);
    expect(proj.futureValue).toBeGreaterThan(proj.totalContributions);
    expect(proj.totalGrowth).toBeCloseTo(proj.futureValue - proj.totalContributions, 5);
  });
});

describe('monthlyHabitSavings', () => {
  it('returns estimatedMonthlySpend when no spend history', () => {
    expect(monthlyHabitSavings(baseHabit, 50)).toBe(50);
  });

  it('returns 0 when no spend and no estimate', () => {
    expect(monthlyHabitSavings(baseHabit)).toBe(0);
  });

  it('calculates from totalSpent when > 0', () => {
    const now = new Date();
    // createdAt 2 months ago
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());
    const habit: Habit = {
      ...baseHabit,
      totalSpent: 60,
      createdAt: twoMonthsAgo.toISOString(),
    };
    // months active = 2, so 60/2 = 30
    expect(monthlyHabitSavings(habit)).toBe(30);
  });

  it('uses minimum of 1 month when habit is very new', () => {
    const habit: Habit = { ...baseHabit, totalSpent: 25 };
    // createdAt is now, so monthsActive = max(1, 0) = 1
    expect(monthlyHabitSavings(habit)).toBe(25);
  });
});

describe('calculateTotalMonthlySavings', () => {
  it('sums only active habits', () => {
    const habits: Habit[] = [
      { ...baseHabit, id: 'h1', isActive: true, totalSpent: 0 },
      { ...baseHabit, id: 'h2', isActive: false, totalSpent: 0 },
    ];
    // Both have 0 totalSpent and no estimate, so sum = 0
    expect(calculateTotalMonthlySavings(habits)).toBe(0);
  });

  it('returns 0 for empty habits', () => {
    expect(calculateTotalMonthlySavings([])).toBe(0);
  });
});

describe('dailySpendToFutureValue', () => {
  it('converts daily amount to monthly and calls futureValueAnnuity', () => {
    const daily = 5;
    const monthly = daily * (365 / 12);
    const expected = futureValueAnnuity(monthly, 0.07, 10);
    expect(dailySpendToFutureValue(daily, 0.07, 10)).toBeCloseTo(expected, 5);
  });

  it('returns 0 for 0 daily spend', () => {
    expect(dailySpendToFutureValue(0, 0.07, 10)).toBe(0);
  });
});

describe('calculatePledgeAmount', () => {
  it('calculates percentage pledge', () => {
    expect(calculatePledgeAmount(100, 'percentage', 10)).toBe(10);
  });

  it('rounds percentage to 2 decimal places', () => {
    expect(calculatePledgeAmount(100, 'percentage', 33)).toBe(33);
    expect(calculatePledgeAmount(10, 'percentage', 33)).toBeCloseTo(3.3, 2);
  });

  it('returns fixed pledge amount unchanged', () => {
    expect(calculatePledgeAmount(500, 'fixed', 25)).toBe(25);
  });
});

describe('formatRate', () => {
  it('formats 0.07 as "7.0%"', () => {
    expect(formatRate(0.07)).toBe('7.0%');
  });

  it('formats 0.1 as "10.0%"', () => {
    expect(formatRate(0.1)).toBe('10.0%');
  });

  it('formats 0 as "0.0%"', () => {
    expect(formatRate(0)).toBe('0.0%');
  });
});

describe('yearlyProjections', () => {
  it('returns an array with length equal to maxYears', () => {
    const result = yearlyProjections(100, 0.07, 5);
    expect(result).toHaveLength(5);
  });

  it('year numbers start at 1', () => {
    const result = yearlyProjections(100, 0.07, 3);
    expect(result[0].year).toBe(1);
    expect(result[2].year).toBe(3);
  });

  it('contributions grow linearly', () => {
    const result = yearlyProjections(100, 0.07, 3);
    expect(result[0].contributions).toBe(Math.round(100 * 12 * 1));
    expect(result[1].contributions).toBe(Math.round(100 * 12 * 2));
  });

  it('future values increase year over year', () => {
    const result = yearlyProjections(100, 0.07, 5);
    for (let i = 1; i < result.length; i++) {
      expect(result[i].value).toBeGreaterThan(result[i - 1].value);
    }
  });
});
