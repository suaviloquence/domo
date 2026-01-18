import React, { useEffect, useState, useCallback } from 'react';
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
import { useFocusGuard } from '../useFocusGuard';

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
  const [distractionCount, setDistractionCount] = useState(0);

  // Focus guard - sends notification when user leaves app during focus
  const handleDistraction = useCallback(() => {
    setDistractionCount(prev => prev + 1);
    console.log('Distraction detected!');
  }, []);

  useFocusGuard({
    enabled: isRunning && !isDone,
    delaySeconds: 5,
    onDistraction: handleDistraction,
  });

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
      (navigation as any).navigate('Completion', {
        timeSpent: initialSeconds, // full session time
        goal,
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
        <View style={styles.timerContainer}>
          <Text style={styles.timer}>{formatTime(secondsLeft)}</Text>
        </View>
        {goal ? (
          <View style={styles.goalContainer}>
            <MaterialIcons name="flag" size={14} color="#6FAF8A" />
            <Text style={styles.goalText}>{goal}</Text>
          </View>
        ) : null}
      </View>

      {/* Middle: Pet */}
      <View style={styles.middle}>
        <PetDisplay selectedPetId={selectedPetId} size={240} />
      </View>

      {/* Bottom: Controls */}
      <View style={styles.bottom}>
        {!isDone ? (
          <>
            <TouchableOpacity
              style={[
                styles.button,
                isRunning ? styles.buttonSecondary : styles.buttonPrimary,
              ]}
              onPress={handlePauseResume}
              activeOpacity={0.8}
            >
              <MaterialIcons
                name={isRunning ? 'pause' : 'play-arrow'}
                size={20}
                color="white"
              />
              <Text style={styles.buttonText}>
                {isRunning ? 'pause' : 'resume'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary]}
              onPress={handleCancel}
              activeOpacity={0.8}
            >
              <MaterialIcons name="close" size={20} color="white" />
              <Text style={styles.buttonText}>cancel</Text>
            </TouchableOpacity>
          </>
        ) : null}
      </View>
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
    marginTop: 40,
  },
  timerContainer: {
    backgroundColor: '#E7F3EC',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#D4E5DA',
    shadowColor: '#3C5A49',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  timer: {
    fontSize: 48,
    fontWeight: '600',
    color: '#3C5A49',
    letterSpacing: 2,
  },
  goalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    maxWidth: 300,
    backgroundColor: '#E7F3EC',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D4E5DA',
  },
  goalText: {
    fontSize: 15,
    color: '#3C5A49',
    marginLeft: 6,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  middle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottom: {
    flexDirection: 'row',
    marginBottom: 32,
    justifyContent: 'center',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    borderWidth: 2,
    shadowColor: '#3C5A49',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonPrimary: {
    backgroundColor: '#6FAF8A',
    borderColor: '#5A9A75',
  },
  buttonSecondary: {
    backgroundColor: '#6B7D73',
    borderColor: '#5A6B63',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
