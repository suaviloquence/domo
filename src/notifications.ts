import { Notifications } from 'react-native-notifications';
import { Platform } from 'react-native';

let lastNotificationId: number | null = null;

export async function requestPermission() {
  try {
    if (Platform.OS === 'ios') {
      const granted = await Notifications.ios.requestPermissions();
      console.log('Notification permissions:', granted);
    }
    // Android permissions are granted by default for local notifications
  } catch (err) {
    console.warn('Notification permissions denied', err);
  }
}

export function scheduleDistractionNotification(seconds: number) {
  const fireDate = new Date(Date.now() + seconds * 1000);

  // Schedule a local notification
  const notification = Notifications.postLocalNotification({
    title: 'Stay focused!',
    body: "Your pet misses you! Come back to your focus session.",
    sound: 'default',
    // For iOS scheduled notifications
    fireDate: fireDate.toISOString(),
    // For Android
    ...(Platform.OS === 'android' && {
      channel: 'focus-reminders',
    }),
  } as any);

  lastNotificationId = notification;
  console.log('Scheduled notification for', fireDate.toISOString());
  return notification;
}

export function cancelAllNotifications() {
  if (Platform.OS === 'ios') {
    Notifications.ios.cancelAllLocalNotifications();
  } else {
    // Android
    if (lastNotificationId !== null) {
      Notifications.cancelLocalNotification(lastNotificationId);
    }
  }
  lastNotificationId = null;
}

export function cancelNotification(notificationId: number) {
  Notifications.cancelLocalNotification(notificationId);
}
