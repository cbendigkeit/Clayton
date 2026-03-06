import { View, StyleSheet, ScrollView, Linking, Alert } from 'react-native';
import { Text, Surface, Chip, Button, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { usePledgeStore } from '@/store/usePledgeStore';
import { useUserStore } from '@/store/useUserStore';
import { formatCurrency } from '@/utils/currency';
import type { Pledge } from '@/types';

const STATUS_COLORS: Record<Pledge['status'], string> = {
  pending: '#FFC107',
  fulfilled: '#28A745',
  skipped: '#6C757D',
};

export default function PledgesScreen() {
  const { pledges } = usePledgeStore();
  const { user } = useUserStore();

  const totalPledged = pledges.reduce((sum, p) => sum + p.amount, 0);
  const totalFulfilled = pledges
    .filter((p) => p.status === 'fulfilled')
    .reduce((sum, p) => sum + p.amount, 0);
  const pending = pledges.filter((p) => p.status === 'pending');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>Pledges</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Your commitments to {user?.defaultCharity?.name ?? 'your cause'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Summary */}
        <View style={styles.summaryRow}>
          <Surface style={styles.summaryCard} elevation={1}>
            <Text variant="labelSmall" style={styles.summaryLabel}>Total Pledged</Text>
            <Text variant="titleLarge" style={styles.summaryValue}>
              {formatCurrency(totalPledged)}
            </Text>
          </Surface>
          <Surface style={styles.summaryCard} elevation={1}>
            <Text variant="labelSmall" style={styles.summaryLabel}>Fulfilled</Text>
            <Text variant="titleLarge" style={[styles.summaryValue, { color: '#28A745' }]}>
              {formatCurrency(totalFulfilled)}
            </Text>
          </Surface>
          <Surface style={styles.summaryCard} elevation={1}>
            <Text variant="labelSmall" style={styles.summaryLabel}>Pending</Text>
            <Text variant="titleLarge" style={[styles.summaryValue, { color: '#FFC107' }]}>
              {formatCurrency(totalPledged - totalFulfilled)}
            </Text>
          </Surface>
        </View>

        {/* Pending Pledge CTA */}
        {pending.length > 0 && user?.defaultCharity && (
          <Surface style={styles.ctaCard} elevation={2}>
            <Text variant="titleSmall" style={styles.ctaTitle}>
              You have {pending.length} pending pledge{pending.length > 1 ? 's' : ''}
            </Text>
            <Text variant="bodySmall" style={styles.ctaBody}>
              {formatCurrency(pending.reduce((s, p) => s + p.amount, 0))} is ready to
              give to {user.defaultCharity.name}.
            </Text>
            {user.defaultCharity.donateUrl && (
              <Button
                mode="contained"
                onPress={() => Linking.openURL(user.defaultCharity!.donateUrl!)}
                style={styles.ctaButton}
                icon="open-in-new"
              >
                Donate Now
              </Button>
            )}
          </Surface>
        )}

        {/* Pledge History */}
        <Text variant="titleMedium" style={styles.historyTitle}>History</Text>

        {pledges.length === 0 ? (
          <Surface style={styles.emptyCard} elevation={0}>
            <Text variant="bodyMedium" style={styles.emptyText}>
              No pledges yet. They'll appear here when you break a tracked habit.
            </Text>
          </Surface>
        ) : (
          pledges.map((pledge, idx) => (
            <View key={pledge.id}>
              <PledgeRow pledge={pledge} />
              {idx < pledges.length - 1 && <Divider style={styles.divider} />}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function PledgeRow({ pledge }: { pledge: Pledge }) {
  const { updatePledgeStatus } = usePledgeStore();

  const confirmFulfill = () => {
    Alert.alert(
      'Mark as Fulfilled',
      `Confirm you've donated ${formatCurrency(pledge.amount)} to your charity?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => updatePledgeStatus(pledge.id, 'fulfilled'),
        },
      ]
    );
  };

  return (
    <View style={styles.pledgeRow}>
      <View style={styles.pledgeLeft}>
        <Text variant="bodyMedium" style={styles.pledgeHabit}>{pledge.habitName}</Text>
        <Text variant="labelSmall" style={styles.pledgeDate}>
          {format(new Date(pledge.triggeredAt), 'MMM d, yyyy')}
        </Text>
        <Text variant="labelSmall" style={styles.pledgeMerchant}>{pledge.merchantName}</Text>
      </View>
      <View style={styles.pledgeRight}>
        <Text variant="titleSmall" style={styles.pledgeAmount}>
          {formatCurrency(pledge.amount)}
        </Text>
        <Chip
          mode="flat"
          style={[styles.statusChip, { backgroundColor: STATUS_COLORS[pledge.status] + '22' }]}
          textStyle={[styles.statusText, { color: STATUS_COLORS[pledge.status] }]}
        >
          {pledge.status}
        </Chip>
        {pledge.status === 'pending' && (
          <Button
            mode="text"
            compact
            onPress={confirmFulfill}
            style={styles.fulfillButton}
          >
            Mark Paid
          </Button>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    backgroundColor: '#1B4332',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  title: { color: '#FFFFFF', fontWeight: 'bold' },
  subtitle: { color: '#B7E4C7', marginTop: 4 },
  content: { padding: 16, paddingBottom: 32 },
  summaryRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  summaryCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  summaryLabel: { color: '#6C757D', marginBottom: 4, textAlign: 'center' },
  summaryValue: { color: '#1B4332', fontWeight: 'bold' },
  ctaCard: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#FFF8E1',
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#D4A017',
  },
  ctaTitle: { color: '#212529', marginBottom: 4 },
  ctaBody: { color: '#495057', marginBottom: 12 },
  ctaButton: { alignSelf: 'flex-start', borderRadius: 8 },
  historyTitle: { color: '#212529', fontWeight: '600', marginBottom: 12 },
  emptyCard: {
    borderRadius: 12,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderStyle: 'dashed',
  },
  emptyText: { color: '#6C757D', textAlign: 'center' },
  pledgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  pledgeLeft: { flex: 1 },
  pledgeHabit: { color: '#212529', fontWeight: '600', marginBottom: 2 },
  pledgeDate: { color: '#6C757D' },
  pledgeMerchant: { color: '#40916C', marginTop: 2 },
  pledgeRight: { alignItems: 'flex-end' },
  pledgeAmount: { color: '#1B4332', fontWeight: 'bold', marginBottom: 4 },
  statusChip: { height: 24 },
  statusText: { fontSize: 11 },
  fulfillButton: { marginTop: 4 },
  divider: { backgroundColor: '#F0F0F0' },
});
