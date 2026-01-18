import React, { FC, useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// App theme colors matching the rest of the app
const theme = {
  primary: '#6FAF8A', // Primary green for buttons, accents
  primaryDark: '#5A9A75', // Darker green for borders
  background: '#F6FAF7', // Main background
  cardBackground: '#E7F3EC', // Card/container backgrounds
  border: '#D4E5DA', // Borders
  textPrimary: '#3C5A49', // Primary text
  textSecondary: '#6B7D73', // Secondary text
  white: '#FFFFFF', // White text
};

interface TimerModalProps {
  visible: boolean;
  onStart: (minutes: number, seconds: number, goal: string) => void;
  onCancel: () => void;
}

const TimerModal: FC<TimerModalProps> = ({ visible, onStart, onCancel }) => {
  const [minutes, setMinutes] = useState<string>('');
  const [seconds, setSeconds] = useState<string>('');
  const [goal, setGoal] = useState<string>('');

  const handleStartPress = () => {
    const mins = parseInt(minutes, 10) || 0;
    const secs = parseInt(seconds, 10) || 0;
    if ((mins === 0 && secs === 0) || secs > 59 || mins < 0 || secs < 0) {
      Alert.alert('Please enter a valid time (MM:SS, 0–59 seconds).');
      return;
    }
    if (!goal.trim()) {
      Alert.alert('Please enter a goal.');
      return;
    }
    onStart(mins, secs, goal.trim());
    setMinutes('');
    setSeconds('');
    setGoal('');
  };

  const handleCancel = () => {
    onCancel();
    setMinutes('');
    setSeconds('');
    setGoal('');
  };

  return (
    <Modal animationType="slide" transparent visible={visible}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.centeredView}
      >
        <View style={styles.modalView}>
          <MaterialIcons name="timer" size={44} color={theme.primary} />
          <Text style={styles.modalTitle}>Set a Timer</Text>
          <View style={styles.timeRow}>
            <View style={styles.timeInputContainer}>
              <TextInput
                style={styles.timeInput}
                placeholder="MM"
                keyboardType="number-pad"
                value={minutes}
                onChangeText={setMinutes}
                maxLength={2}
                placeholderTextColor={theme.textSecondary}
              />
              <Text style={styles.timeLabel}>min</Text>
            </View>
            <Text style={styles.colon}>:</Text>
            <View style={styles.timeInputContainer}>
              <TextInput
                style={styles.timeInput}
                placeholder="SS"
                keyboardType="number-pad"
                value={seconds}
                onChangeText={setSeconds}
                maxLength={2}
                placeholderTextColor={theme.textSecondary}
              />
              <Text style={styles.timeLabel}>sec</Text>
            </View>
          </View>
          <TextInput
            style={styles.goalInput}
            placeholder="What is your goal?"
            value={goal}
            onChangeText={setGoal}
            multiline
            maxLength={80}
            placeholderTextColor={theme.textSecondary}
          />
          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartPress}
            >
              <Text style={styles.buttonText}>Start</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default TimerModal;

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(60, 90, 73, 0.4)',
    paddingHorizontal: 20,
  },
  modalView: {
    backgroundColor: theme.cardBackground,
    borderRadius: 20,
    padding: 28,
    elevation: 8,
    alignItems: 'center',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    borderWidth: 2,
    borderColor: theme.border,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 18,
    textAlign: 'center',
    color: theme.primary,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  timeInputContainer: {
    alignItems: 'center',
  },
  timeInput: {
    borderColor: theme.primary,
    borderWidth: 2,
    borderRadius: 10,
    padding: 8,
    width: 48,
    fontSize: 20,
    textAlign: 'center',
    backgroundColor: theme.background,
    marginBottom: 2,
    color: theme.textPrimary,
  },
  timeLabel: {
    fontSize: 12,
    color: theme.textPrimary,
    marginTop: -2,
  },
  colon: {
    fontSize: 28,
    fontWeight: 'bold',
    marginHorizontal: 6,
    color: theme.primary,
  },
  goalInput: {
    borderColor: theme.primary,
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 12,
    marginBottom: 18,
    fontSize: 16,
    minHeight: 48,
    width: 220,
    backgroundColor: theme.cardBackground,
    textAlignVertical: 'top',
    color: theme.textPrimary,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 6,
  },
  cancelButton: {
    backgroundColor: theme.textSecondary,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
    flex: 1,
    marginRight: 10,
    elevation: 2,
    borderWidth: 1.5,
    borderColor: '#5A6B63',
  },
  startButton: {
    backgroundColor: theme.primary,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
    flex: 1,
    elevation: 2,
    borderWidth: 2,
    borderColor: theme.primaryDark,
  },
  buttonText: {
    color: theme.white,
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 16,
    letterSpacing: 1,
  },
});
