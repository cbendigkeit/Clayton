import { View, StyleSheet } from 'react-native';
import { Text, Surface, Chip, IconButton, ProgressBar } from 'react-native-paper';
import type { Habit } from '@/types';
import { formatCurrency } from '@/utils/currency';

const CATEGORY_LABELS: Record<string, string> = {
  coffee_shops: 'Coffee Shops',
  restaurants: 'Restaurants',
  fast_food: 'Fast Food',
  alcohol_bars: 'Bars & Alcohol',
  entertainment: 'Entertainment',
  shopping: 'Shopping',
  groceries: 'Groceries',
  travel: 'Travel',
  gas: 'Gas',
  other: 'Other',
};

interface Props {
  habit: Habit;
  showActions?: boolean;
  onToggle?: () => void;
  onDelete?: () => void;
}

export function HabitCard({ habit, showActions, onToggle, onDelete }: Props) {
  const targetLabel =
    habit.targetType === 'category'
      ? CATEGORY_LABELS[habit.targetValue] ?? habit.targetValue
      : habit.targetValue;

  const streakLabel =
    habit.currentStreak === 0
      ? 'No streak yet'
      : `${habit.currentStreak} day streak 🔥`;

  // Progress toward best streak (caps at 100%)
  const streakProgress =
    habit.bestStreak > 0 ? Math.min(habit.currentStreak / habit.bestStreak, 1) : 0;

  return (
    <Surface style={[styles.card, !habit.isActive && styles.cardPaused]} elevation={1}>
      <View style={styles.topRow}>
        <View style={styles.titleGroup}>
          <Text variant="titleSmall" style={styles.name}>{habit.name}</Text>
          <Chip
            mode="flat"
            style={[styles.typeChip, habit.targetType === 'merchant' ? styles.merchantChip : styles.categoryChip]}
            textStyle={styles.typeChipText}
            icon={habit.targetType === 'merchant' ? 'store' : 'tag'}
          >
            {targetLabel}
          </Chip>
        </View>
        {showActions && (
          <View style={styles.actions}>
            <IconButton
              icon={habit.isActive ? 'pause' : 'play'}
              size={20}
              onPress={onToggle}
              iconColor="#1B4332"
            />
            <IconButton
              icon="trash-can-outline"
              size={20}
              onPress={onDelete}
              iconColor="#D62828"
            />
          </View>
        )}
        {!habit.isActive && (
          <Chip mode="flat" style={styles.pausedChip} textStyle={styles.pausedText}>
            Paused
          </Chip>
        )}
      </View>

      <View style={styles.statsRow}>
        <StatBlock label="Spent" value={formatCurrency(habit.totalSpent)} />
        <StatBlock label="Violations" value={String(habit.violationCount)} />
        <StatBlock
          label="Pledge/hit"
          value={
            habit.pledgeType === 'percentage'
              ? `${habit.pledgeAmount}%`
              : formatCurrency(habit.pledgeAmount)
          }
        />
      </View>

      <View style={styles.streakSection}>
        <View style={styles.streakRow}>
          <Text variant="labelSmall" style={styles.streakLabel}>{streakLabel}</Text>
          <Text variant="labelSmall" style={styles.bestStreak}>
            Best: {habit.bestStreak}d
          </Text>
        </View>
        <ProgressBar
          progress={streakProgress}
          color="#40916C"
          style={styles.progressBar}
        />
      </View>
    </Surface>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBlock}>
      <Text variant="labelSmall" style={styles.statLabel}>{label}</Text>
      <Text variant="titleSmall" style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  cardPaused: {
    opacity: 0.65,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleGroup: {
    flex: 1,
  },
  name: {
    color: '#212529',
    fontWeight: '600',
    marginBottom: 6,
  },
  typeChip: {
    alignSelf: 'flex-start',
    height: 26,
  },
  merchantChip: {
    backgroundColor: '#D8F3DC',
  },
  categoryChip: {
    backgroundColor: '#E8F4FD',
  },
  typeChipText: {
    fontSize: 11,
    color: '#1B4332',
  },
  actions: {
    flexDirection: 'row',
  },
  pausedChip: {
    backgroundColor: '#F0F0F0',
    alignSelf: 'flex-start',
    height: 26,
  },
  pausedText: {
    fontSize: 11,
    color: '#6C757D',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
    marginBottom: 12,
  },
  statBlock: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    color: '#6C757D',
    marginBottom: 2,
  },
  statValue: {
    color: '#212529',
    fontWeight: '600',
  },
  streakSection: {},
  streakRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  streakLabel: {
    color: '#40916C',
  },
  bestStreak: {
    color: '#ADB5BD',
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E9ECEF',
  },
});
