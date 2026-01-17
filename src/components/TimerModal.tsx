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
} from 'react-native';

// Pastel latte palette
const palette = {
  base: '#FFF7ED', // Latte base
  pink: '#FFD6EC', // Accent, buttons, highlights
  yellow: '#FFFACD', // Journal button, icons
  blue: '#D6F0FF', // Info, secondary backgrounds
  green: '#DFFFE0', // Success, hunger meter
  purple: '#E6E6FF', // Happiness meter, accents
  orange: '#FFE5B4', // Food meter
  brown: '#EAD7C2', // Borders, text, latte accent
  gray: '#F3F3F3', // Card backgrounds, containers
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
      alert('Please enter a valid time (MM:SS, 0–59 seconds).');
      return;
    }
    if (!goal.trim()) {
      alert('Please enter a goal.');
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
          <Text style={styles.emoji}>⏱️</Text>
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
                placeholderTextColor={palette.brown}
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
                placeholderTextColor={palette.brown}
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
            placeholderTextColor={palette.brown}
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
  },
  modalView: {
    backgroundColor: palette.base,
    borderRadius: 20,
    padding: 28,
    elevation: 8,
    alignItems: 'center',
    shadowColor: palette.pink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    borderWidth: 2,
    borderColor: palette.brown,
  },
  emoji: {
    fontSize: 44,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 18,
    textAlign: 'center',
    color: palette.pink,
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
    borderColor: palette.pink,
    borderWidth: 2,
    borderRadius: 10,
    padding: 8,
    width: 48,
    fontSize: 20,
    textAlign: 'center',
    backgroundColor: palette.yellow,
    marginBottom: 2,
    color: palette.brown,
  },
  timeLabel: {
    fontSize: 12,
    color: palette.brown,
    marginTop: -2,
  },
  colon: {
    fontSize: 28,
    fontWeight: 'bold',
    marginHorizontal: 6,
    color: palette.pink,
  },
  goalInput: {
    borderColor: palette.pink,
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 12,
    marginBottom: 18,
    fontSize: 16,
    minHeight: 48,
    width: 220,
    backgroundColor: palette.gray,
    textAlignVertical: 'top',
    color: palette.brown,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 6,
  },
  cancelButton: {
    backgroundColor: palette.brown,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
    flex: 1,
    marginRight: 10,
    elevation: 2,
  },
  startButton: {
    backgroundColor: palette.pink,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
    flex: 1,
    elevation: 2,
  },
  buttonText: {
    color: palette.base,
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 16,
    letterSpacing: 1,
  },
});
