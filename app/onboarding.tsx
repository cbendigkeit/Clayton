import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Surface, ProgressBar } from 'react-native-paper';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '@/store/useUserStore';
import { PlaidLinkButton } from '@/components/PlaidLinkButton';
import { CharityPicker } from '@/components/CharityPicker';
import { notificationService } from '@/services/notificationService';
import type { Charity } from '@/types';

const STEPS = ['Welcome', 'Connect Bank', 'Pick Charity', 'All Set'];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [bankConnected, setBankConnected] = useState(false);
  const [selectedCharity, setSelectedCharity] = useState<Charity | null>(null);
  const { completeOnboarding, setDefaultCharity } = useUserStore();

  const progress = step / (STEPS.length - 1);

  const handleFinish = async () => {
    if (selectedCharity) {
      setDefaultCharity(selectedCharity);
    }
    completeOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progressContainer}>
        <Text variant="labelMedium" style={styles.stepLabel}>
          Step {step + 1} of {STEPS.length}
        </Text>
        <ProgressBar progress={progress} color="#40916C" style={styles.progress} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {step === 0 && <WelcomeStep onNext={() => setStep(1)} />}
        {step === 1 && (
          <ConnectBankStep
            connected={bankConnected}
            onConnected={() => setBankConnected(true)}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <PickCharityStep
            selected={selectedCharity}
            onSelect={setSelectedCharity}
            onNext={() => setStep(3)}
          />
        )}
        {step === 3 && <AllSetStep onFinish={handleFinish} />}
      </ScrollView>
    </SafeAreaView>
  );
}

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <View style={styles.step}>
      <Text variant="displaySmall" style={styles.stepTitle}>
        Welcome to{'\n'}Covenant
      </Text>
      <Text variant="bodyLarge" style={styles.stepBody}>
        Covenant helps you break costly spending habits by pledging money to causes
        you care about — and shows you exactly how much wealth you're leaving on
        the table.
      </Text>
      <Surface style={styles.callout} elevation={1}>
        <Text variant="bodyMedium" style={styles.calloutText}>
          💡 If you spend $6/day on coffee, that's{' '}
          <Text style={styles.calloutBold}>$65,000+</Text> you could have in
          20 years at a 7% return — invested instead.
        </Text>
      </Surface>
      <Button mode="contained" onPress={onNext} style={styles.nextButton} contentStyle={styles.nextContent}>
        Get Started
      </Button>
    </View>
  );
}

function ConnectBankStep({
  connected,
  onConnected,
  onNext,
}: {
  connected: boolean;
  onConnected: () => void;
  onNext: () => void;
}) {
  return (
    <View style={styles.step}>
      <Text variant="headlineMedium" style={styles.stepTitle}>
        Connect Your Accounts
      </Text>
      <Text variant="bodyLarge" style={styles.stepBody}>
        Covenant uses Plaid to securely read your transactions. We never store
        your banking credentials.
      </Text>
      {connected ? (
        <Surface style={[styles.callout, styles.successCallout]} elevation={1}>
          <Text style={styles.successText}>✓ Bank account connected!</Text>
        </Surface>
      ) : (
        <PlaidLinkButton onSuccess={onConnected} />
      )}
      <Button
        mode="contained"
        onPress={onNext}
        style={styles.nextButton}
        contentStyle={styles.nextContent}
        disabled={!connected}
      >
        Continue
      </Button>
      <Button mode="text" onPress={onNext} style={{ marginTop: 8 }}>
        Skip for now
      </Button>
    </View>
  );
}

function PickCharityStep({
  selected,
  onSelect,
  onNext,
}: {
  selected: Charity | null;
  onSelect: (c: Charity) => void;
  onNext: () => void;
}) {
  return (
    <View style={styles.step}>
      <Text variant="headlineMedium" style={styles.stepTitle}>
        Choose Your Cause
      </Text>
      <Text variant="bodyLarge" style={styles.stepBody}>
        When you break a habit, Covenant pledges money here. Pick a church,
        charity, or cause you care about.
      </Text>
      <CharityPicker selected={selected} onSelect={onSelect} />
      <Button
        mode="contained"
        onPress={onNext}
        style={styles.nextButton}
        contentStyle={styles.nextContent}
        disabled={!selected}
      >
        Continue
      </Button>
      <Button mode="text" onPress={onNext} style={{ marginTop: 8 }}>
        Skip for now
      </Button>
    </View>
  );
}

function AllSetStep({ onFinish }: { onFinish: () => void }) {
  const [notifGranted, setNotifGranted] = useState<boolean | null>(null);

  useEffect(() => {
    // Ask for permission as soon as the user reaches this step.
    // The OS shows its own system dialog; we just record the outcome.
    notificationService.requestPermission().then(setNotifGranted);
  }, []);

  return (
    <View style={styles.step}>
      <Text variant="displaySmall" style={styles.stepTitle}>
        You're all set! 🎉
      </Text>
      <Text variant="bodyLarge" style={styles.stepBody}>
        Now create your first habit to start tracking. Every dollar you save
        compounds into something greater.
      </Text>
      {notifGranted === false && (
        <Surface style={styles.notifCallout} elevation={1}>
          <Text variant="bodySmall" style={styles.notifText}>
            Enable notifications later in Settings to get alerted when a habit is broken.
          </Text>
        </Surface>
      )}
      <Button
        mode="contained"
        onPress={onFinish}
        style={styles.nextButton}
        contentStyle={styles.nextContent}
      >
        Go to Dashboard
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#1B4332',
  },
  stepLabel: {
    color: '#B7E4C7',
    marginBottom: 8,
  },
  progress: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#2D6A4F',
  },
  content: {
    flexGrow: 1,
    padding: 24,
  },
  step: {
    flex: 1,
  },
  stepTitle: {
    color: '#1B4332',
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 8,
  },
  stepBody: {
    color: '#495057',
    lineHeight: 24,
    marginBottom: 24,
  },
  notifCallout: {
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#FFF8E1',
    marginBottom: 24,
    borderLeftWidth: 3,
    borderLeftColor: '#D4A017',
  },
  notifText: {
    color: '#6C757D',
    lineHeight: 20,
  },
  callout: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#D8F3DC',
    marginBottom: 24,
  },
  calloutText: {
    color: '#1B4332',
    lineHeight: 22,
  },
  calloutBold: {
    fontWeight: 'bold',
    color: '#1B4332',
  },
  successCallout: {
    backgroundColor: '#D8F3DC',
  },
  successText: {
    color: '#1B4332',
    fontWeight: '600',
    fontSize: 16,
  },
  nextButton: {
    marginTop: 'auto',
    borderRadius: 8,
  },
  nextContent: {
    paddingVertical: 8,
  },
});
