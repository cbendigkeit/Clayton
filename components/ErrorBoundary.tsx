import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error.message, info.componentStack);
  }

  reset = () => this.setState({ hasError: false });

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <Text variant="displaySmall" style={styles.icon}>⚠️</Text>
            <Text variant="headlineMedium" style={styles.title}>
              Something went wrong
            </Text>
            <Text variant="bodyMedium" style={styles.body}>
              An unexpected error occurred. Your data has been saved — tap below to continue.
            </Text>
            <Button
              mode="contained"
              onPress={this.reset}
              style={styles.button}
              contentStyle={styles.buttonContent}
            >
              Try Again
            </Button>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B4332',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 32,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  body: {
    color: '#B7E4C7',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  button: {
    borderRadius: 8,
    backgroundColor: '#40916C',
  },
  buttonContent: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
});
