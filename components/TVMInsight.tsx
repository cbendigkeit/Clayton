import { View, StyleSheet } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { buildTVMProjection, formatRate } from '@/utils/tvm';
import { formatCurrencyCompact, formatCurrency } from '@/utils/currency';

interface Props {
  monthlyAmount: number;
  years?: number;
  annualRate?: number;
}

export function TVMInsight({ monthlyAmount, years = 10, annualRate = 0.07 }: Props) {
  const projection = buildTVMProjection(monthlyAmount, annualRate, years);

  return (
    <Surface style={styles.card} elevation={2}>
      <View style={styles.headerRow}>
        <Text variant="labelLarge" style={styles.headerLabel}>
          💰 If you invest these savings…
        </Text>
        <Text variant="labelSmall" style={styles.rateLabel}>
          {formatRate(annualRate)} avg return
        </Text>
      </View>

      <View style={styles.projectionRow}>
        <ProjectionColumn
          label={`${years}yr value`}
          value={formatCurrencyCompact(projection.futureValue)}
          highlight
        />
        <View style={styles.divider} />
        <ProjectionColumn
          label="You put in"
          value={formatCurrencyCompact(projection.totalContributions)}
        />
        <View style={styles.divider} />
        <ProjectionColumn
          label="Growth"
          value={formatCurrencyCompact(projection.totalGrowth)}
          positive
        />
      </View>

      <Text variant="bodySmall" style={styles.detail}>
        Saving {formatCurrency(monthlyAmount)}/mo for {years} years at{' '}
        {formatRate(annualRate)} grows to{' '}
        <Text style={styles.bold}>{formatCurrencyCompact(projection.futureValue)}</Text>.
        That's{' '}
        <Text style={styles.bold}>
          {(projection.futureValue / projection.totalContributions).toFixed(1)}×
        </Text>{' '}
        your money.
      </Text>
    </Surface>
  );
}

function ProjectionColumn({
  label,
  value,
  highlight,
  positive,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  positive?: boolean;
}) {
  return (
    <View style={styles.col}>
      <Text
        variant="headlineSmall"
        style={[
          styles.colValue,
          highlight && styles.highlightValue,
          positive && styles.positiveValue,
        ]}
      >
        {value}
      </Text>
      <Text variant="labelSmall" style={styles.colLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#1B4332',
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLabel: {
    color: '#FFFFFF',
  },
  rateLabel: {
    color: '#B7E4C7',
  },
  projectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  col: {
    alignItems: 'center',
    flex: 1,
  },
  colValue: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  highlightValue: {
    color: '#D4A017',
  },
  positiveValue: {
    color: '#74C69D',
  },
  colLabel: {
    color: '#B7E4C7',
    marginTop: 2,
  },
  divider: {
    width: 1,
    backgroundColor: '#2D6A4F',
    marginVertical: 4,
  },
  detail: {
    color: '#B7E4C7',
    lineHeight: 18,
    marginTop: 4,
  },
  bold: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
