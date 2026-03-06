import { StyleSheet } from 'react-native';
import { Snackbar, Portal } from 'react-native-paper';
import { useToastStore } from '@/store/useToastStore';

const TYPE_COLORS = {
  success: '#28A745',
  error: '#D62828',
  info: '#1B4332',
};

export function ToastSnackbar() {
  const { message, visible, type, hide } = useToastStore();

  return (
    <Portal>
      <Snackbar
        visible={visible}
        onDismiss={hide}
        duration={2500}
        style={[styles.snackbar, { backgroundColor: TYPE_COLORS[type] }]}
        theme={{ colors: { inverseSurface: TYPE_COLORS[type] } }}
      >
        {message}
      </Snackbar>
    </Portal>
  );
}

const styles = StyleSheet.create({
  snackbar: {
    marginBottom: 16,
    marginHorizontal: 16,
    borderRadius: 8,
  },
});
