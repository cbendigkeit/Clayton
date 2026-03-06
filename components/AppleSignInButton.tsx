import { Platform, StyleSheet } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';

interface Props {
  onSuccess: () => void;
  onError: (error: unknown) => void;
}

/**
 * Renders the native Apple Sign-In button on iOS.
 * Returns null on Android/web (Apple Sign-In is iOS-only).
 */
export function AppleSignInButton({ onSuccess, onError }: Props) {
  if (Platform.OS !== 'ios') return null;

  return (
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
      buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
      cornerRadius={8}
      style={styles.button}
      onPress={async () => {
        try {
          const { authService } = await import('@/services/authService');
          await authService.signInWithApple();
          onSuccess();
        } catch (err: unknown) {
          // ERR_REQUEST_CANCELED = user dismissed the sheet — don't show an error
          if ((err as any)?.code === 'ERR_REQUEST_CANCELED') return;
          onError(err);
        }
      }}
    />
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 50,
    marginTop: 12,
  },
});
