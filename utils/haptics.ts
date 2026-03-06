import * as Haptics from 'expo-haptics';

/** Positive confirmation — habit created, pledge fulfilled, account connected. */
export function hapticSuccess() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}

/** Something went wrong — auth failure, validation error. */
export function hapticError() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
}

/** Subtle feedback — toggling, pausing, dismissing. */
export function hapticLight() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}
