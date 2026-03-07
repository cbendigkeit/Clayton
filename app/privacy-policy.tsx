import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="headlineSmall" style={styles.title}>Privacy Policy</Text>
        <Text variant="bodySmall" style={styles.date}>Effective March 7, 2026</Text>

        <Section heading="Overview">
          Clayton ("we," "our," or "us") helps you build better financial habits by linking your
          bank accounts, tracking spending, and donating to charity when you slip up. This policy
          explains what data we collect, how we use it, and your rights.
        </Section>

        <Section heading="Data We Collect">
          {'• '}Account information: name and email address you provide at signup.{'\n'}
          {'• '}Financial data: transaction history and account balances retrieved via Plaid on
          your behalf.{'\n'}
          {'• '}Habit and pledge data: habits you create, spending thresholds, and pledge history.{'\n'}
          {'• '}Device data: push notification token for sending you alerts.
        </Section>

        <Section heading="How We Use Your Data">
          {'• '}To match transactions against your active habits and trigger pledges.{'\n'}
          {'• '}To send you habit violation alerts and weekly savings summaries (if enabled).{'\n'}
          {'• '}To process charitable donations on your behalf.{'\n'}
          {'• '}To improve the app through aggregate, anonymized analytics.{'\n\n'}
          We do not sell your personal data to third parties.
        </Section>

        <Section heading="Financial Data & Plaid">
          Clayton uses Plaid to connect to your bank. Plaid's own privacy policy governs how they
          handle your credentials and banking data. We store only the transaction and balance
          information needed to run your habits — we never store your bank username or password.
        </Section>

        <Section heading="Data Retention">
          Your data is retained for as long as your account is active. You may delete your account
          at any time from the Profile screen. Deletion removes all personally identifiable
          information within 30 days.
        </Section>

        <Section heading="Third-Party Services">
          {'• '}Plaid — bank connectivity{'\n'}
          {'• '}Supabase — secure cloud database and authentication{'\n'}
          {'• '}Apple — Sign in with Apple authentication
        </Section>

        <Section heading="Your Rights">
          You may request a copy of your data or ask us to delete it by contacting us at the
          address below. If you are in the EU or California, additional rights may apply under
          GDPR or CCPA respectively.
        </Section>

        <Section heading="Contact">
          Questions or requests: privacy@claytonapp.com
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="titleMedium" style={styles.heading}>{heading}</Text>
      <Text variant="bodyMedium" style={styles.body}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  content: { padding: 24, paddingBottom: 48 },
  title: { color: '#1B4332', fontWeight: 'bold', marginBottom: 4 },
  date: { color: '#6C757D', marginBottom: 24 },
  section: { marginBottom: 24 },
  heading: { color: '#1B4332', fontWeight: '600', marginBottom: 6 },
  body: { color: '#343A40', lineHeight: 22 },
});
