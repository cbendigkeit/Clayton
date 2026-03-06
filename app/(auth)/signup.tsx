import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, TextInput, Surface, Divider } from 'react-native-paper';
import { useState } from 'react';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '@/store/useUserStore';
import { AppleSignInButton } from '@/components/AppleSignInButton';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailConfirmPending, setEmailConfirmPending] = useState(false);
  const { signup } = useUserStore();

  const handleSignup = async () => {
    if (!name || !email || !password || !confirm) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signup(name, email, password);
      // If Supabase email confirmation is enabled, the session won't fire yet.
      // Show a prompt; if confirmation is disabled the auth listener handles it.
      setEmailConfirmPending(true);
    } catch {
      setError('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (emailConfirmPending) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.confirmContainer}>
          <Text variant="headlineMedium" style={styles.title}>Check your email</Text>
          <Text variant="bodyLarge" style={styles.confirmText}>
            We sent a confirmation link to{'\n'}{email}
          </Text>
          <Text variant="bodyMedium" style={styles.confirmSub}>
            Click the link in that email to activate your account, then sign in here.
          </Text>
          <Button
            mode="contained"
            onPress={() => router.back()}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Back to Sign In
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            Create Account
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Start your journey to better financial habits
          </Text>
        </View>

        <Surface style={styles.form} elevation={2}>
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <AppleSignInButton
            onSuccess={() => router.replace('/onboarding')}
            onError={() => setError('Apple Sign In failed. Please try again.')}
          />

          <Divider style={styles.divider} />
          <Text variant="labelSmall" style={styles.dividerLabel}>or sign up with email</Text>

          <TextInput
            label="Full Name"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry
            style={styles.input}
          />
          <TextInput
            label="Confirm Password"
            value={confirm}
            onChangeText={setConfirm}
            mode="outlined"
            secureTextEntry
            style={styles.input}
          />
          <Button
            mode="contained"
            onPress={handleSignup}
            loading={loading}
            disabled={loading}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Create Account
          </Button>
          <Button
            mode="text"
            onPress={() => router.back()}
            style={styles.linkButton}
          >
            Already have an account? Sign in
          </Button>
        </Surface>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B4332',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#B7E4C7',
    textAlign: 'center',
  },
  form: {
    borderRadius: 16,
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  divider: {
    marginVertical: 16,
  },
  dividerLabel: {
    color: '#ADB5BD',
    textAlign: 'center',
    marginBottom: 12,
    marginTop: -4,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  linkButton: {
    marginTop: 12,
  },
  error: {
    color: '#D62828',
    marginBottom: 12,
    textAlign: 'center',
  },
  confirmContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  confirmText: {
    color: '#B7E4C7',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 12,
    lineHeight: 26,
  },
  confirmSub: {
    color: '#74C69D',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
});
