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
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface ReflectionModalProps {
  visible: boolean;
  onSave: (stars: number, reflection: string) => void;
  onCancel: () => void;
}

const ReflectionModal: FC<ReflectionModalProps> = ({
  visible,
  onSave,
  onCancel,
}) => {
  const [stars, setStars] = useState<number>(0);
  const [reflection, setReflection] = useState<string>('');

  const handleSave = () => {
    if (stars === 0) {
      // Could show an alert, but for now just require at least 1 star
      return;
    }
    onSave(stars, reflection.trim());
    // Reset state
    setStars(0);
    setReflection('');
  };

  const handleCancel = () => {
    onCancel();
    // Reset state
    setStars(0);
    setReflection('');
  };

  const renderStar = (index: number) => {
    const isFilled = index < stars;
    return (
      <TouchableOpacity
        key={index}
        onPress={() => setStars(index + 1)}
        style={styles.starButton}
      >
        <MaterialIcons
          name={isFilled ? 'star' : 'star-border'}
          size={36}
          color={isFilled ? '#FFB800' : '#CCC'}
        />
      </TouchableOpacity>
    );
  };

  return (
    <Modal animationType="slide" transparent visible={visible}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.centeredView}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Reflect on Your Session</Text>
          <Text style={styles.subtitle}>Rate your productivity:</Text>

          <View style={styles.starsContainer}>
            {[0, 1, 2, 3, 4].map(renderStar)}
          </View>

          <Text style={styles.label}>Optional reflection:</Text>
          <TextInput
            style={styles.reflectionInput}
            placeholder="How did it go? What did you learn?"
            value={reflection}
            onChangeText={setReflection}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor="#999"
          />

          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, stars === 0 && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={stars === 0}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ReflectionModal;

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
  },
  modalView: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    color: '#3C5A49',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
    color: '#666',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  starButton: {
    padding: 4,
    marginHorizontal: 4,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: '#3C5A49',
    fontWeight: '600',
  },
  reflectionInput: {
    borderColor: '#6FAF8A',
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    fontSize: 16,
    minHeight: 100,
    backgroundColor: '#F6FAF7',
    color: '#3C5A49',
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#999',
    alignItems: 'center',
    marginRight: 6,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#6FAF8A',
    alignItems: 'center',
    marginLeft: 6,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
