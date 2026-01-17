import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface ActionButtonRowProps {
  onFood: () => void;
  onClothes: () => void;
}

const ActionButtonRow: React.FC<ActionButtonRowProps> = ({ onFood, onClothes }) => (
  <View style={styles.buttonRow}>
    <TouchableOpacity style={styles.actionButton} onPress={onFood}>
      <Text style={styles.actionText}>Food</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.actionButton} onPress={onClothes}>
      <Text style={styles.actionText}>Clothes</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '60%',
    marginBottom: 40,
  },
  actionButton: {
    backgroundColor: '#ffd700',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  actionText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ActionButtonRow;
