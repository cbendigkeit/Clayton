import { View, StyleSheet } from 'react-native';
import { Text, Button, TextInput, Surface, Divider } from 'react-native-paper';
import { useState } from 'react';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '@/store/useUserStore';
import { AppleSignInButton } from '@/components/AppleSignInButton';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useUserStore();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="displaySmall" style={styles.title}>
          Covenant
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Break habits. Honor commitments. Build wealth.
        </Text>
      </View>

      <Surface style={styles.form} elevation={2}>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <AppleSignInButton
          onSuccess={() => router.replace('/(tabs)')}
          onError={() => setError('Apple Sign In failed. Please try again.')}
        />

        <Divider style={styles.divider} />
        <Text variant="labelSmall" style={styles.dividerLabel}>or sign in with email</Text>

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
        <Button
          mode="contained"
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Sign In
        </Button>
        <Button
          mode="text"
          onPress={() => router.push('/(auth)/signup')}
          style={styles.linkButton}
        >
          Don't have an account? Sign up
        </Button>
      </Surface>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B4332',
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
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
});
