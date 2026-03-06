import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, FAB, Surface, Button, SegmentedButtons } from 'react-native-paper';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHabitStore } from '@/store/useHabitStore';
import { HabitCard } from '@/components/HabitCard';
import { CreateHabitModal } from '@/components/CreateHabitModal';

type Filter = 'all' | 'active' | 'paused';

export default function HabitsScreen() {
  const [filter, setFilter] = useState<Filter>('all');
  const [showCreate, setShowCreate] = useState(false);
  const { habits, deleteHabit, toggleHabit } = useHabitStore();

  const filtered = habits.filter((h) => {
    if (filter === 'active') return h.isActive;
    if (filter === 'paused') return !h.isActive;
    return true;
  });

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Habit',
      'Are you sure? This will also remove all associated pledge history.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteHabit(id),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>My Habits</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Track and break your spending patterns
        </Text>
      </View>

      <View style={styles.filterContainer}>
        <SegmentedButtons
          value={filter}
          onValueChange={(v) => setFilter(v as Filter)}
          buttons={[
            { value: 'all', label: 'All' },
            { value: 'active', label: 'Active' },
            { value: 'paused', label: 'Paused' },
          ]}
          style={styles.filter}
        />
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {filtered.length === 0 ? (
          <Surface style={styles.emptyCard} elevation={0}>
            <Text variant="bodyLarge" style={styles.emptyTitle}>No habits here</Text>
            <Text variant="bodyMedium" style={styles.emptyText}>
              {filter === 'all'
                ? "Tap the + button to create your first spending habit to track."
                : `No ${filter} habits found.`}
            </Text>
            {filter === 'all' && (
              <Button
                mode="contained"
                onPress={() => setShowCreate(true)}
                style={styles.emptyButton}
              >
                Create First Habit
              </Button>
            )}
          </Surface>
        ) : (
          filtered.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggle={() => toggleHabit(habit.id)}
              onDelete={() => handleDelete(habit.id)}
              showActions
            />
          ))
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setShowCreate(true)}
        color="#FFFFFF"
      />

      <CreateHabitModal
        visible={showCreate}
        onDismiss={() => setShowCreate(false)}
      />
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
  },
  title: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#B7E4C7',
    marginTop: 4,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  filter: {
    backgroundColor: '#F8F9FA',
  },
  list: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyCard: {
    borderRadius: 12,
    padding: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderStyle: 'dashed',
    marginTop: 16,
  },
  emptyTitle: {
    color: '#212529',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    color: '#6C757D',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyButton: {
    borderRadius: 8,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#1B4332',
  },
});
