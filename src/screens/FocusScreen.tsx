import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  AppState,
  Modal,
} from 'react-native';
import PetDisplay from '../components/PetDisplay';
import { usePet } from '../context/PetContext';
import RateSessionModal from '../components/RateSessionModal';

// Helper to format MM:SS
function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return `${mm}:${ss}`;
}

// Persistent countdown using system time
function usePersistentCountdown(initialSeconds: number, isRunning: boolean) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [startTimestamp, setStartTimestamp] = useState<number | null>(null);
  const [pausedAt, setPausedAt] = useState<number | null>(null);

  // Start timer
  useEffect(() => {
    if (isRunning && startTimestamp === null) {
      setStartTimestamp(Date.now());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);

  // Listen for app state changes to update timer
  useEffect(() => {
    const handleAppStateChange = () => {
      if (isRunning && startTimestamp !== null) {
        const elapsed = Math.floor((Date.now() - startTimestamp) / 1000);
        setSecondsLeft(Math.max(initialSeconds - elapsed, 0));
      }
    };
    AppState.addEventListener('change', handleAppStateChange);
    return () => {
      // Use AppState.removeEventListener only if available, otherwise use AppStateSubscription.remove()
      // But in React Native >=0.65, addEventListener returns a subscription object with remove()
      // So let's use that pattern for compatibility:
      // @ts-ignore
      if (typeof AppState.removeEventListener === 'function') {
        // @ts-ignore
        AppState.removeEventListener('change', handleAppStateChange);
      }
    };
  }, [isRunning, startTimestamp, initialSeconds]);

  // Regular interval update
  useEffect(() => {
    if (!isRunning || secondsLeft <= 0) return;
    const interval = setInterval(() => {
      if (startTimestamp !== null) {
        const elapsed = Math.floor((Date.now() - startTimestamp) / 1000);
        setSecondsLeft(Math.max(initialSeconds - elapsed, 0));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, startTimestamp, initialSeconds, secondsLeft]);

  // Pause logic
  useEffect(() => {
    if (!isRunning && pausedAt === null && startTimestamp !== null) {
      setPausedAt(Date.now());
    }
    if (isRunning && pausedAt !== null && startTimestamp !== null) {
      // Adjust startTimestamp by pause duration
      const pauseDuration = Date.now() - pausedAt;
      setStartTimestamp(startTimestamp + pauseDuration);
      setPausedAt(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);

  // Reset
  const reset = () => {
    setSecondsLeft(initialSeconds);
    setStartTimestamp(Date.now());
    setPausedAt(null);
  };

  return { secondsLeft, reset, setSecondsLeft, setStartTimestamp };
}

export default function FocusScreen({ navigation, route }: any) {
  const { selectedPetId, addJournalEntry } = usePet();

  // Get MM:SS and goal from route params
  const initialSeconds =
    typeof route?.params?.seconds === 'number' ? route.params.seconds : 25 * 60;
  const goal = route?.params?.goal || '';

  // Timer state
  const [isRunning, setIsRunning] = useState(true);
  const [isDone, setIsDone] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);

  // Journal session info
  const [sessionStart, setSessionStart] = useState<number>(Date.now());
  const [sessionDuration, setSessionDuration] =
    useState<number>(initialSeconds);

  // Countdown hook
  const { secondsLeft, reset, setSecondsLeft, setStartTimestamp } =
    usePersistentCountdown(initialSeconds, isRunning && !isDone);

  // Watch for timer completion
  useEffect(() => {
    if (secondsLeft <= 0 && !isDone) {
      setIsDone(true);
      setIsRunning(false);
      setSessionDuration(initialSeconds);
      setShowRateModal(true);
    }
    // eslint-disable-next-line
  }, [secondsLeft, isDone]);

  // Pause/resume
  const handlePauseResume = () => setIsRunning(v => !v);

  // Cancel session
  const handleCancel = () => {
    navigation.goBack();
  };

  // Reset session
  const handleReset = () => {
    reset();
    setIsRunning(true);
    setIsDone(false);
    setSessionStart(Date.now());
    setShowRateModal(false);
  };

  // Handle rating modal completion
  const handleRateSession = (stars: number) => {
    // Save journal entry
    addJournalEntry({
      start: sessionStart,
      duration: initialSeconds,
      goal,
      rating: stars,
    });
    setShowRateModal(false);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Top: Timer and Goal */}
      <View style={styles.top}>
        <Text style={styles.timer}>{formatTime(secondsLeft)}</Text>
        {goal ? <Text style={styles.goalText}>🎯 {goal}</Text> : null}
      </View>

      {/* Middle: Pet */}
      <View style={styles.middle}>
        <PetDisplay selectedPetId={selectedPetId} />
      </View>

      {/* Bottom: Controls */}
      <View style={styles.bottom}>
        {!isDone ? (
          <>
            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: isRunning ? '#999' : '#6FAF8A' },
              ]}
              onPress={handlePauseResume}
            >
              <Text style={styles.buttonText}>
                {isRunning ? 'pause' : 'resume'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#6FAF8A' }]}
              onPress={handleCancel}
            >
              <Text style={styles.buttonText}>cancel</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#6FAF8A' }]}
            onPress={() => setShowRateModal(true)}
          >
            <Text style={styles.buttonText}>rate session</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Rate Session Modal */}
      <RateSessionModal
        visible={showRateModal}
        onRate={handleRateSession}
        onCancel={() => {
          setShowRateModal(false);
          navigation.goBack();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6FAF7',
    padding: 24,
    justifyContent: 'space-between',
  },
  top: {
    alignItems: 'center',
    marginTop: 24,
  },
  timer: {
    fontSize: 52,
    fontWeight: '800',
    marginBottom: 8,
  },
  goalText: {
    fontSize: 16,
    color: '#3C5A49',
    marginTop: 10,
    textAlign: 'center',
    fontStyle: 'italic',
    maxWidth: 300,
  },
  middle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottom: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    justifyContent: 'center',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
