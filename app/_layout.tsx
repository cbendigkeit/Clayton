import 'react-native-url-polyfill/auto';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useUserStore } from '@/store/useUserStore';

const CovenantTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1B4332',
    secondary: '#40916C',
    tertiary: '#D4A017',
    background: '#F8F9FA',
    surface: '#FFFFFF',
    error: '#D62828',
  },
};

export default function RootLayout() {
  const { isAuthenticated, isOnboarded, initialize } = useUserStore();

  useEffect(() => {
    const cleanup = initialize();
    return cleanup;
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={CovenantTheme}>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }}>
          {!isAuthenticated ? (
            <Stack.Screen name="(auth)" />
          ) : !isOnboarded ? (
            <Stack.Screen name="onboarding" />
          ) : (
            <Stack.Screen name="(tabs)" />
          )}
        </Stack>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
