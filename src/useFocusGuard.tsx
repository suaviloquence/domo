import { useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import {
  scheduleDistractionNotification,
  cancelAllNotifications,
} from './notifications';

type Options = {
  enabled: boolean;
  delaySeconds?: number;
  onDistraction?: () => void;
};

export function useFocusGuard({
  enabled,
  delaySeconds = 5,
  onDistraction,
}: Options) {
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const leftAppAt = useRef<number | null>(null);

  const handleAppStateChange = useCallback((nextState: AppStateStatus) => {
    console.log('App state changed:', appState.current, '->', nextState);

    // User leaves the app (active -> inactive/background)
    if (
      appState.current === 'active' &&
      (nextState === 'inactive' || nextState === 'background')
    ) {
      console.log('User left app, scheduling notification in', delaySeconds, 'seconds');
      leftAppAt.current = Date.now();
      scheduleDistractionNotification(delaySeconds);
    }

    // User comes back to the app
    if (
      (appState.current === 'inactive' || appState.current === 'background') &&
      nextState === 'active'
    ) {
      console.log('User returned to app');
      // Cancel any pending notification
      cancelAllNotifications();

      // Check if they were gone and trigger distraction callback
      if (leftAppAt.current !== null && onDistraction) {
        const timeAway = Date.now() - leftAppAt.current;
        console.log('User was away for', timeAway, 'ms');
        // Only trigger if they were actually away (not just a brief inactive state)
        if (timeAway > 1000) {
          onDistraction();
        }
      }
      leftAppAt.current = null;
    }

    appState.current = nextState;
  }, [delaySeconds, onDistraction]);

  useEffect(() => {
    if (!enabled) {
      console.log('FocusGuard disabled');
      return;
    }

    console.log('FocusGuard enabled');
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      console.log('FocusGuard cleanup');
      subscription.remove();
      cancelAllNotifications();
    };
  }, [enabled, handleAppStateChange]);
}
