import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import {
  scheduleDistractionNotification,
  cancelNotification,
} from './notifications';

type Options = {
  enabled: boolean;
  delaySeconds?: number;
  onDistraction: () => void;
};

export function useFocusGuard({
  enabled,
  delaySeconds = 10,
  onDistraction,
}: Options) {
  const appState = useRef(AppState.currentState);
  const notificationScheduled = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const sub = AppState.addEventListener('change', async nextState => {
      // User leaves the app
      if (
        appState.current === 'active' &&
        (nextState === 'inactive' || nextState === 'background')
      ) {
        // Schedule local notification
        await scheduleDistractionNotification(delaySeconds);
        notificationScheduled.current = true;
      }

      // User comes back to the app
      if (appState.current !== 'active' && nextState === 'active') {
        if (notificationScheduled.current) {
          // Cancel the notification since they returned
          // (optional; on iOS it will disappear automatically if delivered)
          // cancelNotification(notificationId); // only if you track id

          // Apply distraction consequence
          onDistraction();
          notificationScheduled.current = false;
        }
      }

      appState.current = nextState;
    });

    return () => sub.remove();
  }, [enabled, delaySeconds, onDistraction]);
}
