import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Ensure notifications appear as banners when the app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
  }),
});

export const notificationService = {
  /**
   * Requests OS-level notification permission.
   * Returns true if granted (or already granted), false if denied.
   * Safe to call repeatedly — no-ops if already granted.
   */
  async requestPermission(): Promise<boolean> {
    if (Platform.OS === 'web') return false;

    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;

    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  },

  /**
   * Fires an immediate local notification for a habit violation.
   * Call this after processTransactions detects a violation.
   */
  async notifyViolation(
    habitName: string,
    merchantName: string,
    pledgeAmount: number
  ): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Habit broken: ${habitName}`,
        body: `${merchantName} triggered a $${pledgeAmount.toFixed(2)} pledge. Stay strong!`,
      },
      trigger: null, // immediate
    });
  },

  /**
   * Schedules (or re-schedules) a repeating weekly summary notification
   * every Monday at 8 AM. Cancels any existing weekly summary first.
   */
  async scheduleWeeklySummary(): Promise<void> {
    await this.cancelWeeklySummary();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Your weekly Covenant summary',
        body: 'Check in on your habits and see how your pledges are growing.',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: 2, // Monday (1 = Sunday, 2 = Monday)
        hour: 8,
        minute: 0,
      },
    });
  },

  async cancelWeeklySummary(): Promise<void> {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const weekly = scheduled.filter((n) =>
      n.content.title === 'Your weekly Covenant summary'
    );
    await Promise.all(weekly.map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)));
  },
};
