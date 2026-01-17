import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface RateSessionModalProps {
  visible: boolean;
  onRate: (stars: number) => void;
  onCancel: () => void;
}

export default function RateSessionModal({
  visible,
  onRate,
  onCancel,
}: RateSessionModalProps) {
  const [selectedStars, setSelectedStars] = useState<number>(0);

  const handleRate = (stars: number) => {
    setSelectedStars(stars);
    onRate(stars);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <Text style={styles.title}>Rate your session</Text>
          <Text style={styles.subtitle}>How focused were you?</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map(star => (
              <TouchableOpacity
                key={star}
                onPress={() => handleRate(star)}
                style={styles.starButton}
              >
                <Text style={[styles.star, selectedStars >= star && styles.starSelected]}>
                  ★
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(60, 90, 73, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    minWidth: 280,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#3C5A49',
    marginBottom: 18,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  starButton: {
    padding: 6,
  },
  star: {
    fontSize: 32,
    color: '#ccc',
  },
  starSelected: {
    color: '#FFD700',
    textShadowColor: '#E7F3EC',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  cancelButton: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: '#E7F3EC',
  },
  cancelText: {
    color: '#3C5A49',
    fontWeight: '600',
    fontSize: 15,
  },
});
