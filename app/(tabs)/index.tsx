import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Surface, Button, Chip } from 'react-native-paper';
import { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useHabitStore } from '@/store/useHabitStore';
import { usePledgeStore } from '@/store/usePledgeStore';
import { useUserStore } from '@/store/useUserStore';
import { TVMInsight } from '@/components/TVMInsight';
import { HabitCard } from '@/components/HabitCard';
import { formatCurrency } from '@/utils/currency';
import { calculateTotalMonthlySavings } from '@/utils/tvm';

export default function DashboardScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useUserStore();
  const { habits, fetchTransactions } = useHabitStore();
  const { pledges } = usePledgeStore();

  const totalPledged = pledges.reduce((sum, p) => sum + p.amount, 0);
  const activeHabits = habits.filter((h) => h.isActive);
  const monthlySavings = calculateTotalMonthlySavings(habits);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  }, [fetchTransactions]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text variant="labelLarge" style={styles.greeting}>
            Good morning,
          </Text>
          <Text variant="headlineMedium" style={styles.name}>
            {user?.name ?? 'Friend'}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1B4332" />}
      >
        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <Surface style={[styles.summaryCard, { flex: 1 }]} elevation={1}>
            <Text variant="labelMedium" style={styles.summaryLabel}>Monthly Savings</Text>
            <Text variant="headlineSmall" style={styles.summaryValue}>
              {formatCurrency(monthlySavings)}
            </Text>
          </Surface>
          <View style={{ width: 12 }} />
          <Surface style={[styles.summaryCard, { flex: 1 }]} elevation={1}>
            <Text variant="labelMedium" style={styles.summaryLabel}>Total Pledged</Text>
            <Text variant="headlineSmall" style={[styles.summaryValue, { color: '#D4A017' }]}>
              {formatCurrency(totalPledged)}
            </Text>
          </Surface>
        </View>

        {/* TVM Insight */}
        {monthlySavings > 0 && (
          <TVMInsight monthlyAmount={monthlySavings} years={10} annualRate={0.07} />
        )}

        {/* Active Habits */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Active Habits</Text>
            <Chip
              mode="flat"
              style={styles.countChip}
              textStyle={styles.countChipText}
            >
              {activeHabits.length}
            </Chip>
          </View>

          {activeHabits.length === 0 ? (
            <Surface style={styles.emptyCard} elevation={0}>
              <Text variant="bodyMedium" style={styles.emptyText}>
                No habits yet. Set one up to start tracking your spending.
              </Text>
              <Button
                mode="contained"
                onPress={() => router.push('/(tabs)/habits')}
                style={styles.emptyButton}
              >
                Create a Habit
              </Button>
            </Surface>
          ) : (
            activeHabits.map((habit) => (
              <HabitCard key={habit.id} habit={habit} />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#1B4332',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greeting: {
    color: '#B7E4C7',
  },
  name: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  summaryCard: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  summaryLabel: {
    color: '#6C757D',
    marginBottom: 4,
  },
  summaryValue: {
    color: '#1B4332',
    fontWeight: 'bold',
  },
  section: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#212529',
    fontWeight: '600',
    flex: 1,
  },
  countChip: {
    backgroundColor: '#D8F3DC',
    height: 28,
  },
  countChipText: {
    color: '#1B4332',
    fontSize: 12,
  },
  emptyCard: {
    borderRadius: 12,
    padding: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderStyle: 'dashed',
  },
  emptyText: {
    color: '#6C757D',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyButton: {
    borderRadius: 8,
  },
});
