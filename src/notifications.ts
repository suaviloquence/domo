import { Notifications } from 'react-native-notifications';

export async function requestPermission() {
  try {
    await Notifications.ios.requestPermissions();
    console.log('Notification permissions granted');
  } catch (err) {
    console.warn('Notification permissions denied', err);
  }
}

export function scheduleDistractionNotification(seconds: number) {
  const fireDate = new Date(Date.now() + seconds * 1000).toISOString();

  // Schedule a system-level notification
  return Notifications.postLocalNotification({
    title: 'Stay focused 🌱',
    body: "Your pet gets hungry if you don't come back!",
    fireDate,
  });
}

export function cancelNotification(notificationId: string) {
  return Notifications.cancelLocalNotification(notificationId);
}
