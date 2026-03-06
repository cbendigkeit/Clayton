import type { Transaction, Habit } from '@/types';

/**
 * Check whether a transaction matches a habit's tracking target.
 * Handles both merchant-name matching and category matching.
 */
export function transactionMatchesHabit(
  transaction: Transaction,
  habit: Habit
): boolean {
  if (!habit.isActive) return false;

  if (habit.targetType === 'merchant') {
    const merchant = (transaction.merchantName ?? '').toLowerCase();
    const target = habit.targetValue.toLowerCase();
    return merchant.includes(target) || target.includes(merchant);
  }

  if (habit.targetType === 'category') {
    return transaction.category.some(
      (cat) => cat.toLowerCase().replace(/\s+/g, '_') === habit.targetValue.toLowerCase()
    );
  }

  return false;
}

/**
 * Filter transactions that violate at least one habit.
 */
export function findViolatingTransactions(
  transactions: Transaction[],
  habits: Habit[]
): Array<{ transaction: Transaction; habit: Habit }> {
  const violations: Array<{ transaction: Transaction; habit: Habit }> = [];

  for (const transaction of transactions) {
    if (transaction.pending) continue;
    for (const habit of habits) {
      if (transactionMatchesHabit(transaction, habit)) {
        violations.push({ transaction, habit });
      }
    }
  }

  return violations;
}

/**
 * Group transactions by merchant name.
 */
export function groupByMerchant(
  transactions: Transaction[]
): Record<string, Transaction[]> {
  return transactions.reduce<Record<string, Transaction[]>>((acc, tx) => {
    const key = tx.merchantName ?? 'Unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(tx);
    return acc;
  }, {});
}

/**
 * Sum the total amount for a list of transactions.
 */
export function sumTransactions(transactions: Transaction[]): number {
  return transactions.reduce((sum, tx) => sum + tx.amount, 0);
}
