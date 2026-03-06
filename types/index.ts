// ─── User & Auth ────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  defaultCharity: Charity | null;
  connectedAccounts: ConnectedAccount[];
  notifications: NotificationPreferences;
}

export interface NotificationPreferences {
  violations: boolean;
  weeklySummary: boolean;
}

export interface ConnectedAccount {
  id: string;
  institutionName: string;
  name: string;
  mask: string; // last 4 digits
  type: 'checking' | 'savings' | 'credit';
  plaidAccessToken?: string; // stored server-side only
}

// ─── Habits ─────────────────────────────────────────────────────────────────

export type HabitTargetType = 'merchant' | 'category';

export type SpendingCategory =
  | 'coffee_shops'
  | 'restaurants'
  | 'fast_food'
  | 'alcohol_bars'
  | 'entertainment'
  | 'shopping'
  | 'groceries'
  | 'travel'
  | 'gas'
  | 'other';

export interface Habit {
  id: string;
  name: string;
  targetType: HabitTargetType;
  targetValue: string; // merchant name OR category key
  pledgeType: 'percentage' | 'fixed';
  pledgeAmount: number; // % of purchase OR fixed $ per violation
  charityId?: string;
  isActive: boolean;
  createdAt: string; // ISO date
  // Stats
  totalSpent: number;
  violationCount: number;
  currentStreak: number; // days clean
  bestStreak: number;
}

export interface CreateHabitInput {
  name: string;
  targetType: HabitTargetType;
  targetValue: string;
  pledgeType: 'percentage' | 'fixed';
  pledgeAmount: number;
  charityId?: string;
}

// ─── Pledges ─────────────────────────────────────────────────────────────────

export interface Pledge {
  id: string;
  habitId: string;
  habitName: string;
  merchantName: string;
  transactionAmount: number;
  amount: number; // pledge amount
  status: 'pending' | 'fulfilled' | 'skipped';
  triggeredAt: string; // ISO date
  charityId?: string;
}

// ─── Charities ───────────────────────────────────────────────────────────────

export interface Charity {
  id: string;
  name: string;
  category: string;
  ein?: string; // IRS EIN for verified 501c3
  donateUrl?: string;
  logoUrl?: string;
  isVerified: boolean;
  isCustom?: boolean; // user-entered church/org
}

// ─── Transactions ────────────────────────────────────────────────────────────

export interface Transaction {
  id: string;
  accountId: string;
  amount: number; // positive = debit
  merchantName: string | null;
  category: string[];
  date: string; // ISO date
  pending: boolean;
}

// ─── TVM ─────────────────────────────────────────────────────────────────────

export interface TVMProjection {
  years: number;
  futureValue: number;
  totalContributions: number;
  totalGrowth: number;
  monthlyAmount: number;
  annualRate: number;
}
