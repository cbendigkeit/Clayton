import { StyleSheet, Alert } from 'react-native';
import { Button, Surface, Text } from 'react-native-paper';
import { useUserStore } from '@/store/useUserStore';

interface Props {
  onSuccess: () => void;
}

// Demo accounts to simulate Plaid connection during MVP
const DEMO_ACCOUNTS = [
  { id: 'demo_chase_001', institutionName: 'Chase', name: 'Total Checking', mask: '4242', type: 'checking' as const },
  { id: 'demo_bofa_001', institutionName: 'Bank of America', name: 'Advantage Plus', mask: '6789', type: 'checking' as const },
  { id: 'demo_wells_001', institutionName: 'Wells Fargo', name: 'Everyday Checking', mask: '1357', type: 'checking' as const },
];

export function PlaidLinkButton({ onSuccess }: Props) {
  const { addConnectedAccount } = useUserStore();

  const handlePress = () => {
    Alert.alert(
      'Connect Bank Account',
      'In production this opens Plaid Link. Select a demo account for now:',
      [
        ...DEMO_ACCOUNTS.map((account) => ({
          text: `${account.institutionName} (···${account.mask})`,
          onPress: () => {
            addConnectedAccount(account);
            onSuccess();
          },
        })),
        { text: 'Cancel', style: 'cancel' as const },
      ]
    );
  };

  return (
    <Surface style={styles.card} elevation={1}>
      <Text variant="bodyMedium" style={styles.description}>
        🔒 Your credentials are never stored. We use read-only access to detect habit violations.
      </Text>
      <Button
        mode="contained"
        onPress={handlePress}
        style={styles.button}
        contentStyle={styles.buttonContent}
        icon="bank"
      >
        Connect Bank Account
      </Button>
      <Text variant="labelSmall" style={styles.note}>
        Powered by Plaid · Demo Mode
      </Text>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 24,
    alignItems: 'center',
  },
  description: {
    color: '#495057',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  button: {
    borderRadius: 8,
    backgroundColor: '#1B4332',
    width: '100%',
  },
  buttonContent: { paddingVertical: 8 },
  note: { color: '#ADB5BD', marginTop: 12 },
});
