import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  AppState,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import PetDisplay from '../components/PetDisplay';
import { usePet } from '../context/PetContext';
import { useNavigation } from '@react-navigation/native';

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

  useEffect(() => {
    if (isRunning && startTimestamp === null) {
      setStartTimestamp(Date.now());
    }
  }, [isRunning, startTimestamp]);

  useEffect(() => {
    const handleAppStateChange = () => {
      if (isRunning && startTimestamp !== null) {
        const elapsed = Math.floor((Date.now() - startTimestamp) / 1000);
        setSecondsLeft(Math.max(initialSeconds - elapsed, 0));
      }
    };
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    return () => subscription.remove();
  }, [isRunning, startTimestamp, initialSeconds]);

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

  useEffect(() => {
    if (!isRunning && pausedAt === null && startTimestamp !== null) {
      setPausedAt(Date.now());
    }
    if (isRunning && pausedAt !== null && startTimestamp !== null) {
      const pauseDuration = Date.now() - pausedAt;
      setStartTimestamp(startTimestamp + pauseDuration);
      setPausedAt(null);
    }
  }, [isRunning]);

  const reset = () => {
    setSecondsLeft(initialSeconds);
    setStartTimestamp(Date.now());
    setPausedAt(null);
  };

  return { secondsLeft, reset, setSecondsLeft, setStartTimestamp };
}

export default function FocusScreen({ route }: any) {
  const { selectedPetId } = usePet();
  const navigation = useNavigation();

  // Get MM:SS and goal from route params
  const initialSeconds =
    typeof route?.params?.seconds === 'number' ? route.params.seconds : 25 * 60;
  const goal = route?.params?.goal || '';

  // Timer state
  const [isRunning, setIsRunning] = useState(true);
  const [isDone, setIsDone] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

  // Countdown hook
  const { secondsLeft, reset, setStartTimestamp } = usePersistentCountdown(
    initialSeconds,
    isRunning && !isDone,
  );

  // Track start timestamp for journal

  useEffect(() => {
    if (isRunning && sessionStartTime === null) {
      setSessionStartTime(Date.now());
    }
  }, [isRunning, sessionStartTime]);

  // Watch for timer completion
  useEffect(() => {
    if (secondsLeft <= 0 && !isDone) {
      setIsDone(true);
      setIsRunning(false);

      // Navigate to CompletionScreen
      navigation.navigate('Completion', {
        timeSpent: initialSeconds, // full session time
        goal,
        streakExtended: true, // replace with real streak logic
        startTime: sessionStartTime || Date.now() - initialSeconds * 1000, // fallback to calculated time
      });
    }
  }, [secondsLeft, isDone, navigation, initialSeconds, goal, sessionStartTime]);

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
  };

  return (
    <View style={styles.container}>
      {/* Top: Timer and Goal */}
      <View style={styles.top}>
        <Text style={styles.timer}>{formatTime(secondsLeft)}</Text>
        {goal ? (
          <View style={styles.goalContainer}>
            <MaterialIcons name="flag" size={16} color="#3C5A49" />
            <Text style={styles.goalText}>{goal}</Text>
          </View>
        ) : null}
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
        ) : null}
      </View>
    </View>
  );
}

// styles remain the same as before
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
  goalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    maxWidth: 300,
  },
  goalText: {
    fontSize: 16,
    color: '#3C5A49',
    marginLeft: 6,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  middle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottom: {
    flexDirection: 'row',
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
